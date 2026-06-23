import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public', 'audio', `${videoId}.mp3`);

  const exists = existsSync(filePath);
  if (!exists) {
    return NextResponse.json({ exists: false, filePath: `/audio/${videoId}.mp3` });
  }

  try {
    const s = await stat(filePath);
    return NextResponse.json({
      exists: true,
      filePath: `/audio/${videoId}.mp3`,
      size: s.size,
      mtime: s.mtime,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
