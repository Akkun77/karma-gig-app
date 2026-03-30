"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { user, signInWithMicrosoft, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/feed");
  }, [user, loading, router]);

  async function handleSSOLogin() {
    setSubmitting(true);
    try {
      await signInWithMicrosoft();
      toast.success("Login successful!");
      router.replace("/feed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "SSO Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="card-surface p-8 space-y-8 glass text-center border border-white/10 shadow-xl">
          <div className="space-y-4">
            <span className="text-5xl drop-shadow-lg">⚡</span>
            <h1 className="text-3xl font-black karma-gradient tracking-tight drop-shadow-sm">KarmaGig</h1>
            <p className="text-muted-foreground text-sm font-medium">Access your university gig ecosystem.</p>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <motion.button
              onClick={handleSSOLogin}
              disabled={submitting}
              whileTap={{ scale: 0.96 }}
              className="w-full py-4 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-3 transition-all relative overflow-hidden group shadow-lg"
              style={{ background: "linear-gradient(135deg, #0078D4, #28A8EA)" }}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {submitting ? (
                 <span className="text-white">Connecting to Microsoft...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="w-6 h-6 fill-white drop-shadow-sm">
                    <rect x="1" y="1" width="9" height="9"/>
                    <rect x="11" y="1" width="9" height="9"/>
                    <rect x="1" y="11" width="9" height="9"/>
                    <rect x="11" y="11" width="9" height="9"/>
                  </svg>
                  <span className="text-white text-lg tracking-wide drop-shadow-sm">Sign in with Outlook</span>
                </>
              )}
            </motion.button>
            <p className="text-xs text-muted-foreground mt-4 font-medium opacity-80">
              Only @s.amity.edu addresses are supported.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
