// app/api/metadata/route.ts

import { exec } from "child_process";
import { NextRequest, NextResponse } from "next/server";
import { promisify } from "util";

const execPromise = promisify(exec);


// Robust regex to capture standard, shortened, shorts, embeds, and live video IDs
function extraYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const urlOrId = searchParams.get('url');

    if (!urlOrId) {
        return NextResponse.json({ error: "Missing URL or Video ID" }, { status: 400 });
    }

    // 1. Determine if they provided an ID or a full URL
    // If it's already a strict 11-character alphanumeric string, use it.Otherwise extract it.
    const videoId = urlOrId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(urlOrId)
        ? urlOrId
        : extraYouTubeId(urlOrId);

    if (!videoId) {
        return NextResponse.json({ error: 'Invalid YouTube URL or Video ID format' }, { status: 400 });
    }


    try {
        // 2. Pass ONLY the safe, validated videoId instead of a wild URL string
        const { stdout, stderr } = await execPromise(`yt-dlp --no-playlist --dump-json "${videoId}"`);

        if (stdout) {
            console.warn('yt-dlp warning:', stderr);
        }

        const data = JSON.parse(stdout);

        return NextResponse.json({
            id: data.id,
            title: data.title,
            thumbnail: data.thumnail,
            duration: data.duration,
            views: data.view_count,
            likes: data.like_count,
            dislikes: data.dislike_count,
        })
    } catch (e) {
        console.error("yt-dlp extraction error:", e);
        return NextResponse.json({ error: "Failed to extract video metadata" }, { status: 500 });
    }
}


