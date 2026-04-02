const fs = require('fs');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)/feed/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add AlertTriangle import to feed/page.tsx
if (!content.includes('AlertTriangle')) {
  content = content.replace('import { SearchBar } from "@/components/SearchBar";', 'import { SearchBar } from "@/components/SearchBar";\nimport { AlertTriangle } from "lucide-react";');
}

// 2. Extract the warning box
const warningBoxMatch = content.match(/<div className="mb-4 p-4 rounded-xl bg-red-500\/10[^>]*>[\s\S]*?<\/div>\s*<\/div>/);

// 3. Remove from top
if (warningBoxMatch) {
  content = content.replace(warningBoxMatch[0], '');
  
  // 4. Place it at the very bottom, inside the main flex flex-col h-full right before the closing div
  const newBox = `
      <div className="mt-8 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 w-full max-w-sm mx-auto">
        <AlertTriangle className="text-red-500 shrink-0 w-6 h-6" />
        <div>
          <h3 className="font-bold text-red-500 text-sm">Community Safety Lock</h3>
          <p className="text-red-400 text-xs mt-1 leading-relaxed">
            UniG actively monitors this ecosystem. Selling drugs, illegal services, or weapons will result in permanent device bans.
            Trolls falsely reporting peers to abuse the penalty system will face immediate Karma wipes and expulsion from the network.
          </p>
        </div>
      </div>
    </div>
  );
}`;
  content = content.replace('    </div>\n  );\n}', newBox);
}

fs.writeFileSync(file, content);
console.log("Moved lock box and updated icon!");
