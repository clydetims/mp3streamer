'use client'

import { MusicCard } from "../cards/MusicCard";
import { MUSIC_CATEGORIES } from "@/lib/constants/categories";
import { useQuery } from "@tanstack/react-query";

interface MusicResult {
  videoId: string;
  title: string;
  author: string;
  image: string;
  views: string;
  likes: string;
  duration: string;
}

export default function RecommendedTab() {
  const categories = Object.values(MUSIC_CATEGORIES);

  // 1. Update the fetch function to RETURN the data
  const fetchRecommendations = async (): Promise<Record<string, MusicResult[]>> => {
    const responses = await Promise.all(
      categories.map(async (category) => {
        const res = await fetch(`/api/recommended?category=${category.id}&limit=10`);

        if (!res.ok) {
          throw new Error(`Failed to fetch ${category.id}`);
        }

        const data = await res.json();

        return {
          id: category.id,
          results: data.results ?? [],
        };
      })
    );

    // Return the final formatted object so TanStack Query can cache it
    return Object.fromEntries(
      responses.map((item) => [item.id, item.results])
    );
  };

  // 2. Let TanStack Query handle the lifecycle, states, and caching
  const { data: musicLists, isLoading, error } = useQuery({
    queryKey: ["recommended-music"],
    queryFn: fetchRecommendations,
    staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes. No re-fetching when changing pages!
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load recommendations</div>;
  
  // Safe fallback if data is somehow undefined
  const musicData = musicLists || {};

  return (
    <>
      {categories.map((category) => (
        <div key={category.id} className="">
          <h2>{category.label}</h2>

          <div className="p-5 flex overflow-y-auto gap-5 no-scrollbar">
            {/* 3. Render directly using the query cache data */}
            {musicData[category.id]?.map((music) => (
              <div key={music.videoId} className="">
                <MusicCard
                  videoId={music.videoId}
                  title={music.title}
                  artist={music.author}
                  thumbnail={music.image}
                  views={music.views}
                  likes={music.likes}
                  duration={music.duration}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}