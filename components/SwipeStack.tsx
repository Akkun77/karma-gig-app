"use client";
import { useState, useEffect } from "react";
import { GigCard, Gig } from "./GigCard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function SwipeStack({ gigs, onSwipeRight, onSwipeLeft }: {
  gigs: Gig[],
  onSwipeRight: (gig: Gig) => void,
  onSwipeLeft: (gig: Gig) => void
}) {
  const [activeGigs, setActiveGigs] = useState<Gig[]>(gigs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveGigs(gigs);
  }, [gigs]);

  const handleDragEnd = (direction: 'left' | 'right', gigId: string) => {
    const swipedGig = activeGigs.find(g => g.id === gigId);
    if (!swipedGig) return;

    if (direction === 'right') {
      onSwipeRight(swipedGig);
    } else {
      onSwipeLeft(swipedGig);
    }

    setActiveGigs(prev => prev.filter(g => g.id !== gigId));
  };

  if (activeGigs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] max-h-[600px] min-h-[450px] w-full text-center p-8 glass rounded-3xl">
        <span className="text-6xl mb-4">📭</span>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent">
          You've seen everything!
        </h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          No more gigs available for now. Check back later or post your own!
        </p>
      </div>
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
