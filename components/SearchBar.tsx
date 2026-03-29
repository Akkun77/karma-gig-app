"use client";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="w-full space-y-3 mb-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search by title, category, or user..."
          className="w-full pl-12 pr-10 py-3.5 card-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-shadow glass"
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
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full card-surface border-border text-sm text-foreground shadow-sm">
          <Filter className="h-3 w-3" /> Filters
        </div>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(isActive ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary karma-glow tracking-wide"
                  : "glass text-muted-foreground hover:text-foreground border-border hover:bg-white/5"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
