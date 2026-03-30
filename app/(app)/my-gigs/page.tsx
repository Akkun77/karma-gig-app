"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, writeBatch, deleteDoc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Gig } from "@/components/GigCard";
import { Loader2, CheckCircle2, Trash2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function MyGigsPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posted" | "accepted">("posted");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function loadMyGigs() {
      setLoading(true);
      try {
        const field = activeTab === "posted" ? "postedBy" : "acceptedBy";
        const q = query(collection(db, "gigs"), where(field, "==", user?.uid));
        const sn = await getDocs(q);
        const loaded = sn.docs.map(d => ({ id: d.id, ...d.data() } as Gig));
        setGigs(loaded.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
      } catch (err) {
        toast.error("Failed to load your gigs");
      } finally {
        setLoading(false);
      }
    }
    
    loadMyGigs();
  }, [user, activeTab]);

  const handleMarkComplete = async (gig: Gig) => {
    if (!user || gig.status !== "in_progress") return;
    try {
      const batch = writeBatch(db);
      const gigRef = doc(db, "gigs", gig.id);
      const txRef = doc(collection(db, "transactions"));
      
      const isLookingFor = gig.type === "looking_for";
      const buyerUid = isLookingFor ? gig.postedBy : gig.acceptedBy;
      const sellerUid = isLookingFor ? gig.acceptedBy : gig.postedBy;

      batch.update(gigRef, { status: "complete" });
      batch.set(txRef, {
        gigId: gig.id,
        buyerUid,
        sellerUid,
        karmaAmount: gig.karmaPrice,
        completedAt: new Date(),
      });

      const userRef = doc(db, "users", user.uid);
      const userBalUpdate = user.uid === buyerUid ? -gig.karmaPrice : gig.karmaPrice;
      
      batch.update(userRef, { karmaBalance: (userProfile?.karmaBalance || 0) + userBalUpdate });
      await batch.commit();
      toast.success(`Gig completed! ${user.uid === buyerUid ? `Paid ${gig.karmaPrice}` : `Earned ${gig.karmaPrice}`} Karma.`);
      setGigs(prev => prev.map(g => g.id === gig.id ? { ...g, status: "complete" } as Gig : g));
    } catch(err) {
      toast.error("Failed to mark complete.");
    }
  };

  const handleDeleteGig = async (gig: Gig) => {
    if (!user || gig.postedBy !== user.uid) return;
    const confirmed = confirm("Are you sure you want to delete this gig?");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "gigs", gig.id));
      toast.success("Gig deleted successfully.");
      setGigs(prev => prev.filter(g => g.id !== gig.id));
    } catch(err) {
      toast.error("Failed to delete gig.");
    }
  };

  const handleMessageUser = async (gig: Gig) => {
    if (!user || !userProfile) return;
    
    const otherUid = gig.postedBy === user.uid ? gig.acceptedBy : gig.postedBy;
    if (!otherUid) return toast.error("No one has accepted this gig yet.");

    try {
      const q = query(collection(db, "chats"), where("gigId", "==", gig.id));
      const snaps = await getDocs(q);
      
      let chatId = "";
      
      if (!snaps.empty) {
        chatId = snaps.docs[0].id;
      } else {
        const otherNameFetch = async () => {
          if (gig.postedBy !== user.uid) return gig.postedByName;
          const snap = await getDoc(doc(db, "users", otherUid));
          return snap.exists() ? snap.data().displayName : "Student";
        };
        const otherName = await otherNameFetch();

        const participants = [user.uid, otherUid];
        const participantNames = {
          [user.uid]: userProfile.displayName,
          [otherUid]: otherName
        };

        const docRef = await addDoc(collection(db, "chats"), {
          participants,
          participantNames,
          gigId: gig.id,
          gigTitle: gig.title,
          lastMessage: "Chat created",
          updatedAt: serverTimestamp()
        });
        chatId = docRef.id;
      }

      router.push(`/messages/${chatId}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not open chat");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Gigs</h1>
        <p className="text-muted-foreground">Manage the gigs you posted and accepted.</p>
      </div>

      <div className="flex gap-4 mb-8 p-1 card-surface max-w-sm rounded-[1rem]">
        <button
          onClick={() => setActiveTab("posted")}
          className={`flex-1 py-2 font-medium text-sm rounded-[0.75rem] transition-all ${
            activeTab === "posted" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Posted by Me
        </button>
        <button
          onClick={() => setActiveTab("accepted")}
          className={`flex-1 py-2 font-medium text-sm rounded-[0.75rem] transition-all ${
            activeTab === "accepted" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Accepted by Me
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center text-primary"><Loader2 className="animate-spin w-8 h-8" /></div>
        ) : gigs.length === 0 ? (
          <div className="py-20 text-center card-surface glass border-dashed">
            <span className="text-4xl mb-4 block">👻</span>
            <p className="text-muted-foreground font-medium">No gigs found here.</p>
          </div>
        ) : (
          gigs.map(gig => (
            <div key={gig.id} className="card-surface p-6 glass flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                    gig.type === "looking_for" ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {gig.type === "looking_for" ? "Looking For" : "Offering"}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                    gig.status === "open" ? "bg-blue-500/20 text-blue-400" :
                    gig.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                    "bg-green-500/20 text-green-400"
                  }`}>
                    {gig.status === "open" ? "Open" : gig.status === "in_progress" ? "In Progress" : "Complete"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{gig.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{gig.description}</p>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-border md:border-t-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black karma-gradient">{gig.karmaPrice}</span>
                  <span className="text-primary text-sm">⚡</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {gig.status === "open" && activeTab === "posted" && (
                    <button
                      onClick={() => handleDeleteGig(gig)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition shadow-lg shadow-red-500/10"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  )}
                  {gig.status === "in_progress" && (
                    <button
                      onClick={() => handleMessageUser(gig)}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
                    >
                      <MessageSquare size={18} /> Chat
                    </button>
                  )}
                  {gig.status === "in_progress" && activeTab === "posted" && (
                    <button
                      onClick={() => handleMarkComplete(gig)}
                      className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-400 text-green-950 font-bold rounded-xl transition shadow-lg shadow-green-500/20"
                    >
                      <CheckCircle2 size={18} /> Complete
                    </button>
                  )}
                </div>
                {gig.status === "complete" && (
                  <span className="text-sm font-medium text-green-500 flex items-center gap-1">
                    <CheckCircle2 size={16} /> Paid
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
