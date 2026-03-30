"use client";
import { useEffect, useState, useRef } from "react";
import { Bell, CheckSquare, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface AppNotification {
  id: string;
  userId: string;
  sourceId: string;
  sourceName: string;
  type: "gig_accepted" | "message" | "system";
  text: string;
  link: string;
  read: boolean;
  createdAt: any;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(loaded);
    });

    return () => unsub();
  }, [user]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const ref = doc(db, "notifications", id);
      await updateDoc(ref, { read: true });
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, "notifications", n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    router.push(notif.link);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        
        {/* Unread Ping */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-background"></span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 card-surface p-4 glass shadow-2xl rounded-2xl border border-white/5 z-50 origin-top-right"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full text-xs font-black">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-xs font-bold text-primary hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  <CheckSquare className="w-3 h-3" /> Mark Read
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto no-scrollbar space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 opacity-50" />
                  </div>
                  <p className="font-medium">You're all caught up!</p>
                  <p className="text-xs mt-1">Gigs and messages will appear here.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer flex gap-3 ${
                      notif.read ? "bg-transparent border-transparent hover:bg-white/5" : "bg-primary/5 border-primary/20 shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center font-black ${
                      notif.type === "gig_accepted" ? "bg-emerald-500/20 text-emerald-500" : 
                      notif.type === "message" ? "bg-indigo-500/20 text-indigo-500" : "bg-primary/20 text-primary"
                    }`}>
                      {notif.sourceName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${notif.read ? "text-foreground" : "font-semibold text-foreground"}`}>
                        <span className="font-bold">{notif.sourceName}</span> {notif.text}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-sm shadow-primary/50" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
