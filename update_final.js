const fs = require('fs');
const path = require('path');
const base = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig';

// 1. firestore-helpers.ts
let fsHelp = fs.readFileSync(path.join(base, 'lib/firestore-helpers.ts'), 'utf8');
fsHelp = fsHelp.replace(
  'tx.update(gigRef, { status: "complete" });',
  'if (gig.hasBeenReviewed) throw new Error("Gig already reviewed.");\n    tx.update(gigRef, { status: "complete", hasBeenReviewed: true });'
);
fsHelp = fsHelp.replace(
  'if (gig.status !== "complete") throw new Error("Gig must be complete to review.");\n\n    const isLookingFor = gig.type === "looking_for";',
  'if (gig.status !== "complete") throw new Error("Gig must be complete to review.");\n    if (gig.hasBeenReviewed) throw new Error("Gig already reviewed.");\n    tx.update(gigRef, { hasBeenReviewed: true });\n\n    const isLookingFor = gig.type === "looking_for";'
);
fs.writeFileSync(path.join(base, 'lib/firestore-helpers.ts'), fsHelp);

// 2. my-gigs/page.tsx
let myGigs = fs.readFileSync(path.join(base, 'app/(app)/my-gigs/page.tsx'), 'utf8');
myGigs = myGigs.replace(
  '{isBuyer && !(gig as any).reviewedLocally && (',
  '{isBuyer && !gig.hasBeenReviewed && !(gig as any).reviewedLocally && ('
);
myGigs = myGigs.replace(
  'const q = query(collection(db, "chats"), where("gigId", "==", gig.id));\n      const snaps = await getDocs(q);\n      \n      let chatId = "";\n      \n      if (!snaps.empty) {\n        chatId = snaps.docs[0].id;',
  `const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      const snaps = await getDocs(q);
      const existingChat = snaps.docs.find(d => {
        const p = d.data().participants || [];
        return p.includes(otherUid);
      });
      let chatId = "";
      if (existingChat) {
        chatId = existingChat.id;`
);
fs.writeFileSync(path.join(base, 'app/(app)/my-gigs/page.tsx'), myGigs);

// 3. u/[uid]/page.tsx
let publicProf = fs.readFileSync(path.join(base, 'app/(app)/u/[uid]/page.tsx'), 'utf8');
publicProf = publicProf.replace('reviewCount?: number;', 'reviewCount?: number;\n  email?: string;');
publicProf = publicProf.replace(
  '<h1 className="text-3xl font-black tracking-tight z-10">{profile.displayName}</h1>',
  '<h1 className="text-3xl font-black tracking-tight z-10">{profile.displayName}</h1>\n        {profile.email && <p className="text-muted-foreground mt-1 z-10">{profile.email}</p>}'
);
fs.writeFileSync(path.join(base, 'app/(app)/u/[uid]/page.tsx'), publicProf);

// 4. login/page.tsx
let loginPage = fs.readFileSync(path.join(base, 'app/(auth)/login/page.tsx'), 'utf8');
if (!loginPage.includes('EyeOff')) {
  loginPage = loginPage.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { Eye, EyeOff } from "lucide-react";');
  loginPage = loginPage.replace('const [submitting, setSubmitting] = useState(false);', 'const [submitting, setSubmitting] = useState(false);\n  const [showPassword, setShowPassword] = useState(false);');
  loginPage = loginPage.replace(
    '<input\n                id="login-password"\n                type="password"\n                required\n                value={password}\n                onChange={(e) => setPassword(e.target.value)}\n                placeholder="••••••••"\n                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"\n              />',
    `<div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>`
  );
  fs.writeFileSync(path.join(base, 'app/(auth)/login/page.tsx'), loginPage);
}

// 5. signup/page.tsx
let signupPage = fs.readFileSync(path.join(base, 'app/(auth)/signup/page.tsx'), 'utf8');
if (!signupPage.includes('EyeOff')) {
  signupPage = signupPage.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { Eye, EyeOff } from "lucide-react";');
  signupPage = signupPage.replace('const [submitting, setSubmitting] = useState(false);', 'const [submitting, setSubmitting] = useState(false);\n  const [showPassword, setShowPassword] = useState(false);');
  signupPage = signupPage.replace(
    '<input\n                id="signup-password"\n                type="password"\n                required\n                value={password}\n                onChange={(e) => setPassword(e.target.value)}\n                placeholder="Create a strong password"\n                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"\n              />',
    `<div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>`
  );
  fs.writeFileSync(path.join(base, 'app/(auth)/signup/page.tsx'), signupPage);
}

console.log("Everything updated!");
