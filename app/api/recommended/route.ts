// app/api/recommended/route.ts
import { searchMusicRecommendations } from "@/lib/youtube/search";
import { NextResponse } from "next/server";

const MUSIC_CATEGORIES: Record<string, { label: string; query: string }> = {
  trending: {
    label: 'Trending Now',
    query: 'trending songs 2026 new music hits',
  },
  topHits: {
    label: 'Top Hits',
    query: 'top hits 2026 popular songs',
  },
  chillVibes: {
    label: 'Chill Vibes',
    query: 'chill lofi relaxing music',
  },
  workout: {
    label: 'Workout',
    query: 'workout motivation gym music',
  },
  focus: {
    label: 'Deep Focus',
    query: 'focus concentration study music',
  },
  party: {
    label: 'Party Mix',
    query: 'party dance hits 2026',
  },
  sleep: {
    label: 'Sleep & Relax',
    query: 'sleep relaxation calming music',
  },
  throwback: {
    label: 'Throwback Classics',
    query: '90s 2000s greatest hits',
  },
  acoustic: {
    label: 'Acoustic Sessions',
    query: 'acoustic unplugged songs',
  },
  electronic: {
    label: 'Electronic',
    query: 'electronic edm music 2026',
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category") || "trending";
  const limit = parseInt(searchParams.get("limit") || "20");
  
  const category = MUSIC_CATEGORIES[categoryId];
  
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  
  try {
    const results = await searchMusicRecommendations(category.query, limit);
    
    return NextResponse.json({
      category: category.label,
      results: results,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}