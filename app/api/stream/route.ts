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


// // app/api/stream/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { spawn } from 'child_process';
// import { Readable, PassThrough } from 'stream';
// // import { checkDbCache, saveMediaToDb } from '@/lib/cache';
// // import { uploadStreamToStorage } from '@/lib/storage';

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const videoId = searchParams.get('id');

//   // Strict 11-char validation firewall
//   if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
//     return NextResponse.json({ error: 'Invalid or missing Video ID' }, { status: 400 });
//   }

//   try {
//     // ==========================================
//     // 1. CHECK DATABASE CACHE
//     // ==========================================
//     // const cachedMedia = await checkDbCache(videoId);
//     // if (cachedMedia && cachedMedia.mp3Url) {
//     //   // If it exists in storage, redirect the user's browser directly to the S3/R2 link
//     //   return NextResponse.redirect(cachedMedia.mp3Url);
//     // }

//     // ==========================================
//     // 2. CACHE MISS: ASSEMBLE PIPELINE
//     // ==========================================
//     const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

//     const ytdlp = spawn('yt-dlp', ['-o', '-', '-f', 'bestaudio', videoUrl]);
//     const ffmpeg = spawn('ffmpeg', [
//       '-i', 'pipe:0',
//       '-f', 'mp3',
//       '-acodec', 'libmp3lame',
//       '-ab', '128k',
//       'pipe:1'
//     ]);

//     // Connect yt-dlp output to ffmpeg input
//     ytdlp.stdout.pipe(ffmpeg.stdin);

//     // Fork the output: One stream for the user response, one for cloud storage uploading
//     const clientStream = new PassThrough();
//     const storageStream = new PassThrough();
//     ffmpeg.stdout.pipe(clientStream);
//     ffmpeg.stdout.pipe(storageStream);

//     // ==========================================
//     // 3. PROCESS CLEANUP & ERROR HANDLING
//     // ==========================================
//     const killProcesses = () => {
//       if (!ytdlp.killed) ytdlp.kill();
//       if (!ffmpeg.killed) ffmpeg.kill();
//     };

//     ytdlp.on('error', (err) => {
//       console.error('yt-dlp failed:', err);
//       killProcesses();
//     });

//     ffmpeg.on('error', (err) => {
//       console.error('ffmpeg failed:', err);
//       killProcesses();
//     });

//     // Cleanup if client closes the tab / pauses playback mid-stream
//     request.signal.addEventListener('abort', () => {
//       console.log(`Client disconnected from streaming video ID: ${videoId}`);
//       killProcesses();
//     });

//     // ==========================================
//     // 4. BACKGROUND CLOUD UPLOAD & DB STORAGE
//     // ==========================================
//     // We execute this asynchronously without awaiting it so the user gets instant audio.
//     // uploadStreamToStorage(storageStream, `${videoId}.mp3`)
//     //   .then(async (uploadedUrl) => {
//     //      // Fetch additional metadata via yt-dlp dump-json if desired, then save
//     //      await saveMediaToDb(videoId, uploadedUrl);
//     //   })
//     //   .catch(err => console.error("Background caching upload failed:", err));


//     // ==========================================
//     // 5. RESPOND WITH NATIVE WEB STREAM
//     // ==========================================
//     // Readable.toWeb automatically handles stream backpressure perfectly.
//     const webStream = Readable.toWeb(clientStream) as unknown as ReadableStream;

//     return new NextResponse(webStream, {
//       headers: {
//         'Content-Type': 'audio/mpeg',
//         'Transfer-Encoding': 'chunked',
//         'Connection': 'keep-alive',
//         'Cache-Control': 'no-cache, no-store, must-revalidate'
//       },
//     });

//   } catch (error) {
//     console.error("Streaming route crash:", error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }