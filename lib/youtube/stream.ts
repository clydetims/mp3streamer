// @lib/youtube/stream.ts
// lib/youtube/stream.ts

import { Innertube } from 'youtubei.js';

let innertubeInstance: any = null;

async function getInnertube() {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create();
  }
  return innertubeInstance;
}

/**
 * Get video info including audio format details
 */
export async function getVideoInfo(videoId: string) {
  const youtube = await getInnertube();
  const info = await youtube.getBasicInfo(videoId);
  
  // Try to get direct audio URL from streaming data
  const streamingData = info.streaming_data || info.player_response?.streaming_data;
  
  if (streamingData?.adaptive_formats) {
    const audioFormats = streamingData.adaptive_formats.filter(
      (f: any) => f.mime_type?.startsWith('audio/')
    );
    
    if (audioFormats.length > 0) {
      // Sort by bitrate (highest first)
      const bestAudio = audioFormats.sort((a: any, b: any) => 
        (b.bitrate || 0) - (a.bitrate || 0)
      )[0];
      
      return {
        videoId,
        title: info.basic_info?.title || 'Unknown',
        author: info.basic_info?.author || 'Unknown',
        thumbnail: info.basic_info?.thumbnail?.[0]?.url || '',
        duration: info.basic_info?.duration || 0,
        audioUrl: bestAudio.url || '',
        mimeType: bestAudio.mime_type || 'audio/mp4',
        contentLength: bestAudio.content_length || '0',
      };
    }
  }
  
  throw new Error('No audio format found');
}