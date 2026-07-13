// app/api/search/route.ts
import { searchAll } from "@/lib/youtube/search";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    
    if (!query.trim()) {
      return NextResponse.json({ songs: [], playlists: [], artists: [] });
    }
    
    console.log("Search API called with query:", query);
    const results = await searchAll(query, limit);
    console.log("Search results count:", results.songs.length);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { 
        error: "Search failed", 
        details: error instanceof Error ? error.message : String(error),
        songs: [], 
        playlists: [], 
        artists: [] 
      },
      { status: 500 }
    );
  }
}