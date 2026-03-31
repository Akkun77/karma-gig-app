"use client";
import { useState, useEffect } from "react";
import { GigCard, Gig } from "./GigCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PlusCircle, Zap } from "lucide-react";

export function SwipeStack({ gigs, onSwipeRight, onSwipeLeft }: {
  gigs: Gig[],
  onSwipeRight: (gig: Gig) => void,
  onSwipeLeft: (gig: Gig) => void
}) {
  const [activeGigs, setActiveGigs] = useState<Gig[]>(gigs);

  useEffect(() => {
    setActiveGigs(gigs);
  }, [gigs]);

  const handleDragEnd = (direction: 'left' | 'right', gigId: string) => {
    const swipedGig = activeGigs.find(g => g.id === gigId);
    if (!swipedGig) return;
    if (direction === 'right') onSwipeRight(swipedGig);
    else onSwipeLeft(swipedGig);
    setActiveGigs(prev => prev.filter(g => g.id !== gigId));
  };

  if (activeGigs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center w-full max-w-sm text-center p-8 glass rounded-3xl border border-white/5 space-y-5 relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

        {/* Pulsing icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-40" />
          <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-9 h-9 text-primary" />
          </div>
        </div>

        <div className="space-y-2 z-10">
          <h3 className="text-2xl font-black text-foreground">No gigs right now</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The campus feed is quiet. Be the first to post a gig and get things moving!
          </p>
        </div>

        <Link
          href="/post"
          className="z-10 flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 text-white font-black rounded-2xl transition shadow-lg shadow-primary/30 w-full justify-center"
        >
          <PlusCircle className="w-5 h-5" /> Post a Gig
        </Link>

        <p className="text-xs text-muted-foreground z-10 opacity-60">
          Pull down to refresh once others post.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full flex items-center justify-center pointer-events-none">
      <div className="relative w-full max-w-[400px]">
        <AnimatePresence>
          {activeGigs.map((gig, index) => (
            <GigCard
              key={gig.id}
              gig={gig}
              index={index}
              isTop={index === 0}
              onAccept={() => handleDragEnd('right', gig.id)}
              onPass={() => handleDragEnd('left', gig.id)}
            />
          )).reverse()}
        </AnimatePresence>
      </div>
    </div>
  );
}
