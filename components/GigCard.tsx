"use client";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { MapPin, Clock, Zap, Target, Truck, Palette, Code, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const CategoryMap: Record<string, { label: string; icon: any; color: string }> = {
  tutoring: { label: "📚 Tutoring", icon: Target, color: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
  delivery: { label: "🍕 Delivery", icon: Truck, color: "text-orange-400 bg-orange-500/20 border-orange-500/30" },
  design: { label: "🎨 Design", icon: Palette, color: "text-pink-400 bg-pink-500/20 border-pink-500/30" },
  coding: { label: "💻 Coding", icon: Code, color: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30" },
  cleaning: { label: "🧹 Chores", icon: Sparkles, color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30" },
  other: { label: "✨ Other", icon: AlertCircle, color: "text-gray-400 bg-gray-500/20 border-gray-500/30" },
};

export function GigCard({ gig, onAccept, onPass, index, isTop }: GigCardProps) {
  const router = useRouter();
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
  const catData = gig.category ? CategoryMap[gig.category] || CategoryMap["other"] : null;

  const navigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/u/${gig.postedBy}`);
  };

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
      <div className="w-full h-[65vh] max-h-[600px] min-h-[450px] relative rounded-3xl overflow-hidden glass shadow-2xl flex flex-col user-select-none pointer-events-auto border border-white/5">
        
        {/* Swipe Indicators */}
        <motion.div style={{ opacity: acceptOpacity }} className="absolute top-8 left-8 z-20 pointer-events-none">
          <div className="px-6 py-2 border-4 border-green-500 text-green-500 font-black text-4xl rounded-xl rotate-[-15deg] uppercase tracking-widest bg-green-500/10 backdrop-blur-sm shadow-xl">
            Accept
          </div>
        </motion.div>
        <motion.div style={{ opacity: passOpacity }} className="absolute top-8 right-8 z-20 pointer-events-none">
          <div className="px-6 py-2 border-4 border-red-500 text-red-500 font-black text-4xl rounded-xl rotate-[15deg] uppercase tracking-widest bg-red-500/10 backdrop-blur-sm shadow-xl">
            Pass
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isLookingFor ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {isLookingFor ? "🧐 Requesting" : "🤝 Offering"}
              </span>

              {catData && (
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1 shadow-sm ${catData.color}`}>
                  {catData.label}
                </span>
              )}
            </div>

            {gig.urgent && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-400/20 border border-red-400/30 px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 animate-pulse">
                <Zap size={14} className="fill-red-400" /> Urgent
              </span>
            )}
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent leading-tight mb-3">
            {gig.title}
          </h2>
          
          <p className="text-muted-foreground line-clamp-[8] flex-1 mt-2 text-[17px] leading-relaxed font-medium">
            {gig.description}
          </p>

          <div className="mt-auto space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              
              {/* Clickable Profile Avatar */}
              <button 
                onClick={navigateToProfile}
                className="flex items-center gap-3 text-muted-foreground hover:bg-white/5 p-2 -ml-2 rounded-xl transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-md group-hover:scale-105 transition-transform">
                  {gig.postedByName.charAt(0)}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{gig.postedByName}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">View Profile</span>
                </div>
              </button>
              
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-80 mb-1">Karma Price</span>
                <span className="text-4xl font-black karma-gradient drop-shadow-md">{gig.karmaPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
