"use client";
import { Search, Filter, X, Target, Truck, Palette, Code, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const CategoryMap: Record<string, { label: string; icon: any; colorActive: string; colorInactive: string }> = {
  tutoring: { label: "📚 Tutoring", icon: Target, colorActive: "text-blue-200 bg-blue-600 border-blue-500 shadow-blue-500/50", colorInactive: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
  delivery: { label: "🍕 Delivery", icon: Truck, colorActive: "text-orange-100 bg-orange-500 border-orange-400 shadow-orange-500/50", colorInactive: "text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20" },
  design: { label: "🎨 Design", icon: Palette, colorActive: "text-pink-100 bg-pink-500 border-pink-400 shadow-pink-500/50", colorInactive: "text-pink-400 bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20" },
  coding: { label: "💻 Coding", icon: Code, colorActive: "text-cyan-100 bg-cyan-600 border-cyan-500 shadow-cyan-500/50", colorInactive: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20" },
  cleaning: { label: "🧹 Chores", icon: Sparkles, colorActive: "text-yellow-100 bg-yellow-600 border-yellow-500 shadow-yellow-500/50", colorInactive: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20" },
  other: { label: "✨ Other", icon: AlertCircle, colorActive: "text-gray-100 bg-gray-600 border-gray-500 shadow-gray-500/50", colorInactive: "text-gray-400 bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20" },
};

export function SearchBar({ activeCategory, onSearch, onCategoryChange }: {
  activeCategory: string | null;
  onSearch: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const categories = ["tutoring", "delivery", "design", "coding", "cleaning", "other"];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="w-full space-y-4 mb-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search by title, category, or user..."
          className="w-full pl-12 pr-10 py-3.5 card-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-shadow glass rounded-2xl border border-white/5 shadow-black/20"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        <div className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full card-surface border-border text-sm text-foreground shadow-sm opacity-80">
          <Filter className="h-3 w-3" /> Filters
        </div>

        {/* "All" — default no-filter chip */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`flex shrink-0 items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border shadow-sm ${
            activeCategory === null
              ? "text-white bg-primary border-primary scale-105 shadow-primary/40"
              : "text-muted-foreground bg-white/5 border-white/10 hover:bg-white/10 hover:text-foreground"
          }`}
        >
          🌐 All
        </button>

        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const mapData = CategoryMap[cat] || CategoryMap["other"];
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border shadow-sm ${
                isActive ? mapData.colorActive + " scale-105" : mapData.colorInactive
              }`}
            >
              {mapData.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
