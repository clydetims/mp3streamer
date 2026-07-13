// app/api/play/route.ts
/**
 * This API acts as the "Orchestrator" for playback.
 * 1. Check DB Cache
 * 2. Fetch Metadata (if needed)
 * 3. Check Storage Bucket (if needed)
 * 4. Initialize Stream Pipeline (if needed)
 * 5. Return JSON response to Player Component
 * 
 * 
 * 
 * Flow: 
 * Search -> 
 */
// app/api/play/route.ts

// app/api/play/route.ts

// app/api/play/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getVideoMetadata } from "@/lib/youtube/metadata";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
        return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    try {
        const meta = await getVideoMetadata(videoId);
        
        // Return our proxy URL instead of direct YouTube URL
        const audioUrl = `/api/stream?videoId=${videoId}`;
        
        return NextResponse.json({
            audioUrl: audioUrl,
            title: meta.title,
            thumbnail: meta.thumbnail,
            duration: meta.duration,
            views: meta.views,
        });
    } catch (error) {
        console.error("Play API error:", error);
        return NextResponse.json(
            { error: "Failed to get audio stream" },
            { status: 500 }
        );
    }
}