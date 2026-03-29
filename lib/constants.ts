export const ALLOWED_DOMAINS = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS || "s.amity.edu").split(",").map(d => d.trim().toLowerCase());

export const INITIAL_KARMA = 50;

export const GIG_CATEGORIES = [
  { key: "tutoring", label: "Tutoring", emoji: "??" },
  { key: "delivery", label: "Delivery", emoji: "??" },
  { key: "coding", label: "Coding Help", emoji: "??" },
  { key: "design", label: "Design", emoji: "??" },
  { key: "notes", label: "Notes / Study Material", emoji: "??" },
  { key: "errands", label: "Errands", emoji: "??" },
  { key: "food", label: "Food Run", emoji: "??" },
  { key: "other", label: "Other", emoji: "?" },
] as const;

export type GigCategory = (typeof GIG_CATEGORIES)[number]["key"];
