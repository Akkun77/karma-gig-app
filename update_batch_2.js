const fs = require('fs');
const path = require('path');
const base = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig';

// 5. Account Deletion Logic inside firestore-helpers.ts
let fsHelp = fs.readFileSync(path.join(base, 'lib/firestore-helpers.ts'), 'utf8');
if (!fsHelp.includes('deleteAccountData')) {
  // We need to query multiple things, so we need extra imports
  fsHelp = fsHelp.replace(
    'import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, runTransaction } from "firebase/firestore";',
    'import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, runTransaction, query, where, getDocs, deleteDoc, writeBatch } from "firebase/firestore";'
  );

  const deleteLogic = `
export async function deleteAccountData(uid: string): Promise<void> {
  const batch = writeBatch(db);

  // 1. Find all gigs posted by this user
  const gigsQuery = query(collection(db, "gigs"), where("postedBy", "==", uid));
  const gigsSnap = await getDocs(gigsQuery);
  gigsSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 2. Find all chats this user is a participant of
  const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", uid));
  const chatsSnap = await getDocs(chatsQuery);
  chatsSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 3. Delete the user profile document itself
  batch.delete(doc(db, "users", uid));

  // Execute the mass deletion
  await batch.commit();
}
`;
  fsHelp += '\n' + deleteLogic;
  fs.writeFileSync(path.join(base, 'lib/firestore-helpers.ts'), fsHelp);
}

// 6. Profile Page UI modifications for deletion
let profilePage = fs.readFileSync(path.join(base, 'app/(app)/profile/page.tsx'), 'utf8');

// Need to import the function and deleteUser from Firebase Auth
profilePage = profilePage.replace(
  'import { useAuth } from "@/context/AuthContext";',
  'import { useAuth } from "@/context/AuthContext";\nimport { deleteAccountData } from "@/lib/firestore-helpers";\nimport { deleteUser } from "firebase/auth";\nimport { auth } from "@/lib/firebase";'
);
profilePage = profilePage.replace(
  'import { LogOut, MapPin, Loader2, Star, Calendar, Trash2 } from "lucide-react";',
  'import { LogOut, MapPin, Loader2, Star, Calendar, Trash2, UserX } from "lucide-react";'
);

// Add the state and delete function
profilePage = profilePage.replace(
  'const [loadingReviews, setLoadingReviews] = useState(true);',
  'const [loadingReviews, setLoadingReviews] = useState(true);\n  const [isDeleting, setIsDeleting] = useState(false);'
);

const deleteFunc = `
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("?? WARNING: This action is permanent!??\\n\\nAre you absolutely sure you want to delete your UniG account? This will permanently erase your profile, all your active gigs, and your chat history.");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      // 1. Erase all their footprint globally
      await deleteAccountData(user.uid);
      
      // 2. Kill the Auth Credential
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      toast.success("Account permanently deleted.");
      router.replace("/signup");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete account. You may need to log in again first.");
    } finally {
      setIsDeleting(false);
    }
  };
`;
profilePage = profilePage.replace('const [loadingReviews, setLoadingReviews] = useState(true);\n  const [isDeleting, setIsDeleting] = useState(false);', 'const [loadingReviews, setLoadingReviews] = useState(true);\n  const [isDeleting, setIsDeleting] = useState(false);\n' + deleteFunc);

// Inject the button under the Sign Out button
profilePage = profilePage.replace(
  '<button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 font-bold transition-all border border-transparent hover:border-red-500/30">\n          <LogOut size={20} />\n          Secure Sign Out\n        </button>',
  `<button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 font-bold transition-all border border-transparent hover:border-red-500/30">
          <LogOut size={20} />
          Secure Sign Out
        </button>
        <button 
          onClick={handleDeleteAccount} 
          disabled={isDeleting}
          className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-all border border-red-500/30 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="animate-spin w-5 h-5"/> : <UserX size={20} />}
          {isDeleting ? "Erasing Data..." : "Delete Account Permanently"}
        </button>`
);

fs.writeFileSync(path.join(base, 'app/(app)/profile/page.tsx'), profilePage);

console.log("Deletion Logic complete.");
