const fs = require('fs');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)/feed/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change h-full to min-h-full so the flexbox is allowed to grow and naturally scroll
content = content.replace(
  '<div className="flex flex-col h-full">',
  '<div className="flex flex-col min-h-full relative pb-20">'
);

// Add shrink-0 so flexbox doesn't literally pancake the box when the screen is small
content = content.replace(
  '<div className="mt-auto mb-4 relative z-0 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 w-full max-w-sm mx-auto">',
  '<div className="mt-8 mb-4 relative z-0 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 w-full max-w-sm mx-auto shrink-0">' // swapped mt-auto to mt-8 so it just sits naturally at the bottom of the flex flow without funky flex constraints
);

fs.writeFileSync(file, content);
console.log("Fixed flexbox collapse bug!");
