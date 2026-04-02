const fs = require('fs');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)/feed/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace mt-8 with mt-auto and add relative z-0 so it doesn't fight the absolute cards
content = content.replace(
  '<div className="mt-8 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 w-full max-w-sm mx-auto">',
  '<div className="mt-auto mb-4 relative z-0 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 w-full max-w-sm mx-auto">'
);

// We should also make sure SwipeStack gets a minimum height so it doesn't collapse layout if possible, 
// but mt-auto pins the box to the bottom regardless.

fs.writeFileSync(file, content);
console.log("Updated margin on the warning box.");
