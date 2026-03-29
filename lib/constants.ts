export const ALLOWED_DOMAINS = ["student.amity.edu"];

export const INITIAL_KARMA = 50;

export const GIG_CATEGORIES = [
  { key: "tutoring", label: "Tutoring", emoji: "📚" },
  { key: "delivery", label: "Delivery", emoji: "🛵" },
  { key: "coding", label: "Coding Help", emoji: "💻" },
  { key: "design", label: "Design", emoji: "🎨" },
  { key: "notes", label: "Notes / Study Material", emoji: "📝" },
  { key: "errands", label: "Errands", emoji: "🏃" },
  { key: "food", label: "Food Run", emoji: "🍜" },
  { key: "other", label: "Other", emoji: "✨" },
] as const;

export type GigCategory = (typeof GIG_CATEGORIES)[number]["key"];
