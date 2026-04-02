"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { SwipeStack } from "@/components/SwipeStack";
import { SearchBar } from "@/components/SearchBar";
import { Gig } from "@/components/GigCard";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { acceptGig } from "@/lib/firestore-helpers";
import toast from "react-hot-toast";

export default function FeedPage() {
  const { user, userProfile } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    async function loadGigs() {
      try {
        const q = query(
          collection(db, "gigs"),
          where("status", "==", "open"),
          where("postedBy", "!=", user?.uid)
        );
        const sn = await getDocs(q);
        const loaded = sn.docs.map(d => ({ id: d.id, ...d.data() } as Gig));
        setGigs(loaded);
      } catch (err: any) {
        console.error("Failed to load gigs", err);
        if (err.code !== "permission-denied") {
          toast.error("Failed to load feed");
        }
      } finally {
        setLoading(false);
      }
    }
    loadGigs();
  }, [user]);

  const handleSwipeRight = async (gig: Gig) => {
    if (!user) return;
    try {
      await acceptGig(gig.id, user.uid);
      toast.success("Gig accepted! Check My Gigs.");
    } catch (err: any) {
      toast.error(err.message || "Failed to accept gig.");
      // Rollback UI optimistically
      setGigs(prev => [gig, ...prev]);
    }
  };

  const handleSwipeLeft = (gig: Gig) => {
    // Just dismiss client-side
  };

  const filteredGigs = gigs.filter(g => {
    if (activeCategory && g.category !== activeCategory) return false;
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      return (
        g.title.toLowerCase().includes(lowerQ) ||
        g.description.toLowerCase().includes(lowerQ) ||
        g.postedByName.toLowerCase().includes(lowerQ)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Gig Feed</h1>
        <p className="text-muted-foreground text-sm">Swipe right to accept, left to pass.</p>
      </div>

      <SearchBar 
        activeCategory={activeCategory} 
        onSearch={setSearchQuery} 
        onCategoryChange={setActiveCategory} 
      />

      <div className="flex-1 flex justify-center mt-2 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading gigs...</p>
          </div>
        ) : (
          <SwipeStack
            gigs={filteredGigs}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
          />
        )}
      </div>
    </div>
  );
}
