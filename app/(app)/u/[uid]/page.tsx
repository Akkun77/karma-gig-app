"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, User as UserIcon, Star, CheckCircle, Clock, MapPin, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface PublicProfile {
  uid: string;
  displayName: string;
  university: string;
  karmaBalance: number;
  major?: string;
  campusLocation?: string;
  rating?: number;
  reviewCount?: number;
}

interface CompletedGig {
  id: string;
  title: string;
  karmaPrice: number;
  type: string;
  completedAt: Date;
}

export default function PublicProfilePage({ params }: { params: { uid: string } }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [completedGigs, setCompletedGigs] = useState<CompletedGig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const docRef = doc(db, "users", params.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(snap.data() as PublicProfile);
        }

        // Fetch gigs where this user was involved and gig is complete
        // We'll just look for gigs accepted by them for now
        const q = query(
          collection(db, "gigs"),
          where("acceptedBy", "==", params.uid),
          where("status", "==", "complete")
        );
        const gigsSnap = await getDocs(q);
        const gigs = gigsSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title,
            karmaPrice: data.karmaPrice,
            type: data.type,
            completedAt: data.updatedAt?.toDate() || new Date()
          };
        }).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
        setCompletedGigs(gigs);

      } catch (err) {
        console.error("Failed to fetch public profile:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [params.uid]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 card-surface glass max-w-lg mx-auto mt-10">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <p className="text-muted-foreground mt-2">This student's profile either doesn't exist or was removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 pb-24 space-y-8">
      
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface glass p-8 relative overflow-hidden flex flex-col items-center text-center"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-5xl font-black shadow-2xl z-10 border-4 border-background mb-4">
          {profile.displayName.charAt(0)}
        </div>
        
        <h1 className="text-3xl font-black tracking-tight z-10">{profile.displayName}</h1>
        <div className="flex items-center justify-center gap-2 mt-2 z-10">
          <span className="px-3 py-1 bg-primary/20 text-primary font-bold text-xs uppercase tracking-widest rounded-full">
            {profile.university} Student
          </span>
          {profile.major && (
            <span className="flex items-center gap-1 px-3 py-1 bg-white/5 text-muted-foreground font-bold text-xs uppercase tracking-widest rounded-full border border-white/10">
              <Building2 className="w-3 h-3" />{profile.major}
            </span>
          )}
        </div>
        {profile.campusLocation && (
          <div className="flex items-center gap-1.5 mt-2 z-10 text-blue-400 text-sm font-semibold">
            <MapPin className="w-4 h-4" />
            <span>{profile.campusLocation}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 w-full mt-8 z-10">
          <div className="bg-background/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Karma Wealth</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl">✨</span>
              <span className="text-3xl font-black karma-gradient">{profile.karmaBalance}</span>
            </div>
          </div>
          <div className="bg-background/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <div className="flex items-center gap-1 mb-1">
              <Star className="text-blue-400 fill-blue-400 w-4 h-4" />
              <Star className="text-blue-400 fill-blue-400 w-4 h-4" />
              <Star className="text-blue-400 fill-blue-400 w-4 h-4" />
              <Star className="text-blue-400 fill-blue-400 w-4 h-4" />
              <Star className="text-blue-400 fill-blue-400 w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Top Rated</span>
            <span className="text-xs text-muted-foreground mt-1 opacity-70">({profile.reviewCount || 0} reviews)</span>
          </div>
        </div>
      </motion.div>

      {/* Completed Gigs */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold flex items-center gap-2 px-2">
          <CheckCircle className="text-emerald-500" /> Recent Accomplishments
        </h2>
        
        {completedGigs.length === 0 ? (
          <div className="card-surface glass p-8 text-center text-muted-foreground font-medium">
            No completed gigs on record yet! Give them a chance.
          </div>
        ) : (
          <div className="space-y-3">
            {completedGigs.map((gig, idx) => (
              <div key={idx} className="card-surface p-4 flex justify-between items-center hover:bg-white/5 transition-colors group">
                <div className="flex flex-col">
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors">{gig.title}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {gig.completedAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 shadow-sm">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">+ {gig.karmaPrice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  );
}
