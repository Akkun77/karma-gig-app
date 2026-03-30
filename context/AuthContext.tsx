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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  updateProfile,
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
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
        // subscribe to live profile updates (if it exists)
        const ref = doc(db, "users", firebaseUser.uid);
        const profileUnsub = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // WE EXPLICITLY DO NOT AUTO-CREATE PROFILES HERE ANYMORE.
            setUserProfile(null);
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

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string, displayName: string) {
    if (!validateEmailDomain(email)) {
      throw new Error("Only university email addresses (@s.amity.edu) are allowed.");
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set the display name directly on the Firebase shell object
    await updateProfile(cred.user, { displayName });
    
    // Immediately send email verification
    await sendEmailVerification(cred.user);
    
    // NO DATABASE PROFILE IS CREATED YET! IT IS DEFERRED TO LAYOUT ONCE VERIFIED.
  }

  async function resendVerificationEmail() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification email resent! Check your spam folder.");
    }
  }

  async function reloadUser() {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser } as User);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut, resendVerificationEmail, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
