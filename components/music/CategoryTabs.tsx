// components/music/CategoryTabs.tsx
import { LucideIcon } from "lucide-react";
import { MUSIC_CATEGORIES } from "@/lib/constants/categories";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}


export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {Object.entries(MUSIC_CATEGORIES).map(([key, category]) => (
        <button
          key={key}
          onClick={() => onCategoryChange(key)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            activeCategory === key
              ? "bg-primary text-primary-foreground shadow-lg scale-105"
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}