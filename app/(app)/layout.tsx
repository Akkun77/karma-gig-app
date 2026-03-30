"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Home, PlusCircle, Bookmark, User as UserIcon, MailWarning, RefreshCw, LogOut, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { createUserProfile } from "@/lib/auth-helpers";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function KarmaChip({ balance }: { balance: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full card-surface border border-amber-500/30">
      <span className="text-lg">✨</span>
      <span className="font-bold karma-gradient text-sm">{balance} Karma</span>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading, resendVerificationEmail, reloadUser, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const handleRefreshStatus = async () => {
    setChecking(true);
    try {
      await reloadUser();
      
      // If they are physically verified but don't have a profile yet (because we delayed it)
      if (user?.emailVerified && !userProfile) {
        // Double check database to prevent duplicates
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          toast.loading("Generating your university profile...", { id: "gen" });
          await createUserProfile(user, user.displayName || "Student");
          toast.success("Profile created! Welcome to KarmaGig.", { id: "gen" });
        }
      } else if (!user?.emailVerified) {
        toast.error("Email is still not verified.");
      }
    } catch (err) {
      toast.error("Failed to refresh status.");
    } finally {
      setChecking(false);
    }
  };

  // 1. Initial Auth Loading State
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. The Unverified Lock Screen (They cannot bypass this)
  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MailWarning className="w-10 h-10 text-amber-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">Verify your university email</h1>
            <p className="text-muted-foreground text-sm font-medium">
              We sent a verification link to <strong className="text-foreground">{user.email}</strong>. 
              You must click it before your account and Karma balance are generated.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <button
              onClick={handleRefreshStatus}
              disabled={checking}
              className="w-full py-3.5 rounded-xl font-bold bg-primary text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${checking ? "animate-spin" : ""}`} />
              I've Verified (Refresh)
            </button>
            
            <button
              onClick={() => resendVerificationEmail()}
              className="w-full py-3.5 rounded-xl font-bold card-surface hover:bg-white/5 transition flex items-center justify-center gap-2"
            >
              Resend Link
            </button>
            
            <button
              onClick={() => signOut()}
              className="w-full py-2 text-sm font-bold text-red-400 hover:text-red-300 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <div className="mt-8 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-left space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <h3 className="font-bold text-foreground flex items-center gap-2 relative z-10">
              <span className="text-xl">✨</span> What is Karma?
            </h3>
            <p className="text-sm text-foreground/90 font-medium leading-relaxed relative z-10">
              Karma is the official currency of the campus economy. 
              Instead of cash, you <span className="text-amber-500 font-bold">earn Karma silently</span> when you complete a gig. 
              You can then burn your Karma to have other students jump in and help you with future tasks!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Verified but profile is still loading over network
  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading profile data...</p>
      </div>
    );
  }

  // 4. Fully Verified & Profile Loaded -> Standard App Layout
  const navLinks = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Post", href: "/post", icon: PlusCircle },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "My Gigs", href: "/my-gigs", icon: Bookmark },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <nav className="sticky top-0 z-50 card-surface border-b border-white/5 backdrop-blur-xl shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold tracking-tight hidden sm:block">KarmaGig</span>
            </Link>

            <div className="hidden md:flex flex-1 justify-center px-8 space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full"
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center">
              <KarmaChip balance={userProfile.karmaBalance || 0} />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden sticky bottom-0 z-50 card-surface border-t border-white/5 pb-safe shrink-0">
        <div className="flex justify-around items-center h-16 px-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
