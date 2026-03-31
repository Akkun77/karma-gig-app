"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Gig } from "@/components/GigCard";
import { SearchBar } from "@/components/SearchBar";
import { Loader2, Zap, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

const CategoryBadgeColors: Record<string, string> = {
  tutoring: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  delivery: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  design: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  coding: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  cleaning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  other: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

const CategoryLabels: Record<string, string> = {
  tutoring: "📚 Tutoring",
  delivery: "🍕 Delivery",
  design: "🎨 Design",
  coding: "💻 Coding",
  cleaning: "🧹 Chores",
  other: "✨ Other",
};

export default function GigsPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
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
        // Sort newest first
        loaded.sort((a: any, b: any) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setGigs(loaded);
      } catch (err: any) {
        if (err.code !== "permission-denied") toast.error("Failed to load gigs");
      } finally {
        setLoading(false);
      }
    }
    loadGigs();
  }, [user]);

  const handleAccept = async (gig: Gig) => {
    if (!user || !userProfile) return;
    setAccepting(gig.id);
    try {
      const batch = writeBatch(db);
      const gigRef = doc(db, "gigs", gig.id);
      batch.update(gigRef, { status: "in_progress", acceptedBy: user.uid });

      const notifRef = doc(collection(db, "notifications"));
      batch.set(notifRef, {
        userId: gig.postedBy,
        sourceId: user.uid,
        sourceName: userProfile.displayName || "A Student",
        type: "gig_accepted",
        text: `accepted your gig "${gig.title}"!`,
        link: "/my-gigs",
        read: false,
        createdAt: new Date(),
      });

      await batch.commit();
      toast.success("Gig accepted! Check My Gigs.");
      setGigs(prev => prev.filter(g => g.id !== gig.id));
    } catch (err) {
      toast.error("Failed to accept gig.");
    } finally {
      setAccepting(null);
    }
  };

  const filteredGigs = gigs.filter(g => {
    if (activeCategory && g.category !== activeCategory) return false;
    if (searchQuery) {
      const lq = searchQuery.toLowerCase();
      return (
        g.title.toLowerCase().includes(lq) ||
        g.description.toLowerCase().includes(lq) ||
        g.postedByName.toLowerCase().includes(lq)
      );
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-6 pb-24">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-1">All Gigs</h1>
        <p className="text-muted-foreground text-sm">Browse every open gig on campus at a glance.</p>
      </div>

      <SearchBar
        activeCategory={activeCategory}
        onSearch={setSearchQuery}
        onCategoryChange={setActiveCategory}
      />

      {loading ? (
        <div className="py-20 flex justify-center text-primary">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="py-20 text-center card-surface glass border-dashed rounded-3xl">
          <span className="text-4xl mb-4 block">🌱</span>
          <p className="text-muted-foreground font-medium">No open gigs right now. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGigs.map(gig => {
            const catColor = CategoryBadgeColors[gig.category ?? "other"] ?? CategoryBadgeColors.other;
            const catLabel = CategoryLabels[gig.category ?? "other"] ?? CategoryLabels.other;
            const isLookingFor = gig.type === "looking_for";

            return (
              <div
                key={gig.id}
                className="card-surface glass p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/30 transition-colors"
              >
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isLookingFor
                        ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/20"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {isLookingFor ? "🧐 Requesting" : "🤝 Offering"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${catColor}`}>
                      {catLabel}
                    </span>
                    {gig.urgent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 animate-pulse flex items-center gap-1">
                        <Zap size={10} className="fill-red-400" /> Urgent
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground text-base leading-tight truncate">{gig.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{gig.description}</p>

                  <Link
                    href={`/u/${gig.postedBy}`}
                    className="inline-flex items-center gap-2 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {gig.postedByName.charAt(0)}
                    </div>
                    {gig.postedByName}
                  </Link>
                </div>

                {/* Right: karma + accept */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black karma-gradient">{gig.karmaPrice}</span>
                    <span className="text-primary text-xs">⚡</span>
                  </div>
                  <button
                    onClick={() => handleAccept(gig)}
                    disabled={accepting === gig.id}
                    className="flex items-center gap-2 px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground font-black rounded-xl transition text-sm shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {accepting === gig.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Accept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
