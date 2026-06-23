// lib/db/cache.ts
import { prisma } from "@/lib/prisma";

export { prisma };

export async function checkDbCache(videoId: string) {
    try {
        return await prisma.track.findUnique({
            where: { id: videoId },
        });
    } catch (error) {
        console.error("Prisma lookup failed:", error);
        return null;
    }
}

interface SaveTrackInput {
    id: string;
    title: string;
    thumbnail: string;
    views: string;
    duration: string;
    likes: string;
    filePath: string;
}

export async function saveMediaToDb(data: SaveTrackInput) {
    try {
        const sanitizedData = {
            id: data.id,
            title: data.title || "Unknown Title",
            thumbnail: data.thumbnail || "",
            views: data.views || "0",
            likes: data.likes || "0",
            duration: data.duration || "0",
            filePath: data.filePath || "",
        };

        console.log(`Prisma: Caching track metadata for video ID: ${data.id}`);

        // Try to find existing record
        const existing = await prisma.track.findUnique({
            where: { id: sanitizedData.id }
        });

        if (existing) {
            // Update ALL fields
            return await prisma.track.update({
                where: { id: sanitizedData.id },
                data: {
                    title: sanitizedData.title,
                    thumbnail: sanitizedData.thumbnail,
                    views: sanitizedData.views,
                    likes: sanitizedData.likes,
                    duration: sanitizedData.duration,
                    filePath: sanitizedData.filePath,
                }
            });
        } else {
            // Create new record
            return await prisma.track.create({
                data: {
                    ...sanitizedData,
                    createdAt: new Date(),
                }
            });
        }
    } catch (error) {
        console.error("Prisma operation failed:", error);
        console.error("Data that caused the error:", data);
        return null;
    }
}