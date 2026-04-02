const fs = require('fs');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)/u/[uid]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<span className="text-3xl">?</span>',
  '<span className="text-3xl">?</span>'
);

fs.writeFileSync(file, content);
console.log("Replaced question mark with lightning bolt!");
