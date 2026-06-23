// @lib/youtube/stream.ts
import { spawn } from 'child_process';

interface StreamOptions {
  signal?: AbortSignal;
}

// lib/youtube/stream.ts
import { exec } from "child_process";
import { createReadStream, existsSync } from "fs";
import { mkdir } from "fs/promises";
import { promisify } from "util";
import { Readable } from "stream";
import path from "path";

const execPromise = promisify(exec);

export async function extractAudioStream(videoId: string) {
    const outputDir = path.join(process.cwd(), 'public', 'audio');
    const outputPath = path.join(outputDir, `${videoId}.mp3`);
    
    // Create directory if it doesn't exist (works on all OS)
    if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true });
    }
    
    // Download and convert to audio file
    await execPromise(`yt-dlp -x --audio-format mp3 -o "${outputPath}" "${videoId}"`);
    
    // Create Node.js ReadStream
    const nodeStream = createReadStream(outputPath);
    
    // Convert Node.js ReadStream to Web ReadableStream
    const readableStream = Readable.toWeb(nodeStream) as ReadableStream;
    
    // Get file size for Content-Length header
    const { stat } = await import('fs/promises');
    const fileStats = await stat(outputPath);
    
    return {
        readableStream,
        filePath: `/audio/${videoId}.mp3`, // Public URL path
        headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': fileStats.size.toString(),
        }
    };
}