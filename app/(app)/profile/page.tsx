"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { LogOut, User as UserIcon, Calendar, Zap, Star, Building2, MapPin, Pencil, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, userProfile, signOut } = useAuth();

  const [editingMajor, setEditingMajor] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [majorDraft, setMajorDraft] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user || !userProfile) return null;

  const handleSave = async (field: "major" | "campusLocation", value: string) => {
    if (!value.trim()) {
      toast.error("Field cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { [field]: value.trim() });
      toast.success("Profile updated!");
      if (field === "major") setEditingMajor(false);
      else setEditingLocation(false);
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 pb-24 space-y-6">

      {/* Header Card */}
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

        {/* Stats Row */}
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

        {/* Sign Out */}
        <div className="pt-8 flex justify-center md:justify-start">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl card-surface hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-muted-foreground font-bold transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </motion.div>

      {/* Campus Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-surface glass p-6 space-y-5"
      >
        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-primary" /> Campus Identity
        </h2>
        <p className="text-sm text-muted-foreground -mt-2">
          This info appears on your public profile and helps campus students know where to find you.
        </p>

        {/* Department / Major */}
        <div className="bg-background/50 rounded-2xl p-4 border border-white/5 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-primary" /> Department / Major
          </label>

          {editingMajor ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={majorDraft}
                onChange={(e) => setMajorDraft(e.target.value)}
                placeholder="e.g. Computer Science, Business"
                className="flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none transition"
                onKeyDown={(e) => { if (e.key === "Enter") handleSave("major", majorDraft); if (e.key === "Escape") setEditingMajor(false); }}
              />
              <button
                onClick={() => handleSave("major", majorDraft)}
                disabled={saving}
                className="p-2.5 bg-green-500 hover:bg-green-400 text-black rounded-xl transition font-bold"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingMajor(false)}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <p className="text-foreground font-semibold text-sm">
                {userProfile.major || <span className="text-muted-foreground italic">Not set yet</span>}
              </p>
              <button
                onClick={() => { setMajorDraft(userProfile.major || ""); setEditingMajor(true); }}
                className="flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-lg hover:bg-primary/10"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            </div>
          )}
        </div>

        {/* Campus Location / Block */}
        <div className="bg-background/50 rounded-2xl p-4 border border-white/5 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Primary Class Location
          </label>

          {editingLocation ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                placeholder="e.g. Block E, Library, North Campus"
                className="flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none transition"
                onKeyDown={(e) => { if (e.key === "Enter") handleSave("campusLocation", locationDraft); if (e.key === "Escape") setEditingLocation(false); }}
              />
              <button
                onClick={() => handleSave("campusLocation", locationDraft)}
                disabled={saving}
                className="p-2.5 bg-green-500 hover:bg-green-400 text-black rounded-xl transition font-bold"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingLocation(false)}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <p className="text-foreground font-semibold text-sm flex items-center gap-2">
                {userProfile.campusLocation 
                  ? <><span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 text-xs font-bold">{userProfile.campusLocation}</span></>
                  : <span className="text-muted-foreground italic">Not set yet</span>
                }
              </p>
              <button
                onClick={() => { setLocationDraft(userProfile.campusLocation || ""); setEditingLocation(true); }}
                className="flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-lg hover:bg-primary/10"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
