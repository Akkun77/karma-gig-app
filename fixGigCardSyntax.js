const fs = require('fs');

const cardPath = 'components/GigCard.tsx';
let cardContent = fs.readFileSync(cardPath, 'utf8');

cardContent = cardContent.replace(`import toast from 'react-hot-toast'; from "next/navigation";`, `import toast from 'react-hot-toast';`);

const brokenSignatureStart = `export function GigCard({
  const handleFlag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await flagGig(gig.id, user.uid);
      toast.success("Gig flagged for moderation");
      onPass(gig.id);
    } catch (err: any) {
      toast.error(err.message || "Could not flag gig");
    }
  };

  const { user } = useAuth();
 gig, onAccept, onPass, index, isTop }: GigCardProps) {`;

const fixedSignature = `export function GigCard({ gig, onAccept, onPass, index, isTop }: GigCardProps) {
  const { user } = useAuth();

  const handleFlag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await flagGig(gig.id, user.uid);
      toast.success("Gig flagged for moderation");
      onPass(gig.id);
    } catch (err: any) {
      toast.error(err.message || "Could not flag gig");
    }
  };`;

cardContent = cardContent.replace(brokenSignatureStart, fixedSignature);

fs.writeFileSync(cardPath, cardContent);
