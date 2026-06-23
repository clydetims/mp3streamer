// components/music/RecommendedMusic.tsx (simplified - no need to pass onPlay)
"use client";

import { useState, useEffect, useCallback } from "react";
import { MusicCard } from "@/components/cards/MusicCard";
import { CategoryTabs } from "@/components/music/CategoryTabs";
import { Loader2, Music } from "lucide-react";

interface MusicResult {
  videoId: string;
  title: string;
  author: string;
  image: string;
  views: string;
  likes: string;
  duration: string;
}

export function RecommendedMusic() {
  const [activeCategory, setActiveCategory] = useState("trending");
  const [musicList, setMusicList] = useState<MusicResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/recommended?category=${category}&limit=20`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      setMusicList(data.results || []);
    } catch (err) {
      setError("Failed to load recommendations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations(activeCategory);
  }, [activeCategory, fetchRecommendations]);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Discover Music
        </h2>
        <p className="text-neutral-400 text-sm">
          Explore curated playlists and trending tracks
        </p>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading recommendations...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => fetchRecommendations(activeCategory)}
            className="mt-4 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {musicList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {musicList.map((music) => (
                <MusicCard
                  key={music.videoId}
                  videoId={music.videoId}
                  title={music.title}
                  artist={music.author}
                  thumbnail={music.image}
                  views={music.views}
                  likes={music.likes}
                  duration={music.duration}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No music found for this category</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}