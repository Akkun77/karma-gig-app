const fs = require('fs');
let c = fs.readFileSync('context/AuthContext.tsx', 'utf8');
c = c.replace(
  'if (snap.exists()) {\n            setUserProfile(snap.data() as UserProfile);\n          }',
  'if (snap.exists()) {\n            setUserProfile(snap.data() as UserProfile);\n          } else {\n            createUserProfile(firebaseUser, firebaseUser.displayName || \"Student\").catch(console.error);\n          }'
);
fs.writeFileSync('context/AuthContext.tsx', c);
