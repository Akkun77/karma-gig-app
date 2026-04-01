"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";

export function ReviewModal({
  isOpen,
  sellerName,
  onSubmit,
}: {
  isOpen: boolean;
  sellerName: string;
  onSubmit: (rating: number, reviewText: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          className="w-full max-w-sm overflow-hidden border border-white/10 rounded-3xl shadow-2xl glass card-surface"
        >
          <div className="p-6">
            <h2 className="text-2xl font-black text-center mb-1">Rate {sellerName}</h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              Your honest feedback helps the community.
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${(hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-muted-foreground/30"}`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <MessageSquare size={16} /> Optional Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did they do well?"
                className="w-full p-3 h-24 text-sm bg-black/20 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                maxLength={200}
              />
            </div>

            <button
              onClick={() => {
                if (rating === 0) return;
                setIsSubmitting(true);
                onSubmit(rating, reviewText);
              }}
              disabled={rating === 0 || isSubmitting}
              className={`w-full py-3.5 rounded-xl font-black text-lg transition-all shadow-lg ${rating > 0 ? "bg-primary text-white hover:bg-primary/90 shadow-primary/30" : "bg-white/5 text-muted-foreground cursor-not-allowed"}`}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
