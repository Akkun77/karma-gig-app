"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2, Home, PlusCircle, Bookmark, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function KarmaChip({ balance }: { balance: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full card-surface border border-amber-500/30">
      <span className="text-lg">✨</span>
      <span className="font-bold karma-gradient text-sm">{balance} Karma</span>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
