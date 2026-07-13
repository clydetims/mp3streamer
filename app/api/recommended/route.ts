// app/api/recommended/route.ts
import { searchMusicRecommendations } from "@/lib/youtube/search";
import { NextResponse } from "next/server";

const MUSIC_CATEGORIES: Record<string, { id: string; label: string; query: string; icon: string; }> = {
  opm: {
    id: 'opm',
    label: 'OPM',
    query: 'filipino music',
    icon: ''
  },
  trending: {
    id: 'trending',
    label: 'Trending Now',
    query: 'trending music 2026',
    icon: 'TrendingUp'
  },
  nostalgia: {
    id: 'nostalgia',
    label: 'Nostalgia',
    query: 'old songs',
    icon: ''
  },
  topHits: {
    id: 'topHits',
    label: 'Top Hits',
    query: 'top hits 2026',
    icon: 'Flame'
  },
  chillVibes: {
    id: 'chillVibes',
    label: 'Chill Vibes',
    query: 'lofi chill music mix',
    icon: 'Coffee'
  },
  focus: {
    id: 'focus',
    label: 'Deep Focus',
    query: 'focus music concentration',
    icon: 'Brain'
  },
  party: {
    id: 'party',
    label: 'Party Mix',
    query: 'party mix 2026 dance',
    icon: 'PartyPopper'
  },
  acoustic: {
    id: 'acoustic',
    label: 'Acoustic Sessions',
    query: 'acoustic cover songs',
    icon: 'Guitar'
  }
}

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