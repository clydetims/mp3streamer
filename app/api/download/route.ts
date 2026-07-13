// app/api/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkDbCache } from "@/lib/db/cache";
import { extractArtistFromTitle, extractSongTitle } from "@/lib/youtube/music-filter";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const paramTitle = searchParams.get("title");
  const paramArtist = searchParams.get("artist");
  
  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }
  
  try {
    // Check if file exists in cache/db
    const cached = await checkDbCache(videoId);
    
    if (cached?.filePath) {
      // File exists locally
      const filePath = path.join(process.cwd(), 'public', cached.filePath.replace(/^\//, ''));
      
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const fileStream = fs.createReadStream(filePath);
        
        // Determine the artist and song title
        const artist = paramArtist || extractArtistFromTitle(cached.title);
        const songTitle = paramTitle || extractSongTitle(cached.title);
        
        // Construct display filename format "Title - Artist" (or just "Title" if no artist is found)
        const downloadName = artist && artist !== 'Unknown Artist'
          ? `${songTitle} - ${artist}`
          : songTitle;
          
        const safeTitle = downloadName
          .replace(/[^\w\s-]/g, '') // Keep alphanumeric, spaces, and hyphens
          .replace(/\s+/g, ' ')      // Normalize spaces
          .trim()
          .substring(0, 100);
        
        // Return file as download
        return new NextResponse(fileStream as any, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `attachment; filename="${safeTitle}.mp3"`,
            'Content-Length': stat.size.toString(),
          },
        });
      }
    }
    
    // If not cached, redirect to play endpoint to prepare the file
    return NextResponse.redirect(new URL(`/api/play?videoId=${videoId}`, req.url));
    
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}