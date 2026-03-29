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
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gigRef);
    if (!snap.exists()) throw new Error("Gig not found.");
    const data = snap.data() as Gig;
    if (data.status !== "open") throw new Error("Gig already taken.");
    tx.update(gigRef, { status: "in_progress", acceptedBy: acceptorUid });
  });
}

/** Atomically complete a gig: deduct Karma from buyer, credit seller */
export async function completeGig(gigId: string): Promise<void> {
  const gigRef = doc(db, "gigs", gigId);
  await runTransaction(db, async (tx) => {
    const gigSnap = await tx.get(gigRef);
    if (!gigSnap.exists()) throw new Error("Gig not found.");
    const gig = gigSnap.data() as Gig;
    if (gig.status !== "in_progress") throw new Error("Gig is not in progress.");

    // Determine buyer and seller
    const { type, postedBy, acceptedBy, karmaPrice } = gig;
    const buyerUid = type === "looking_for" ? postedBy : acceptedBy!;
    const sellerUid = type === "looking_for" ? acceptedBy! : postedBy;

    const buyerRef = doc(db, "users", buyerUid);
    const sellerRef = doc(db, "users", sellerUid);

    const [buyerSnap, sellerSnap] = await Promise.all([
      tx.get(buyerRef),
      tx.get(sellerRef),
    ]);

    const buyerBalance: number = buyerSnap.data()?.karmaBalance ?? 0;
    if (buyerBalance < karmaPrice) {
      throw new Error("Insufficient Karma balance.");
    }

    tx.update(buyerRef, { karmaBalance: buyerBalance - karmaPrice });
    tx.update(sellerRef, {
      karmaBalance: (sellerSnap.data()?.karmaBalance ?? 0) + karmaPrice,
    });
    tx.update(gigRef, { status: "complete" });

    // Log transaction (addDoc in a transaction requires a collectionRef)
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
