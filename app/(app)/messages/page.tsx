"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, MessageSquare, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ChatMeta {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  gigId: string;
  gigTitle: string;
  lastMessage: string;
  updatedAt: any;
}

export default function MessagesInboxPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMeta));
      loaded.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });
      setChats(loaded);
      setLoading(false);
    }, (error) => {
      console.error("Messages listening error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto py-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Messages</h1>
        <p className="text-muted-foreground">Coordinate with other students for your gigs.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center text-primary"><Loader2 className="animate-spin w-8 h-8" /></div>
        ) : chats.length === 0 ? (
          <div className="py-20 text-center card-surface glass border-dashed">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No messages yet</h3>
            <p className="text-muted-foreground font-medium mt-2">When you accept a gig or someone accepts yours, you can chat here.</p>
          </div>
        ) : (
          chats.map((chat, idx) => {
            const otherUid = chat.participants.find(p => p !== user?.uid) || "Unknown";
            const otherName = chat.participantNames?.[otherUid] || "Student";
            
            return (
              <Link key={chat.id} href={`/messages/${chat.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card-surface p-5 glass flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer group mb-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {otherName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-foreground truncate pr-4">{otherName}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {chat.updatedAt?.toMillis ? new Date(chat.updatedAt.toMillis()).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">
                         Gig: {chat.gigTitle}
                       </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {chat.lastMessage || "Started a chat..."}
                    </p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  );
}
