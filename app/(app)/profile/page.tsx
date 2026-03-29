"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { LogOut, User as UserIcon, Calendar, Zap, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, userProfile, signOut } = useAuth();

  if (!user || !userProfile) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-8 glass relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-center gap-8 border-b border-border pb-8">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} />
              <AvatarFallback className="text-4xl">{userProfile.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg border-2 border-background">
              <Star size={16} className="text-primary-foreground fill-primary-foreground" />
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{userProfile.displayName}</h1>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
               {user.email}
            </p>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold tracking-wide">
               @{userProfile.university || "student"}
            </div>
          </div>
        </div>

        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border">
          <div className="card-surface p-6 flex items-center justify-between glass border border-primary/20 bg-primary/5">
            <div className="space-y-1">
              <h3 className="text-muted-foreground font-medium text-sm flex items-center gap-2">
                <Zap size={16} className="text-primary" /> Karma Balance
              </h3>
              <div className="text-4xl font-black karma-gradient">{userProfile.karmaBalance || 0}</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl">🪙</span>
            </div>
          </div>
          
          <div className="card-surface p-6 flex flex-col justify-center bg-black/20">
            <h3 className="text-muted-foreground font-medium text-sm flex items-center gap-2 mb-2">
              <Calendar size={16} /> Member Since
            </h3>
            <div className="text-lg font-bold text-foreground">
              {userProfile.createdAt ? new Date((userProfile.createdAt as any).toDate?.() || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Just now"}
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-center md:justify-start">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl card-surface hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-muted-foreground font-bold transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
