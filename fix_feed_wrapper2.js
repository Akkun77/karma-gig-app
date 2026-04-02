const fs = require('fs');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)/feed/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The whitespace might be different, so let's use a regex instead of absolute string matching
content = content.replace(
  /<div className="flex-1 flex justify-center mt-2 pb-8"([^>]*)>/g,
  '<div className="flex-1 flex justify-center mt-2 pb-8 min-h-[450px] items-center"$1>'
);

// Another fallback if the first regex doesn't match:
if (!content.includes('min-h-[450px]')) {
  // Let's replace flex-1 flex justify-center directly
  content = content.replace(
    'className="flex-1 flex justify-center mt-2 pb-8"',
    'className="flex-1 flex justify-center mt-2 pb-8 min-h-[450px]"'
  );
}

fs.writeFileSync(file, content);
console.log("Fixed SwipeStack collapse bug!");
