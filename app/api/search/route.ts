// app/api/search/route.ts
import { searchAll } from "@/lib/youtube/search";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "10");
  
  if (!query.trim()) {
    return NextResponse.json({ songs: [], playlists: [], artists: [] });
  }
  
  try {
    const results = await searchAll(query, limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", songs: [], playlists: [], artists: [] },
      { status: 500 }
    );
  }
}