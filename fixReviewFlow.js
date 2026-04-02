const fs = require('fs');

const helpersPath = 'lib/firestore-helpers.ts';
let helpersContent = fs.readFileSync(helpersPath, 'utf8');

const submitReviewFunc = `
export async function submitReview(gigId: string, rating: number, reviewText?: string): Promise<void> {
  const gigRef = doc(db, "gigs", gigId);
  await runTransaction(db, async (tx) => {
    const gigSnap = await tx.get(gigRef);
    if (!gigSnap.exists()) throw new Error("Gig not found.");
    const gig = gigSnap.data() as Gig;
    if (gig.status !== "complete") throw new Error("Gig must be complete to review.");

    const isLookingFor = gig.type === "looking_for";
    const sellerUid = isLookingFor ? gig.acceptedBy! : gig.postedBy;
    const buyerUid = isLookingFor ? gig.postedBy : gig.acceptedBy!;

    const sellerRef = doc(db, "users", sellerUid);
    const sellerSnap = await tx.get(sellerRef);
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
      text: \`You received a \${rating}-star review for "\${gig.title}"!\`,
      link: "/profile",
      read: false,
      createdAt: serverTimestamp(),
    });
  });
}
`;

if (!helpersContent.includes('export async function submitReview')) {
  helpersContent += '\n' + submitReviewFunc;
  fs.writeFileSync(helpersPath, helpersContent);
}

const gigsPath = 'app/(app)/my-gigs/page.tsx';
let gigsContent = fs.readFileSync(gigsPath, 'utf8');

if (!gigsContent.includes('submitReview')) {
  gigsContent = gigsContent.replace('import { completeGigWithReview } from "@/lib/firestore-helpers";', 'import { completeGigWithReview, completeGig, submitReview } from "@/lib/firestore-helpers";');
}

const currentHandleComplete = `const handleMarkComplete = (gig: Gig) => {
    if (!user || gig.status !== "in_progress") return;
    setReviewGig(gig);
  };`;

const newHandleComplete = `const handleMarkComplete = async (gig: Gig) => {
    if (!user || gig.status !== "in_progress") return;
    const confirmed = confirm(\`Mark "\${gig.title}" as complete and transfer \${gig.karmaPrice} Karma?\`);
    if (!confirmed) return;
    try {
      await completeGig(gig.id);
      toast.success(\`?? Gig complete! \${gig.karmaPrice} Karma transferred.\`);
      setGigs(prev => prev.map(g => g.id === gig.id ? { ...g, status: "complete" } as Gig : g));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to map complete.");
    }
  };`;

if (gigsContent.includes(currentHandleComplete)) {
  gigsContent = gigsContent.replace(currentHandleComplete, newHandleComplete);
}

const currentHandleReview = `const handleReviewSubmit = async (rating: number, reviewText: string) => {
    if (!user || !reviewGig) return;
    try {
      await completeGigWithReview(reviewGig.id, rating, reviewText);
      toast.success(\`?? Gig complete! \${reviewGig.karmaPrice} Karma transferred & review submitted.\`);
      setGigs((prev) => prev.map((g) => (g.id === reviewGig.id ? { ...g, status: "complete" } as Gig : g)));
      setReviewGig(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to complete gig.");
      setReviewGig(null);
    }
  };`;

const newHandleReview = `const handleReviewSubmit = async (rating: number, reviewText: string) => {
    if (!user || !reviewGig) return;
    try {
      await submitReview(reviewGig.id, rating, reviewText);
      toast.success(\`Review submitted successfully!\`);
      // Optionally mark that they reviewed locally so they can't click it again this session
      setGigs(prev => prev.map(g => g.id === reviewGig.id ? { ...g, reviewedLocally: true } as Gig & {reviewedLocally?: boolean} : g));
      setReviewGig(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit review.");
      setReviewGig(null);
    }
  };`;

if (gigsContent.includes(currentHandleReview)) {
  gigsContent = gigsContent.replace(currentHandleReview, newHandleReview);
}

// Add the Leave Review button near the Complete badge
const completeBadgeOriginal = `{/* Complete badge */}
                  {gig.status === "complete" && (
                    <span className="flex items-center gap-2 px-5 py-2 text-green-400 bg-green-500/10 border border-green-500/20 font-bold rounded-xl text-sm">
                      <PartyPopper size={15} /> {activeTab === "accepted" ? \`+\${gig.karmaPrice} Karma Earned!\` : \`Completed\`}
                    </span>
                  )}`;

const newButtons = `{/* Complete badge and Review button */}
                  {gig.status === "complete" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-2 px-5 py-2 text-green-400 bg-green-500/10 border border-green-500/20 font-bold rounded-xl text-sm">
                        <PartyPopper size={15} /> {activeTab === "accepted" ? \`+\${gig.karmaPrice} Karma Earned!\` : \`Completed\`}
                      </span>
                      {isBuyer && !(gig as any).reviewedLocally && (
                        <button
                          onClick={() => setReviewGig(gig)}
                          className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-black hover:bg-yellow-400 font-bold rounded-xl transition shadow-lg shadow-yellow-500/30"
                        >
                          <Star size={16} className="fill-black" /> Leave a Review
                        </button>
                      )}
                    </div>
                  )}`;

if (gigsContent.includes(completeBadgeOriginal)) {
  gigsContent = gigsContent.replace(completeBadgeOriginal, newButtons);
}

fs.writeFileSync(gigsPath, gigsContent);
