"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { SwipeStack } from "@/components/SwipeStack";
import { SearchBar } from "@/components/SearchBar";
import { Gig } from "@/components/GigCard";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
        // Only error if it's not a permission error or similar known initial config error
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
      const batch = writeBatch(db);
      const gigRef = doc(db, "gigs", gig.id);
      
      batch.update(gigRef, {
        status: "in_progress",
        acceptedBy: user.uid
      });
      
      // Real-time Push Notification Dispatcher
      const notifRef = doc(collection(db, "notifications"));
      batch.set(notifRef, {
        userId: gig.postedBy, 
        sourceId: user.uid, 
        sourceName: userProfile?.displayName || "A Student",
        type: "gig_accepted",
        text: `accepted your gig "${gig.title}"!`,
        link: "/my-gigs",
        read: false,
        createdAt: new Date()
      });

      await batch.commit();
      toast.success("Gig accepted! Check My Gigs.");
    } catch (err) {
      toast.error("Failed to accept gig.");
      // Rollback UI optimistically
      setGigs(prev => [gig, ...prev]);
    }
  };

  const handleSwipeLeft = (gig: Gig) => {
    // Just dismiss client-side, maybe log view history
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
    <div className="flex flex-col h-full max-h-[800px]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Gig Feed</h1>
        <p className="text-muted-foreground">Swipe right to accept, left to pass.</p>
      </div>

      <SearchBar 
        activeCategory={activeCategory} 
        onSearch={setSearchQuery} 
        onCategoryChange={setActiveCategory} 
      />

      <div className="flex-1 min-h-[500px] mt-4 flex justify-center pb-8">
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
