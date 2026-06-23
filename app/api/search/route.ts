// app/api/search/route.ts

import { searchYouTube } from "@/lib/youtube/search";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get(`q`);

    if (!q) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 })
    }

    const results = await searchYouTube(q);

    return NextResponse.json({
        results
    })
}