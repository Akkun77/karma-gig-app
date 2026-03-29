const fs = require('fs');

let c = fs.readFileSync('context/AuthContext.tsx', 'utf8');
c = c.replace('signUp: (email: string, password: string) => Promise<void>;', 'signUp: (email: string, password: string, displayName: string) => Promise<void>;');
c = c.replace('async function signUp(email: string, password: string) {', 'async function signUp(email: string, password: string, displayName: string) {');
c = c.replace('await createUserProfile(cred.user);', 'await createUserProfile(cred.user, displayName);');
fs.writeFileSync('context/AuthContext.tsx', c);

let ah = fs.readFileSync('lib/auth-helpers.ts', 'utf8');
ah = ah.replace('export async function createUserProfile(user: User) {', 'export async function createUserProfile(user: User, displayName: string) {');
ah = ah.replace('displayName: user.displayName || user.email?.split(\"@\")[0] || \"Student\",', 'displayName: displayName || user.displayName || user.email?.split(\"@\")[0] || \"Student\",');
fs.writeFileSync('lib/auth-helpers.ts', ah);
