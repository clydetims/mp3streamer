// api/stream/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const headers = new Headers({
    'Content-Type': 'audio/mpeg',
    'Transfer-Encoding': 'chunked',
    'Connection': 'keep-alive',
  });

  // 1. Grab only the audio stream from YouTube
  const ytdlp = spawn('yt-dlp', ['-o', '-', '-f', 'bestaudio', videoUrl]);

  // 2. Transcode the raw audio stream into an MP3 file layout on the fly
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-f', 'mp3',
    '-acodec', 'libmp3lame',
    '-ab', '128k', // 128kbps is perfect for fast, clear web streaming
    'pipe:1'
  ]);

  // Link the output of yt-dlp to the input of ffmpeg
  ytdlp.stdout.pipe(ffmpeg.stdin);

  // 3. Construct a readable stream for Next.js out of FFmpeg's chunked outputs
  const readableStream = new ReadableStream({
    start(controller) {
      ffmpeg.stdout.on('data', (chunk) => controller.enqueue(chunk));
      ffmpeg.stdout.on('end', () => controller.close());
      ffmpeg.on('error', (err) => controller.error(err));
      
      // Clean up processes if the user closes the player tab or pauses
      request.signal.addEventListener('abort', () => {
        ytdlp.kill();
        ffmpeg.kill();
      });
    }
  });

  return new NextResponse(readableStream, { headers });
}


