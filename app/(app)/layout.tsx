"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Home, PlusCircle, Bookmark, User as UserIcon, MailWarning, RefreshCw, LogOut, MessageSquare, Building2, MapPin, Sparkles, LayoutList, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { createUserProfile } from "@/lib/auth-helpers";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { NotificationBell } from "@/components/NotificationBell";

function KarmaChip({ balance }: { balance: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full card-surface border border-blue-500/30">
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardName, setOnboardName] = useState("");
  const [onboardMajor, setOnboardMajor] = useState("");
  const [onboardLocation, setOnboardLocation] = useState("");
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Pre-fill name when user object is ready
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user) {
      if (!user.emailVerified) {
        router.replace("/verify-email");
      }
    }
  }, [user, loading, router]);


  const handleRefreshStatus = async () => {
    setChecking(true);
    try {
      // Reload and force-refresh token from Firebase server
      await reloadUser();
      
      // IMPORTANT: Read from auth.currentUser (source of truth), NOT the stale 
      // 'user' closure variable, which is the state from before the reload.
      const freshUser = auth.currentUser;
      
      if (freshUser?.emailVerified) {
        // Email is verified — check if profile needs creating
        const ref = doc(db, "users", freshUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setShowOnboarding(true);
        } else {
          toast.success("Email verified! Welcome back.");
        }
      } else {
        toast.error("Email is still not verified. Check your inbox!");
      }
    } catch (err) {
      toast.error("Failed to refresh status.");
    } finally {
      setChecking(false);
    }
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardMajor.trim() || !onboardLocation.trim()) {
      toast.error("Please fill in both your department and class location.");
      return;
    }
    if (!user) return;
    setOnboardLoading(true);
    try {
      toast.loading("Saving your campus profile...", { id: "onboard" });
      if (userProfile) {
        // Existing profile missing fields — patch only
        await updateDoc(doc(db, "users", user.uid), {
          major: onboardMajor.trim(),
          campusLocation: onboardLocation.trim(),
        });
        toast.success("Profile updated! Welcome back. 🎉", { id: "onboard" });
      } else {
        // Brand new profile
        await createUserProfile(user, onboardName || user.displayName || "Student", onboardMajor.trim(), onboardLocation.trim());
        toast.success("Welcome to UniG! 🎉", { id: "onboard" });
      }
      setShowOnboarding(false);
    } catch (err) {
      toast.error("Failed to save profile. Please try again.", { id: "onboard" });
    } finally {
      setOnboardLoading(false);
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

  if (!user.emailVerified) return null; // Complete render halt

  // 2.5: Verified + Onboarding form
  if (user.emailVerified && (showOnboarding || (!userProfile && !loading))) {
    // If profile actually loaded since we set showOnboarding, proceed to app
    if (userProfile && !showOnboarding) {
      // fall through to app layout below
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-foreground">Almost there! 🎉</h1>
              <p className="text-muted-foreground text-sm font-medium">
                Email verified! Just tell us a bit about yourself so other students can find and trust you on campus.
              </p>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" /> Your Name
                </label>
                <input
                  type="text"
                  value={onboardName}
                  onChange={(e) => setOnboardName(e.target.value)}
                  placeholder="e.g. Akash Sharma"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Department / Major
                </label>
                <input
                  type="text"
                  value={onboardMajor}
                  onChange={(e) => setOnboardMajor(e.target.value)}
                  placeholder="e.g. Computer Science, Business, Design"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              {/* Campus Location */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Primary Class Location
                </label>
                <input
                  type="text"
                  value={onboardLocation}
                  onChange={(e) => setOnboardLocation(e.target.value)}
                  placeholder="e.g. Block E, North Campus, Library"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition"
                />
                <p className="text-xs text-muted-foreground">Used to help nearby students find you for local gigs.</p>
              </div>

              <motion.button
                type="submit"
                disabled={onboardLoading || !onboardMajor.trim() || !onboardLocation.trim()}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-black text-lg text-white flex items-center justify-center gap-2 bg-primary hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary/30 mt-2"
              >
                {onboardLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {onboardLoading ? "Creating Profile..." : "Enter the Campus Economy →"}
              </motion.button>

              <button
                type="button"
                onClick={() => signOut()}
                className="w-full py-2 text-sm font-bold text-red-400 hover:text-red-300 transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </motion.div>
        </div>
      );
    }
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

  // 3.5: Profile exists but is missing required campus fields (e.g. old accounts)
  const profileIncomplete = !userProfile.major?.trim() || !userProfile.campusLocation?.trim();
  if (profileIncomplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Complete your profile</h1>
            <p className="text-muted-foreground text-sm font-medium">
              We need your department and campus location so students can connect with you for gigs nearby!
            </p>
          </div>

          <form onSubmit={handleCompleteOnboarding} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Department / Major
              </label>
              <input
                type="text"
                value={onboardMajor}
                onChange={(e) => setOnboardMajor(e.target.value)}
                placeholder="e.g. Computer Science, Business, Design"
                required
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Primary Class Location
              </label>
              <input
                type="text"
                value={onboardLocation}
                onChange={(e) => setOnboardLocation(e.target.value)}
                placeholder="e.g. Block E, North Campus, Library"
                required
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition"
              />
              <p className="text-xs text-muted-foreground">Used to help nearby students find you for local gigs.</p>
            </div>

            <motion.button
              type="submit"
              disabled={onboardLoading || !onboardMajor.trim() || !onboardLocation.trim()}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-black text-lg text-white flex items-center justify-center gap-2 bg-primary hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary/30 mt-2"
            >
              {onboardLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {onboardLoading ? "Saving..." : "Save & Enter UniG →"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

    // 3.8: Check Suspension
  if (userProfile.status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-md w-full bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-[2rem] p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MailWarning className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">Account Under Review</h1>
            <p className="text-muted-foreground text-sm font-medium">
              Your account has received multiple community reports and is temporarily suspended pending review.
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full py-3.5 rounded-xl font-bold bg-red-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  // 4. Fully Verified & Profile Loaded -> Standard App Layout
  const isAdmin = user?.email === "animesh.pandey3@s.amity.edu";
  
  const navLinks = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Gigs", href: "/gigs", icon: LayoutList },
    { name: "Post", href: "/post", icon: PlusCircle },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "My Gigs", href: "/my-gigs", icon: Bookmark },
    { name: "Profile", href: "/profile", icon: UserIcon },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: ShieldAlert }] : []),
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <nav className="sticky top-0 z-50 card-surface border-b border-white/5 backdrop-blur-xl shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold tracking-tight hidden sm:block">UniG</span>
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

            <div className="flex items-center gap-3">
              <NotificationBell />
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
