const fs = require('fs');
const path = require('path');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/lib/firestore-helpers.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix completeGigWithReview
content = content.replace(
  '    tx.update(gigRef, { status: "complete" });\n    const sellerRef = doc(db, "users", sellerUid);\n    const sellerSnap = await tx.get(sellerRef);',
  '    const sellerRef = doc(db, "users", sellerUid);\n    const sellerSnap = await tx.get(sellerRef);\n    if (!sellerSnap.exists()) throw new Error("Seller profile not found.");\n    tx.update(gigRef, { status: "complete" });'
);

// 2. Fix submitReview
content = content.replace(
  '    tx.update(gigRef, { hasBeenReviewed: true });\n\n    const isLookingFor = gig.type === "looking_for";\n    const sellerUid = isLookingFor ? gig.acceptedBy! : gig.postedBy;\n    const buyerUid = isLookingFor ? gig.postedBy : gig.acceptedBy!;\n\n    const sellerRef = doc(db, "users", sellerUid);\n    const sellerSnap = await tx.get(sellerRef);',
  '    const isLookingFor = gig.type === "looking_for";\n    const sellerUid = isLookingFor ? gig.acceptedBy! : gig.postedBy;\n    const buyerUid = isLookingFor ? gig.postedBy : gig.acceptedBy!;\n\n    const sellerRef = doc(db, "users", sellerUid);\n    const sellerSnap = await tx.get(sellerRef);\n    if (!sellerSnap.exists()) throw new Error("Seller profile not found.");\n    tx.update(gigRef, { hasBeenReviewed: true });'
);

// 3. Fix flagGig
content = content.replace(
  '    if (flaggedBy.length === 3) {\n      tx.update(gigRef, { status: "removed", flaggedBy });\n      const posterRef = doc(db, "users", dbGig.postedBy);\n      const posterSnap = await tx.get(posterRef);\n      if (posterSnap.exists()) {\n        const currentKarma = posterSnap.data().karmaBalance ?? 0;\n        tx.update(posterRef, { karmaBalance: currentKarma - 10 });\n        const penaltyNotif = doc(collection(db, "notifications"));\n        tx.set(penaltyNotif, {\n          userId: dbGig.postedBy,\n          type: "penalty",\n          text: `Your gig "${dbGig.title}" was removed due to community flags. -10 Karma.`,\n          read: false,\n          createdAt: serverTimestamp(),\n        });\n      }\n      for (const fUid of flaggedBy) {\n        const flaggerRef = doc(db, "users", fUid);\n        const fSnap = await tx.get(flaggerRef);\n        if (fSnap.exists()) {\n          const fKarma = fSnap.data().karmaBalance ?? 0;\n          tx.update(flaggerRef, { karmaBalance: fKarma + 2 });\n          const rewardNotif = doc(collection(db, "notifications"));\n          tx.set(rewardNotif, {\n            userId: fUid,\n            type: "reward",\n            text: `A gig you flagged was removed. You earned +2 Karma for moderating!`,\n            read: false,\n            createdAt: serverTimestamp(),\n          });\n        }\n      }\n    } else {',
  `    if (flaggedBy.length === 3) {
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
          text: \`Your gig "\${dbGig.title}" was removed due to community flags. -10 Karma.\`,
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
            text: \`A gig you flagged was removed. You earned +2 Karma for moderating!\`,
            read: false,
            createdAt: serverTimestamp(),
          });
        }
      }
    } else {`
);

fs.writeFileSync(file, content);
console.log('Transaction order fixed!');
