"use client";
import { use, useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Star, CheckCircle, Clock, MapPin, Building2, Flag, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface PublicProfile {
  uid: string;
  displayName: string;
  university: string;
  karmaBalance: number;
  major?: string;
  campusLocation?: string;
  rating?: number;
  reviewCount?: number;
  email?: string;
  reportedBy?: string[];
  status?: string;
}

interface CompletedGig {
  id: string;
  title: string;
  karmaPrice: number;
  type: string;
  completedAt: Date;
}

interface Review {
  id: string;
  rating: number;
  text?: string;
  createdAt: Date;
}

export default function PublicProfilePage({ params: paramsPromise }: { params: Promise<{ uid: string }> }) {
  const params = use(paramsPromise);
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [completedGigs, setCompletedGigs] = useState<CompletedGig[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const docRef = doc(db, "users", params.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(snap.data() as PublicProfile);
        }

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

        // Fetch recent reviews
        const reviewsQ = query(collection(db, "users", params.uid, "reviews"));
        const reviewsSnap = await getDocs(reviewsQ);
        const fetchedReviews = reviewsSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            rating: data.rating || 5,
            text: data.text || data.reviewText || data.comment || "",
            createdAt: data.createdAt?.toDate() || new Date()
          };
        }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
        setReviews(fetchedReviews);

      } catch (err) {
        console.error("Failed to fetch public profile:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [params.uid]);

  const handleReport = async () => {
    if (!user) return;
    setReporting(true);
    try {
      const userRef = doc(db, "users", params.uid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User does not exist!");
        }
        const data = userDoc.data();
        let reportedBy = data.reportedBy || [];
        
        if (reportedBy.includes(user.uid)) {
          throw new Error("You have already reported this user.");
        }
        
        reportedBy.push(user.uid);
        const updates: any = { reportedBy };
        
        // Consequence Logic: exactly 5 reports triggers suspension
        if (reportedBy.length >= 5) {
          updates.status = "suspended";
        }
        
        transaction.update(userRef, updates);
      });
      
      toast.success("User has been reported. Thank you for keeping the community safe.");
      setShowReportModal(false);
      
      // Update UI state to hide button locally
      setProfile(p => p ? { ...p, reportedBy: [...(p.reportedBy||[]), user.uid] } : p);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to report user.");
      setShowReportModal(false);
    } finally {
      setReporting(false);
    }
  };

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
        <p className="text-muted-foreground mt-2">This student profile does not exist or was removed.</p>
      </div>
    );
  }

  const hasReported = profile.reportedBy && user && profile.reportedBy.includes(user.uid);

  return (
    <div className="max-w-3xl mx-auto py-6 pb-24 space-y-8 relative">
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface glass p-8 relative flex flex-col items-center text-center overflow-visible"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        {user?.uid !== params.uid && !hasReported && (
          <button 
            onClick={() => setShowReportModal(true)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-sm flex items-center justify-center group z-20"
            title="Report User"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}

        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-5xl font-black shadow-2xl z-10 border-4 border-background mb-4">
          {profile.displayName.charAt(0)}
        </div>
        
        <h1 className="text-3xl font-black tracking-tight z-10">{profile.displayName}</h1>
        {profile.email && <p className="text-muted-foreground mt-1 z-10">{profile.email}</p>}
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
              <span className="text-3xl">?</span>
              <span className="text-3xl font-black karma-gradient">{profile.karmaBalance}</span>
            </div>
          </div>
          <div className="bg-background/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black">{profile.rating ? profile.rating.toFixed(1) : "New"}</span>
              <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 drop-shadow-md" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Rating</span>
            <span className="text-xs text-muted-foreground mt-1 opacity-70">({profile.reviewCount || 0} reviews)</span>
          </div>
        </div>
      </motion.div>

      {/* RECENT REVIEWS SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold flex items-center gap-2 px-2">
          <Star className="text-yellow-500 fill-yellow-500 w-5 h-5" /> Recent Reviews
        </h2>
        
        {reviews.length === 0 ? (
          <div className="card-surface glass p-8 text-center text-muted-foreground font-medium">
            No reviews yet!
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {reviews.map((rev) => (
              <div key={rev.id} className="card-surface p-4 flex flex-col hover:bg-white/5 transition-colors gap-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                    <span className="text-xs font-black text-yellow-500">{rev.rating}.0</span>
                    <Star className="text-yellow-500 fill-yellow-500 w-3 h-3" />
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {rev.createdAt.toLocaleDateString()}
                  </span>
                </div>
                {rev.text && (
                  <p className="text-sm text-foreground/90 italic leading-relaxed">"{rev.text}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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

      {/* REPORT MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-sm w-full bg-card/90 border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-foreground">Report User</h3>
              </div>
              <p className="text-sm text-foreground/90 font-medium">
                Are you sure you want to report this user? Multiple reports from the community will result in an automatic account suspension.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-white/5 text-foreground hover:bg-white/10 transition"
                  disabled={reporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={reporting}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-500/90 text-white hover:bg-red-500 transition flex items-center justify-center gap-2"
                >
                  {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                  {reporting ? "Submitting..." : "Report User"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
