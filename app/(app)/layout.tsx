"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Home, PlusCircle, Bookmark, User as UserIcon, MailWarning, RefreshCw, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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
  const [resending, setResending] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Email verification block
  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-surface p-8 max-w-md w-full space-y-6 flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
            <MailWarning className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-muted-foreground">
            We sent a verification link to <span className="font-medium text-foreground">{user.email}</span>.
            Please verify your email to access your KarmaGig account.
          </p>

          <div className="w-full space-y-3 pt-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                setReloading(true);
                try {
                  await reloadUser();
                  // check again after reload
                  if (user.emailVerified) {
                    toast.success("Email verified successfully!");
                  } else {
                    toast.error("Email not verified yet.");
                  }
                } catch (err) {
                  toast.error("Error checking verification status.");
                } finally {
                  setReloading(false);
                }
              }}
              disabled={reloading || resending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              {reloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              I've Verified (Refresh)
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                setResending(true);
                try {
                  await resendVerificationEmail();
                  toast.success("Verification email resent!");
                } catch (err: any) {
                  if (err.code === "auth/too-many-requests") {
                    toast.error("Too many requests. Please wait a bit.");
                  } else {
                    toast.error("Failed to resend email.");
                  }
                } finally {
                  setResending(false);
                }
              }}
              disabled={reloading || resending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-input border border-border hover:bg-white/5 transition"
            >
              Resend Verification Email
            </motion.button>
            <button
              onClick={() => {
                signOut().catch(console.error);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-400 font-medium transition mx-auto pt-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const navLinks = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Post", href: "/post", icon: PlusCircle },
    { name: "My Gigs", href: "/my-gigs", icon: Bookmark },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="sticky top-0 z-50 card-surface border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold tracking-tight">KarmaGig</span>
            </Link>

            <div className="hidden md:flex flex-1 justify-center px-8 space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="popLayout">
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
      <nav className="md:hidden sticky bottom-0 z-50 card-surface border-t border-white/5 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
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
