"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, RefreshCw, HandHeart } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/feed");
  }, [user, loading, router]);

  const steps = [
    { icon: <Zap size={32} className="text-amber-500" />, title: "Offer Skills", desc: "Help others with coding, design, delivery, or chores." },
    { icon: <RefreshCw size={32} className="text-indigo-400" />, title: "Earn Karma", desc: "Gain Karma points automatically when the gig is marked complete." },
    { icon: <HandHeart size={32} className="text-emerald-400" />, title: "Get Help", desc: "Spend Karma to have others on campus help you out." },
  ];

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
      
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="w-full max-w-7xl px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-3xl">⚡</span>
          <span className="text-2xl font-black tracking-tighter">KarmaGig</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 rounded-full font-bold text-foreground hover:bg-white/5 transition">
            Log In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 rounded-full font-bold bg-primary text-primary-foreground karma-glow transition hover:scale-105 active:scale-95">
            Join
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl px-6 flex flex-col items-center justify-center pt-20 pb-32 text-center z-10">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 text-primary font-medium text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Exclusive to University Students
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            The Campus Gig Economy <br className="hidden md:block"/> Powered by
            <span className="karma-gradient ml-4">Karma.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium mt-6">
            Trade your skills, time, and favors. Build trust. Get things done. Everything runs on our localized point system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-10">
            <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg bg-primary text-primary-foreground karma-glow hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
              Start <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl"
        >
          {steps.map((step, idx) => (
            <div key={idx} className="card-surface p-8 glass flex flex-col items-center text-center space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
