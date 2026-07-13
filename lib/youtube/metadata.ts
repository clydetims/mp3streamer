// lib/youtube/metadata.ts

import { Innertube } from 'youtubei.js';

export function extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export async function getVideoMetadata(urlOrId: string) {
    const videoId = urlOrId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(urlOrId)
        ? urlOrId
        : extractYouTubeId(urlOrId);

    if (!videoId) {
        throw new Error("Invalid YouTube URL or Video ID format");
    }

    const youtube = await Innertube.create();
    const info = await youtube.getBasicInfo(videoId);

    return {
        id: videoId,
        title: info.basic_info?.title || 'Unknown Title',
        thumbnail: info.basic_info?.thumbnail?.[0]?.url || '',
        duration: String(info.basic_info?.duration || 0),
        views: info.basic_info?.view_count || 0,
        likes: 0,
    };
}