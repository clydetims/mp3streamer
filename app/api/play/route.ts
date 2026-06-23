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
import { Prisma } from "@/generated/prisma/client";
import { getTrackFromDB } from "@/lib/db/audio";
import { checkDbCache, prisma, saveMediaToDb } from "@/lib/db/cache";
import { getVideoMetadata } from "@/lib/youtube/metadata";
import { extractAudioStream } from "@/lib/youtube/stream";
import { NextRequest, NextResponse } from "next/server";

// app/api/play/route.ts
// app/api/play/route.ts
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
        return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }
                    
    // 1. Check cache
    const cached = await checkDbCache(videoId);
    if (cached && cached.filePath) {
        return NextResponse.json({
            audioUrl: cached.filePath,
            title: cached.title,
            cached: true,
        });
    }

    // 2. Get metadata from YouTube
    const meta = await getVideoMetadata(videoId);

    // 3. Extract audio AND save to disk
    const { readableStream, filePath, headers } = await extractAudioStream(videoId);

    // Add this debug line BEFORE the saveMediaToDb call:
    const existingTrack = await prisma.track.findUnique({
        where: { id: videoId }
    });
    console.log("Existing track in DB:", JSON.stringify(existingTrack, null, 2));

    // 4. Save to DB with REAL filePath
    await saveMediaToDb({
        id: meta.id,
        title: meta.title,
        thumbnail: meta.thumbnail,
        views: String(meta.views),
        likes: String(meta.likes),
        duration: String(meta.duration),
        filePath: filePath,
    });

    // 5. Respond with a consistent JSON payload (audio URL) so the
    // client-side code can always call `res.json()` regardless of
    // cache state. Use the public `/audio/...` path saved by
    // `extractAudioStream`.
    return NextResponse.json({
        audioUrl: filePath,
        title: meta.title,
        cached: false,
    });
}