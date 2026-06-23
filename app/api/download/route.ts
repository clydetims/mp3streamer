// app/api/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkDbCache } from "@/lib/db/cache";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  
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
        
        // Create safe filename
        const safeTitle = (cached.title || 'download')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '_')
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