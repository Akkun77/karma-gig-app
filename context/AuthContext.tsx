"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  OAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { validateEmailDomain, createUserProfile } from "@/lib/auth-helpers";
import toast from "react-hot-toast";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  university: string;
  karmaBalance: number;
  createdAt: unknown;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // subscribe to live profile updates
        const ref = doc(db, "users", firebaseUser.uid);
        const profileUnsub = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // Profile creation fallback
            createUserProfile(firebaseUser, firebaseUser.displayName || "Student").catch(console.error);
          }
        });
        setLoading(false);
        return () => profileUnsub();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function signInWithMicrosoft() {
    const provider = new OAuthProvider("microsoft.com");
    provider.setCustomParameters({
      prompt: "select_account",
      tenant: "common",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      
      if (!email || !validateEmailDomain(email)) {
        // Log them right back out if not student
        await firebaseSignOut(auth);
        throw new Error("Only Amity university student emails (@s.amity.edu) are allowed.");
      }

      // Check if profile exists, if not, create it
      const ref = doc(db, "users", result.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await createUserProfile(result.user, result.user.displayName || "Student");
      }
      
    } catch (error: any) {
      console.error(error);
      if (error.message.includes("Amity university")) {
        throw error;
      }
      throw new Error("Failed to sign in with Microsoft.");
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithMicrosoft, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
