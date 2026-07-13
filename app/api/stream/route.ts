// app/api/stream/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getVideoInfo } from "@/lib/youtube/stream";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const info = await getVideoInfo(videoId);
    
    if (!info.audioUrl) {
      throw new Error('No audio URL found');
    }
    
    // Fetch the audio from YouTube
    const response = await fetch(info.audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }
    
    // Stream it back to the client with proper headers
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': info.mimeType || 'audio/mp4',
        'Content-Length': response.headers.get('content-length') || info.contentLength,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json(
      { error: "Stream failed" },
      { status: 500 }
    );
  }
}