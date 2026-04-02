const fs = require('fs');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)/feed/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="flex-1 flex justify-center mt-2 pb-8">',
  '<div className="flex-1 flex items-center justify-center mt-2 min-h-[450px]">
'
);

fs.writeFileSync(file, content);
console.log("Added min-height 450px to SwipeStack wrapper!");
