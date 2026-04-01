const fs = require('fs');

const path = 'app/(app)/u/[uid]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetBlockStart = content.indexOf('<div className="flex items-center gap-1 mb-1">');
const targetBlockEnd = content.indexOf('<span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Top Rated</span>');

if (targetBlockStart !== -1 && targetBlockEnd !== -1) {
  const replacement = `
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black">{profile.rating ? profile.rating.toFixed(1) : "New"}</span>
              <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 drop-shadow-md" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Rating</span>
`;
  
  content = content.slice(0, targetBlockStart) + replacement.trim() + '\n            ' + content.slice(targetBlockEnd + '<span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Top Rated</span>'.length);
}

fs.writeFileSync(path, content);
