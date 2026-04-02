import { db } from "./firebase";
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, runTransaction, query, where, getDocs, deleteDoc, writeBatch } from "firebase/firestore";

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
  flaggedBy?: string[];
  hasBeenReviewed?: boolean;
}

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

export async function completeGig(gigId: string): Promise<void> {
  const gigRef = doc(db, "gigs", gigId);
  await runTransaction(db, async (tx) => {
    const gigSnap = await tx.get(gigRef);
    if (!gigSnap.exists()) throw new Error("Gig not found.");
    const gig = gigSnap.data() as Gig;
    if (gig.status !== "in_progress") throw new Error("Gig is not in progress.");
    const { type, postedBy, acceptedBy, karmaPrice } = gig;
    const sellerUid = type === "looking_for" ? acceptedBy! : postedBy;
    const sellerRef = doc(db, "users", sellerUid);
    const sellerSnap = await tx.get(sellerRef);
    tx.update(sellerRef, {
      karmaBalance: (sellerSnap.data()?.karmaBalance ?? 0) + karmaPrice,
    });
    tx.update(gigRef, { status: "complete" });
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

export async function flagGig(gigId: string, flaggerUid: string): Promise<void> {
  const gigRef = doc(db, "gigs", gigId);
  await runTransaction(db, async (tx) => {
    const gigSnap = await tx.get(gigRef);
    if (!gigSnap.exists()) throw new Error("Gig not found.");
    let dbGig = gigSnap.data();
    if (dbGig.status !== "open") throw new Error("Only open gigs can be flagged.");
    let flaggedBy: string[] = Array.isArray(dbGig.flaggedBy) ? dbGig.flaggedBy : [];
    if (flaggedBy.includes(flaggerUid)) throw new Error("You have already flagged this gig.");
    flaggedBy.push(flaggerUid);
    if (flaggedBy.length === 3) {
      const posterRef = doc(db, "users", dbGig.postedBy);
      const posterSnap = await tx.get(posterRef);
      
      const flaggerInfos = [];
      for (const fUid of flaggedBy) {
        const fSnap = await tx.get(doc(db, "users", fUid));
        flaggerInfos.push({ fUid, fSnap });
      }

      tx.update(gigRef, { status: "removed", flaggedBy });
      if (posterSnap.exists()) {
        const currentKarma = posterSnap.data().karmaBalance ?? 0;
        tx.update(posterRef, { karmaBalance: currentKarma - 10 });
        const penaltyNotif = doc(collection(db, "notifications"));
        tx.set(penaltyNotif, {
          userId: dbGig.postedBy,
          type: "penalty",
          text: `Your gig "${dbGig.title}" was removed due to community flags. -10 Karma.`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
      for (const info of flaggerInfos) {
        if (info.fSnap.exists()) {
          const fKarma = info.fSnap.data().karmaBalance ?? 0;
          tx.update(doc(db, "users", info.fUid), { karmaBalance: fKarma + 2 });
          const rewardNotif = doc(collection(db, "notifications"));
          tx.set(rewardNotif, {
            userId: info.fUid,
            type: "reward",
            text: `A gig you flagged was removed. You earned +2 Karma for moderating!`,
            read: false,
            createdAt: serverTimestamp(),
          });
        }
      }
    } else {
      tx.update(gigRef, { flaggedBy });
    }
  });
}

export async function completeGigWithReview(gigId: string, rating: number, reviewText?: string): Promise<void> {
  const gigRef = doc(db, "gigs", gigId);
  await runTransaction(db, async (tx) => {
    const gigSnap = await tx.get(gigRef);
    if (!gigSnap.exists()) throw new Error("Gig not found.");
    const gig = gigSnap.data() as Gig;
    if (gig.status !== "in_progress") throw new Error("Gig is not in progress.");
    const isLookingFor = gig.type === "looking_for";
    const sellerUid = isLookingFor ? gig.acceptedBy! : gig.postedBy;
    const buyerUid = isLookingFor ? gig.postedBy : gig.acceptedBy!;
    const sellerRef = doc(db, "users", sellerUid);
    const sellerSnap = await tx.get(sellerRef);
    if (!sellerSnap.exists()) throw new Error("Seller profile not found.");
    tx.update(gigRef, { status: "complete" });
    if (!sellerSnap.exists()) throw new Error("Seller profile not found.");
    const sellerData = sellerSnap.data();
    const currentKarma = sellerData.karmaBalance ?? 0;
    const currentTotalReviews = sellerData.reviewCount ?? 0;
    const currentAvgRating = sellerData.rating ?? 0;
    const newTotalReviews = currentTotalReviews + 1;
    const newAvgRating = ((currentAvgRating * currentTotalReviews) + rating) / newTotalReviews;
    tx.update(sellerRef, {
      karmaBalance: currentKarma + gig.karmaPrice,
      rating: newAvgRating,
      reviewCount: newTotalReviews
    });
    const newReviewRef = doc(collection(sellerRef, "reviews"));
    tx.set(newReviewRef, {
      gigId,
      reviewerUid: buyerUid,
      rating,
      comment: reviewText || "",
      createdAt: serverTimestamp()
    });
    const txRef = doc(collection(db, "transactions"));
    tx.set(txRef, {
      gigId,
      buyerUid,
      sellerUid,
      karmaAmount: gig.karmaPrice,
      completedAt: serverTimestamp(),
    });
    const notifRef = doc(collection(db, "notifications"));
    tx.set(notifRef, {
      userId: sellerUid,
      sourceId: buyerUid,
      type: "gig_completed",
      text: `Your gig "${gig.title}" was completed! +${gig.karmaPrice} Karma and a ${rating}-star review.`,
      link: "/profile",
      read: false,
      createdAt: serverTimestamp(),
    });
  });
}


export async function submitReview(gigId: string, rating: number, reviewText?: string): Promise<void> {
  const gigRef = doc(db, "gigs", gigId);
  await runTransaction(db, async (tx) => {
    const gigSnap = await tx.get(gigRef);
    if (!gigSnap.exists()) throw new Error("Gig not found.");
    const gig = gigSnap.data() as Gig;
    if (gig.status !== "complete") throw new Error("Gig must be complete to review.");
    if (gig.hasBeenReviewed) throw new Error("Gig already reviewed.");
    const isLookingFor = gig.type === "looking_for";
    const sellerUid = isLookingFor ? gig.acceptedBy! : gig.postedBy;
    const buyerUid = isLookingFor ? gig.postedBy : gig.acceptedBy!;

    const sellerRef = doc(db, "users", sellerUid);
    const sellerSnap = await tx.get(sellerRef);
    if (!sellerSnap.exists()) throw new Error("Seller profile not found.");
    tx.update(gigRef, { hasBeenReviewed: true });
    if (!sellerSnap.exists()) throw new Error("Seller profile not found.");
    
    const sellerData = sellerSnap.data();
    const currentTotalReviews = sellerData.reviewCount ?? 0;
    const currentAvgRating = sellerData.rating ?? 0;
    
    const newTotalReviews = currentTotalReviews + 1;
    const newAvgRating = ((currentAvgRating * currentTotalReviews) + rating) / newTotalReviews;

    tx.update(sellerRef, {
      rating: newAvgRating,
      reviewCount: newTotalReviews
    });

    const newReviewRef = doc(collection(sellerRef, "reviews"));
    tx.set(newReviewRef, {
      gigId,
      reviewerUid: buyerUid,
      rating,
      comment: reviewText || "",
      createdAt: serverTimestamp()
    });

    const notifRef = doc(collection(db, "notifications"));
    tx.set(notifRef, {
      userId: sellerUid,
      sourceId: buyerUid,
      type: "new_review",
      text: `You received a ${rating}-star review for "${gig.title}"!`,
      link: "/profile",
      read: false,
      createdAt: serverTimestamp(),
    });
  });
}


export async function deleteAccountData(uid: string): Promise<void> {
  const batch = writeBatch(db);

  // 1. Find all gigs posted by this user
  const gigsQuery = query(collection(db, "gigs"), where("postedBy", "==", uid));
  const gigsSnap = await getDocs(gigsQuery);
  gigsSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 2. Find all chats this user is a participant of
  const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", uid));
  const chatsSnap = await getDocs(chatsQuery);
  chatsSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 3. Delete the user profile document itself
  batch.delete(doc(db, "users", uid));

  // Execute the mass deletion
  await batch.commit();
}
