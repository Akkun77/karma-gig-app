const fs = require('fs');
let ah = fs.readFileSync('lib/auth-helpers.ts', 'utf8');
ah = ah.replace('export async function createUserProfile(user: User): Promise<void> {', 'export async function createUserProfile(user: User, displayName: string): Promise<void> {');
ah = ah.replace('displayName: user.displayName ?? user.email?.split(\"@\")[0] ?? \"Student\",', 'displayName: displayName ?? user.displayName ?? user.email?.split(\"@\")[0] ?? \"Student\",');
fs.writeFileSync('lib/auth-helpers.ts', ah);
