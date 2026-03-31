import {
  db,
} from "./firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

export interface Gig {
  id: string;
  type: "looking_for" | "offering";
  category: string;
  title: string;
  description: string;
  karmaPrice: number;
  postedBy: string;
  postedByName: string;
  status: "open" | "in_progress" | "complete";
  acceptedBy?: string;
  createdAt: unknown;
}

/** Lock a gig to acceptor (first-write-wins via transaction) */
export async function acceptGig(gigId: string, acceptorUid: string): Promise<void> {
  const gigRef = doc(db, "gigs", gigId);
  const acceptorRef = doc(db, "users", acceptorUid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gigRef);
    if (!snap.exists()) throw new Error("Gig not found.");
    const data = snap.data() as Gig;
    if (data.status !== "open") throw new Error("Gig already taken.");
    
    if (data.type === "offering") {
      const acceptorSnap = await tx.get(acceptorRef);
      const acceptorBalance = acceptorSnap.data()?.karmaBalance ?? 0;
      if (acceptorBalance < data.karmaPrice) {
        throw new Error("Insufficient Karma to accept this gig.");
      }
      tx.update(acceptorRef, { karmaBalance: acceptorBalance - data.karmaPrice });
    }

    tx.update(gigRef, { status: "in_progress", acceptedBy: acceptorUid });
  });
}

/**
 * Atomically complete a gig: credit Seller with escrowed Karma.
 * NOTE: Karma was already deducted from the Buyer at gig creation (looking_for)
 * or at acceptance (offering). This function ONLY credits the Seller.
 */
export async function completeGig(gigId: string): Promise<void> {
  const gigRef = doc(db, "gigs", gigId);
  await runTransaction(db, async (tx) => {
    const gigSnap = await tx.get(gigRef);
    if (!gigSnap.exists()) throw new Error("Gig not found.");
    const gig = gigSnap.data() as Gig;
    if (gig.status !== "in_progress") throw new Error("Gig is not in progress.");

    // Determine seller (the service provider who receives Karma)
    const { type, postedBy, acceptedBy, karmaPrice } = gig;
    const sellerUid = type === "looking_for" ? acceptedBy! : postedBy;

    const sellerRef = doc(db, "users", sellerUid);
    const sellerSnap = await tx.get(sellerRef);

    // Only credit the Seller — Buyer's Karma was already escrowed upfront
    tx.update(sellerRef, {
      karmaBalance: (sellerSnap.data()?.karmaBalance ?? 0) + karmaPrice,
    });
    tx.update(gigRef, { status: "complete" });

    // Log transaction
    const buyerUid = type === "looking_for" ? postedBy : acceptedBy!;
    const txRef = doc(collection(db, "transactions"));
    tx.set(txRef, {
      gigId,
      buyerUid,
      sellerUid,
      karmaAmount: karmaPrice,
      completedAt: serverTimestamp(),
    });
  });
}
