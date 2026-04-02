const fs = require('fs');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'if (!loading && !user) router.replace("/login");',
  'if (!loading && !user) {\n      router.replace("/login");\n    } else if (!loading && user && !user.emailVerified) {\n      router.replace("/verify-email");\n    }'
);

const startIdx = content.indexOf('// 2. The Unverified Lock Screen');
const endMarker = '// 2.5: Verified + Onboarding form';
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + 'if (!user.emailVerified) return null;\n\n  ' + content.substring(endIdx);
}

fs.writeFileSync(file, content);
console.log('Done!');
