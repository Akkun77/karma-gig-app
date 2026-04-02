"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SignupPage() {
  const { user, signUp, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/feed");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      toast.success("Account created successfully! Please verify your email.");
      router.replace("/feed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card-surface p-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-4xl">⚡</span>
            <h1 className="text-2xl font-bold karma-gradient">Create Account</h1>
            <p className="text-muted-foreground text-sm">Join the UniG network</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input
                id="signup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">University Email</label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@s.amity.edu"
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
            <motion.button
              id="signup-submit"
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl font-bold text-primary-foreground karma-glow transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#2563eb,#3b82f6)" }}
            >
              {submitting ? "Signing up…" : "Sign Up"}
            </motion.button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
