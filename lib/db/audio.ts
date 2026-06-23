import { prisma } from "../prisma";


export async function getTrackFromDB(videoId: string) {
    return prisma.track.findUnique({
        where: {
            id: videoId,
        },
    })
}

export async function saveTrackToDB(data: {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  likes: string;
  duration: string;
  filePath: string;
}) {
  return prisma.track.upsert({
    where: { id: data.id },

    update: {
      title: data.title,
      thumbnail: data.thumbnail,
      views: data.views,
      likes: data.likes,
      duration: data.duration,
      filePath: data.filePath,
    },

    create: {
      ...data,
    },
  });
}