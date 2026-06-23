// lib/youtube/metadata.ts
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Extracts the 11-character video ID from various YouTube URL formats.
 */
export function extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Fetches metadata from yt-dlp using a sanitized video ID.
 */
export async function getVideoMetadata(urlOrId: string) {
    // 1. Validate if it's already a strict 11-character ID or pull it from the URL
    const videoId = urlOrId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(urlOrId)
        ? urlOrId
        : extractYouTubeId(urlOrId);

    if (!videoId) {
        throw new Error("Invalid YouTube URL or Video ID format");
    }

    // 2. Safely execute yt-dlp using only the alphanumeric ID
    const { stdout, stderr } = await execPromise(`yt-dlp --no-playlist --dump-json "${videoId}"`);

    // FIX: Checked stderr instead of stdout for warnings
    if (stderr) {
        console.warn('yt-dlp warning:', stderr);
    }

    const data = JSON.parse(stdout);

    return {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail, // FIX: Fixed typo from 'thumnail' to 'thumbnail'
        duration: data.duration,
        views: data.view_count,
        likes: data.like_count,
    };
}