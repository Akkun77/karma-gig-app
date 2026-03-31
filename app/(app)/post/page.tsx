"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, doc, writeBatch, serverTimestamp, getDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { KarmaPricingEngine } from "@/components/KarmaPricingEngine";
import { KarmaInputs } from "@/lib/karma-engine";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function PostGigPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"looking_for" | "offering">("looking_for");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tutoring");
  const [computedKarma, setComputedKarma] = useState(50);
  const [karmaInputs, setKarmaInputs] = useState<KarmaInputs>({ hours: 1, mentalEffort: 3, physicalEffort: 2, urgent: false });

  const handlePricingChange = (karma: number, inputs: KarmaInputs) => {
    setComputedKarma(karma);
    setKarmaInputs(inputs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    setLoading(true);

    try {
      const isLookingFor = type === "looking_for";
      const userRef = doc(db, "users", user.uid);

      if (isLookingFor) {
        const userSnap = await getDoc(userRef);
        const currentKarma = userSnap.data()?.karmaBalance || 0;
        if (currentKarma < computedKarma) {
          toast.error(`Insufficient balance! You need ${computedKarma} Karma to post this gig.`);
          setLoading(false);
          return;
        }
      }

      const batch = writeBatch(db);
      const newGigRef = doc(collection(db, "gigs"));

      batch.set(newGigRef, {
        type,
        category,
        title,
        description,
        karmaPrice: computedKarma,
        urgent: karmaInputs.urgent,
        postedBy: user.uid,
        postedByName: userProfile.displayName,
        status: "open",
        createdAt: serverTimestamp()
      });

      if (isLookingFor) {
        batch.update(userRef, { karmaBalance: increment(-computedKarma) });
      }

      await batch.commit();

      toast.success("Gig posted successfully!");
      router.push("/feed");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to post gig.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Post a Gig</h1>
        <p className="text-muted-foreground">What do you need, or what can you offer?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card-surface p-6 space-y-6 glass">
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Gig Type</label>
                <div className="flex gap-4 p-1 bg-input rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setType("looking_for")}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      type === "looking_for" 
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    I Need Help
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("offering")}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      type === "offering" 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    I Can Help
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground focus:ring-2 focus:ring-primary/50 transition"
                  required
                >
                  <option value="tutoring" className="bg-[#1a1a1a] text-white">Tutoring & Study</option>
                  <option value="delivery" className="bg-[#1a1a1a] text-white">Campus Delivery</option>
                  <option value="design" className="bg-[#1a1a1a] text-white">Design & Media</option>
                  <option value="coding" className="bg-[#1a1a1a] text-white">Coding & Tech</option>
                  <option value="cleaning" className="bg-[#1a1a1a] text-white">Cleaning & Chores</option>
                  <option value="other" className="bg-[#1a1a1a] text-white">Other</option>

                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Need someone to bring me coffee"
                  required
                  maxLength={60}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about the task, location, etc."
                  required
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition resize-none"
                />
              </div>

            </div>

             <motion.button
              type="submit"
              disabled={loading || !title || !description}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-bold text-lg text-primary-foreground karma-glow transition-all disabled:opacity-50 mt-8"
              style={{ background: "linear-gradient(135deg,#2563eb,#3b82f6)" }}
            >
              {loading ? "Publishing..." : `Publish for ${computedKarma} Karma`}
            </motion.button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <KarmaPricingEngine onChange={handlePricingChange} />
            <p className="text-xs text-muted-foreground mt-4 text-center px-4">
              Our automated pricing engine calculates a fair market karma value based on time, effort, and urgency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
