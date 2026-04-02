"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, MailWarning, RefreshCw, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const { user, loading, resendVerificationEmail, reloadUser, signOut } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user && user.emailVerified) {
      router.replace("/feed");
    }
  }, [user, loading, router]);

  const handleRefreshStatus = async () => {
    setChecking(true);
    try {
      await reloadUser();
      if (user?.emailVerified) {
        toast.success("Email verified! Welcome.");
        router.replace("/feed");
      } else {
        toast.error("Email is still not verified. Check your inbox!");
      }
    } catch (err) {
      toast.error("Failed to refresh status.");
    } finally {
      setChecking(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MailWarning className="w-10 h-10 text-blue-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">Verify your university email</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Check your university email to verify your account. You cannot access the app until you click the link.
          </p>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Sent to <strong className="text-foreground">{user.email}</strong>. 
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
      </motion.div>
    </div>
  );
}
