"use client";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { useState } from "react";
import { MapPin, Clock, Zap } from "lucide-react";

export interface Gig {
  id: string;
  title: string;
  description: string;
  type: "looking_for" | "offering";
  karmaPrice: number;
  postedBy: string;
  postedByName: string;
  category?: string;
  urgent?: boolean;
  status: "open" | "in_progress" | "complete";
  acceptedBy?: string;
  createdAt?: any;
}

interface GigCardProps {
  gig: Gig;
  onAccept: (id: string) => void;
  onPass: (id: string) => void;
  index: number;
  isTop: boolean;
}

export function GigCard({ gig, onAccept, onPass, index, isTop }: GigCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const acceptOpacity = useTransform(x, [50, 150], [0, 1]);
  const passOpacity = useTransform(x, [-50, -150], [0, 1]);
  const controls = useAnimation();

  const handleDragEnd = async (event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await controls.start({ x: 300, opacity: 0 });
      onAccept(gig.id);
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -300, opacity: 0 });
      onPass(gig.id);
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const isLookingFor = gig.type === "looking_for";

  return (
    <motion.div
      className="absolute inset-0 preserve-3d"
      style={{
        zIndex: 10 - index,
        x,
        rotate,
        scale: isTop ? 1 : Math.max(0.9, 1 - index * 0.05),
        y: isTop ? 0 : index * 10,
        opacity: isTop ? 1 : Math.max(0.3, 1 - index * 0.2),
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={isTop ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="w-full h-[65vh] max-h-[600px] min-h-[450px] relative rounded-3xl overflow-hidden glass shadow-2xl flex flex-col user-select-none pointer-events-auto">
        
        {/* Swipe Indicators */}
        <motion.div style={{ opacity: acceptOpacity }} className="absolute top-8 left-8 z-20 pointer-events-none">
          <div className="px-6 py-2 border-4 border-green-500 text-green-500 font-black text-4xl rounded-xl rotate-[-15deg] uppercase tracking-widest bg-green-500/10 backdrop-blur-sm">
            Accept
          </div>
        </motion.div>
        <motion.div style={{ opacity: passOpacity }} className="absolute top-8 right-8 z-20 pointer-events-none">
          <div className="px-6 py-2 border-4 border-red-500 text-red-500 font-black text-4xl rounded-xl rotate-[15deg] uppercase tracking-widest bg-red-500/10 backdrop-blur-sm">
            Pass
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLookingFor ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {isLookingFor ? "Looking For" : "Offering"}
            </span>
            {gig.urgent && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/20 px-2 py-1 rounded-full">
                <Zap size={12} /> Urgent
              </span>
            )}
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent leading-tight mb-2">
            {gig.title}
          </h2>
          
          <p className="text-muted-foreground line-clamp-4 flex-1 mt-2 text-lg">
            {gig.description}
          </p>

          <div className="mt-auto space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {gig.postedByName.charAt(0)}
                </div>
                <span>{gig.postedByName}</span>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Karma Price</span>
                <span className="text-3xl font-black karma-gradient">{gig.karmaPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
