const fs = require('fs');
let cardContent = fs.readFileSync('components/GigCard.tsx', 'utf8');

if (!cardContent.includes('Flag, ')) {
  cardContent = cardContent.replace('import { MapPin', 'import { Flag, MapPin');
}

if (!cardContent.includes('useAuth')) {
  cardContent = cardContent.replace('import { useRouter }', "import { useRouter } from 'next/navigation';\nimport { useAuth } from '@/context/AuthContext';\nimport { flagGig } from '@/lib/firestore-helpers';\nimport toast from 'react-hot-toast';");
}

let componentStart = cardContent.indexOf('export function GigCard({');
let componentStartEnd = cardContent.indexOf('{', componentStart) + 1;
if (!cardContent.includes('const { user } = useAuth();')) {
  cardContent = cardContent.slice(0, componentStartEnd) + '\n  const { user } = useAuth();\n' + cardContent.slice(componentStartEnd);
}

const flagHandler = `
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
`;

if (!cardContent.includes('handleFlag')) {
  let cEnd = cardContent.indexOf('{', componentStart) + 1;
  cardContent = cardContent.slice(0, cEnd) + flagHandler + cardContent.slice(cEnd);
}

const targetDivStart = cardContent.indexOf('<div className="flex flex-col items-end">');
if (targetDivStart !== -1 && !cardContent.includes('handleFlag}')) {
  const replacement = `
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-80 mb-1">Karma Price</span>
                <div className="flex items-center gap-3">
                  <button onClick={handleFlag} className="text-muted-foreground hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors" title="Flag as miscategorized/inappropriate">
                    <Flag size={20} />
                  </button>
                  <span className="text-4xl font-black karma-gradient drop-shadow-md">{gig.karmaPrice}</span>
                </div>
              </div>
`;
  const spanPriceStart = cardContent.indexOf('<span className="text-4xl font-black karma-gradient drop-shadow-md">', targetDivStart);
  if (spanPriceStart !== -1) {
    const endDiv = cardContent.indexOf('</div>', spanPriceStart) + 6;
    cardContent = cardContent.slice(0, targetDivStart) + replacement.trim() + cardContent.slice(endDiv);
  }
}

fs.writeFileSync('components/GigCard.tsx', cardContent);
