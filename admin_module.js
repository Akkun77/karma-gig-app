const fs = require('fs');
const path = require('path');
const base = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)';

const adminDir = path.join(base, 'admin');
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir);
}

const adminPageContent = `"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert, Trash2, Loader2, CheckCircle } from "lucide-react";
import { deleteAccountData } from "@/lib/firestore-helpers";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [targetUid, setTargetUid] = useState("");
  const [isWiping, setIsWiping] = useState(false);

  // Severe Security Lock
  if (!user || user.email !== "animesh.pandey3@s.amity.edu") {
    // Intruder detected. Kick them out quietly.
    if (typeof window !== "undefined") {
      router.replace("/feed");
    }
    return null;
  }

  const handleWipeData = async () => {
    if (!targetUid.trim()) {
      toast.error("Please provide a UID.");
      return;
    }
    
    // Double confirmation for safety
    const confirmWipe = window.confirm(
      "?? WARNING: You are initiating a global DB wipe for UID: " + targetUid + "\\n\\nThis physically destroys all gigs, chats, and profile documents related to this exact tracker. \\n\\nAre you absolutely sure?"
    );
    if (!confirmWipe) return;

    setIsWiping(true);
    try {
      await deleteAccountData(targetUid.trim());
      toast.success("All Ghost Data for " + targetUid + " successfully wiped!");
      setTargetUid("");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to wipe data: " + err.message);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Admin Network Console</h1>
          <p className="text-muted-foreground font-medium">Restricted Access • Logged in as Owner</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface glass p-8 rounded-[2rem] border border-red-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
        
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Trash2 className="text-red-500 w-5 h-5" /> Ghost Data Eradication Module
        </h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          If you deleted an account remotely via Firebase Auth, use this framework to surgically hunt down and safely delete their leftover gigs, messaging channels, and profile data to maintain database integrity.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground">Target User ID (UID)</label>
            <input
              type="text"
              value={targetUid}
              onChange={(e) => setTargetUid(e.target.value)}
              placeholder="e.g. jXZK12... or paste UID here"
              className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground font-mono focus:ring-2 focus:ring-red-500/50 transition"
            />
          </div>

          <button
            onClick={handleWipeData}
            disabled={isWiping || !targetUid.trim()}
            className="w-full py-4 mt-2 rounded-xl font-black text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
          >
            {isWiping ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Wiping Databases...</>
            ) : (
              <><ShieldAlert className="w-5 h-5" /> ERADICATE GHOST DATA</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(adminDir, 'page.tsx'), adminPageContent);

let layoutContent = fs.readFileSync(path.join(base, 'layout.tsx'), 'utf8');

// Inject Shield icon into import if missing
if (!layoutContent.includes('ShieldAlert')) {
  layoutContent = layoutContent.replace(
    'import { Loader2, Home, PlusCircle, Bookmark, User as UserIcon, MailWarning, RefreshCw, LogOut, MessageSquare, Building2, MapPin, Sparkles, LayoutList } from "lucide-react";',
    'import { Loader2, Home, PlusCircle, Bookmark, User as UserIcon, MailWarning, RefreshCw, LogOut, MessageSquare, Building2, MapPin, Sparkles, LayoutList, ShieldAlert } from "lucide-react";'
  );
}

// Inject conditional navigation
if (!layoutContent.includes('user?.email === "animesh.pandey3@s.amity.edu"')) {
  layoutContent = layoutContent.replace(
    '  const navLinks = [',
    `  const isAdmin = user?.email === "animesh.pandey3@s.amity.edu";
  
  const navLinks = [`
  );
  layoutContent = layoutContent.replace(
    '    { name: "Profile", href: "/profile", icon: UserIcon },',
    '    { name: "Profile", href: "/profile", icon: UserIcon },\n    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: ShieldAlert }] : []),'
  );
}

fs.writeFileSync(path.join(base, 'layout.tsx'), layoutContent);
console.log("Admin module and navigation successfully injected!");
