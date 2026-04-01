const fs = require('fs');

const cardPath = 'components/GigCard.tsx';
let cardContent = fs.readFileSync(cardPath, 'utf8');

if (!cardContent.includes('Flag, ')) {
  cardContent = cardContent.replace('import { MapPin', 'import { Flag, MapPin');
}

if (!cardContent.includes('useAuth')) {
  cardContent = cardContent.replace('import { useRouter }', "import { useRouter } from 'next/navigation';\nimport { useAuth } from '@/context/AuthContext';\nimport { flagGig } from '@/lib/firestore-helpers';\nimport toast from 'react-hot-toast';");
}

let componentStart = cardContent.indexOf('export function GigCard({');
let componentStartEnd = cardContent.indexOf('{', componentStart) + 1;
if (!cardContent.includes('const { user } = useAuth();')) {
  cardContent = cardContent.slice(0, componentStartEnd) + '\n  const { user } = useAuth();' + cardContent.slice(componentStartEnd);
}

const flagHandler = 
  const handleFlag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await flagGig(gig.id, user.uid);
      toast.success("Gig flagged for moderation");
      onPass(gig.id); // dismiss locally
    } catch (err: any) {
      toast.error(err.message || "Could not flag gig");
    }
  };
;

if (!cardContent.includes('handleFlag')) {
  cardContent = cardContent.slice(0, componentStartEnd) + flagHandler + cardContent.slice(componentStartEnd);
}

const flagButton = 
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-80 mb-1">Karma Price</span>
                <div className="flex items-center gap-3">
                  <button onClick={handleFlag} className="text-muted-foreground hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors" title="Flag as miscategorized/inappropriate">
                    <Flag size={20} />
                  </button>
                  <span className="text-4xl font-black karma-gradient drop-shadow-md">{gig.karmaPrice}</span>
                </div>
              </div>
;

cardContent = cardContent.replace(/<div className="flex flex-col items-end">\s*<span className="text-\[10px\].*?Karma Price<\/span>\s*<span className="text-4xl font-black karma-gradient drop-shadow-md">\{gig\.karmaPrice\}<\/span>\s*<\/div>/s, flagButton);

fs.writeFileSync(cardPath, cardContent);
