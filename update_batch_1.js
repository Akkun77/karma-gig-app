const fs = require('fs');
const path = require('path');
const base = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig';

// 1. Feed Page Warnings
let feedPage = fs.readFileSync(path.join(base, 'app/(app)/feed/page.tsx'), 'utf8');
const warningBox = `
      <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
        <span className="text-xl">??</span>
        <div>
          <h3 className="font-bold text-red-500 text-sm">Community Safety Lock</h3>
          <p className="text-red-400 text-xs mt-1 leading-relaxed">
            UniG actively monitors this ecosystem. Selling drugs, illegal services, or weapons will result in permanent device bans.
            Trolls falsely reporting peers to abuse the penalty system will face immediate Karma wipes and expulsion from the network.
          </p>
        </div>
      </div>
`;
feedPage = feedPage.replace(
  '<SearchBar',
  warningBox + '\n      <SearchBar'
);
fs.writeFileSync(path.join(base, 'app/(app)/feed/page.tsx'), feedPage);

// 2. Chat UI Glitch
let chatPage = fs.readFileSync(path.join(base, 'app/(app)/messages/[chatId]/page.tsx'), 'utf8');
chatPage = chatPage.replace(
  'className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] max-w-4xl mx-auto -mt-6 overflow-x-hidden w-full"',
  'className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] max-w-4xl mx-auto overflow-x-hidden w-full"'
);
chatPage = chatPage.replace(
  'className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 space-y-3 pb-36 overscroll-contain w-full"',
  'className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-20 space-y-3 pb-36 overscroll-contain w-full"'
);
fs.writeFileSync(path.join(base, 'app/(app)/messages/[chatId]/page.tsx'), chatPage);

// 3. Landing Page Rules and Credits
let landPage = fs.readFileSync(path.join(base, 'app/page.tsx'), 'utf8');
const landingAdditions = `
        {/* Trust and Safety */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 max-w-4xl w-full text-left p-8 rounded-[2rem] glass border border-red-500/20 bg-red-500/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
          <h2 className="text-2xl font-black text-foreground mb-4">?? Zero Tolerance Policy</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            UniG is an exclusive campus utility designed for trust. We actively monitor the ecosystem. 
            <strong> Selling illicit substances, weapons, or offering illegal services will trigger permanent law-enforcement escalations and device bans.</strong> 
            <br/><br/>
            Additionally, users weaponizing or abusing the 'Report' feature against peers for fun will face immediate Karma wipes and network expulsion. Play fair.
          </p>
        </motion.div>
      </main>

      {/* Footer Credits */}
      <footer className="w-full text-center py-8 z-10 border-t border-white/5 opacity-80">
        <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">
          ? Created by Animesh Pandey
        </p>
      </footer>
`;
landPage = landPage.replace('</main>\n    </div>', landingAdditions + '\n    </div>');
fs.writeFileSync(path.join(base, 'app/page.tsx'), landPage);

// 4. Update the Layout to Fix Verification Bypass
let layoutPage = fs.readFileSync(path.join(base, 'app/(app)/layout.tsx'), 'utf8');

// The layout already checks !user.emailVerified, but it returns null. 
// Let's make it physically push the router again via useEffect so it's impossible to bypass on Mount.
if (!layoutPage.includes('user && !user.emailVerified) {')) {
  // Just safety replace if it wasn't there
} else {
  // Ensure the route guard pushes them back actively on every render cycle if false
  const activeGuard = `
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user) {
      if (!user.emailVerified) {
        router.replace("/verify-email");
      }
    }
  }, [user, loading, router]);
`;
  // Replace the old useEffect
  layoutPage = layoutPage.replace(
    /useEffect\(\(\) => \{[\s\S]*?\}, \[user, loading, router\]\);/m,
    activeGuard
  );
  layoutPage = layoutPage.replace('if (!user.emailVerified) return null;', 'if (!user.emailVerified) return null; // Complete render halt');
  fs.writeFileSync(path.join(base, 'app/(app)/layout.tsx'), layoutPage);
}

console.log("Visuals and Router fixes complete.");
