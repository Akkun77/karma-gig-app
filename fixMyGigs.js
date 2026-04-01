const fs = require('fs');
let content = fs.readFileSync('app/(app)/my-gigs/page.tsx', 'utf8');

if (!content.includes('completeGigWithReview')) {
  content = content.replace(
    'import { db } from "@/lib/firebase";',
    'import { db } from "@/lib/firebase";\nimport { completeGigWithReview } from "@/lib/firestore-helpers";\nimport { ReviewModal } from "@/components/ReviewModal";'
  );
}

if (!content.includes('setReviewGig')) {
  content = content.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [reviewGig, setReviewGig] = useState<Gig | null>(null);'
  );
}

const newHandler = `
  const handleMarkComplete = (gig: Gig) => {
    if (!user || gig.status !== "in_progress") return;
    setReviewGig(gig);
  };

  const handleReviewSubmit = async (rating: number, reviewText: string) => {
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
  };
`;

const handlerStart = content.indexOf('const handleMarkComplete = async (gig: Gig) => {');
const handlerEnd = content.indexOf('const handleDeleteGig = async (gig: Gig) => {');

if (handlerStart !== -1 && handlerEnd !== -1 && !content.includes('handleReviewSubmit')) {
  content = content.slice(0, handlerStart) + newHandler + '\n  ' + content.slice(handlerEnd);
}

const modalJSX = `
      {reviewGig && (
        <ReviewModal
          isOpen={!!reviewGig}
          sellerName={reviewGig.type === "offering" ? reviewGig.postedByName : "Service Provider"}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
`;

if (!content.includes('<ReviewModal')) {
  // Replace the final </div>\n  );\n}
  content = content.replace(/<\/div>\s*\);\s*\}\s*$/, modalJSX);
}

fs.writeFileSync('app/(app)/my-gigs/page.tsx', content);
