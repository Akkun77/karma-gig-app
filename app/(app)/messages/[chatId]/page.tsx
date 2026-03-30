"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  limit
} from "firebase/firestore";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  
  const chatId = params.chatId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !chatId) return;

    const loadChatMeta = async () => {
      const snap = await getDoc(doc(db, "chats", chatId));
      if (snap.exists()) setActiveChat(snap.data());
    };
    loadChatMeta();

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      } as Message));
      setMessages(loaded);
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsub();
  }, [user, chatId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !activeChat) return;

    const msg = text.trim();
    setText("");

    try {
      // 1. Add message
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        text: msg,
        createdAt: serverTimestamp(),
      });
      // 2. Update chat metadata
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: msg,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const currentUid = user?.uid;
  const otherUid = activeChat?.participants?.find((p: string) => p !== currentUid);
  const otherName = activeChat?.participantNames?.[otherUid] || "Student";
  const gigTitle = activeChat?.gigTitle || "Unknown Gig";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] max-w-4xl mx-auto -mt-6">
      
      {/* Header */}
      <div className="card-surface px-4 py-3 flex items-center gap-4 z-10 sticky top-16 md:top-20 border-b border-border shadow-sm">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">{otherName}</h2>
            <p className="text-xs text-amber-500 font-medium tracking-wide flex items-center">
              Re: {gigTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 overscroll-contain">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <p className="text-muted-foreground font-medium bg-black/20 px-4 py-2 rounded-full text-sm">
              Beginning of your encrypted conversation. Say hi! 👋
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((m, i) => {
              const isMe = m.senderId === currentUid;
              const showTail = i === messages.length - 1 || messages[i + 1]?.senderId !== m.senderId;
              
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "card-surface glass text-foreground"
                    } ${
                      isMe
                        ? showTail ? "rounded-l-2xl rounded-tr-2xl rounded-br-sm" : "rounded-2xl"
                        : showTail ? "rounded-r-2xl rounded-tl-2xl rounded-bl-sm" : "rounded-2xl"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={endRef} className="h-4" />
      </div>

      {/* Input Form Fixed Bottom */}
      <div className="fixed bottom-[4rem] md:bottom-6 left-0 right-0 max-w-4xl mx-auto px-4 w-full pb-safe">
        <form onSubmit={sendMessage} className="flex items-end gap-2 bg-background/80 backdrop-blur-xl card-surface p-2 rounded-[2rem] shadow-xl border border-white/10">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="iMessage..."
            className="flex-1 bg-transparent px-4 py-3 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-lg disabled:opacity-50 disabled:scale-95 transition-all transform active:scale-90"
          >
             <Send className="w-5 h-5 -ml-1 mt-0.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
