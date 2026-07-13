// lib/youtube/search.ts

import { Innertube } from 'youtubei.js';

let innertube: any = null;

async function getInnertube() {
  if (!innertube) {
    innertube = await Innertube.create();
  }
  return innertube;
}

export interface YouTubeVideo {
  videoId: string
  url: string
  title: string
  image: string
  author: string
  timestamp: string
  views?: string
  likes?: string
  duration?: string
}

const MUSIC_KEYWORDS = [
  'official audio',
  'official music video',
  'official lyric video',
  'official video',
  'lyric video',
  'music video',
  'visualizer',
  'official',
  'audio',
  'lyrics',
  'live performance'
] as const;

const NON_MUSIC_KEYWORDS = [
  'reaction',
  'review',
  'tutorial',
  'how to',
  'interview',
  'behind the scenes',
  'vlog',
  'compilation',
  'playlist',
  'mashup',
  'nightcore',
  '8d audio',
  'bass boosted',
  'sped up',
  'slowed',
  'remix contest',
  'karaoke',
  'live stream',
  'making of',
  'top songs',
  'top hits',
  'top trending'
] as const;

function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  
  const parts = duration.split(':').map(Number);
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return 0;
}

function isShortDuration(duration: string): boolean {
  const seconds = parseDurationToSeconds(duration);
  return seconds > 0 && seconds <= 1200;
}

function hasMusicKeywords(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return MUSIC_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

function hasNonMusicKeywords(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return NON_MUSIC_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

function extractArtistFromTitle(title: string, fallbackAuthor: string): string {
  const separators = [' - ', ' – ', ' | ', ' // '];
  
  for (const separator of separators) {
    if (title.includes(separator)) {
      const parts = title.split(separator);
      const possibleArtist = parts[0].trim();
      
      if (possibleArtist.length > 0 && 
          possibleArtist.length < 100 && 
          /[a-zA-Z]/.test(possibleArtist) &&
          !possibleArtist.startsWith('[') &&
          !possibleArtist.startsWith('(')) {
        return possibleArtist;
      }
    }
  }
  
  return fallbackAuthor;
}

function cleanSongTitle(fullTitle: string): string {
  let title = fullTitle;
  
  const patterns = [
    /\(official (audio|music video|lyric video|video)\)/gi,
    /\[official (audio|music video|lyric video|video)\]/gi,
    /\bofficial (audio|music video|lyric video|video)\b/gi,
    /\(audio\)|\[audio\]/gi,
    /\(lyrics?\)|\[lyrics?\]/gi,
    /\(visualizer\)|\[visualizer\]/gi,
    /\(official\)|\[official\]/gi,
  ];
  
  patterns.forEach(pattern => {
    title = title.replace(pattern, '');
  });
  
  const separators = [' - ', ' – ', ' | ', ' // '];
  for (const separator of separators) {
    if (title.includes(separator)) {
      const parts = title.split(separator);
      if (parts.length > 1) {
        title = parts.slice(1).join(separator).trim();
        break;
      }
    }
  }
  
  title = title
    .replace(/\s+/g, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/^\s*[-–|/]\s*/g, '')
    .trim();
  
  return title || fullTitle;
}

function getMusicScore(title: string): number {
  let score = 0;
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('official music video')) score += 10;
  if (lowerTitle.includes('official audio')) score += 9;
  if (lowerTitle.includes('official lyric video')) score += 8;
  if (lowerTitle.includes('official video')) score += 7;
  if (lowerTitle.includes('lyric video')) score += 6;
  if (lowerTitle.includes('music video')) score += 5;
  if (lowerTitle.includes('visualizer')) score += 4;
  if (lowerTitle.includes('audio')) score += 3;
  
  if (lowerTitle.includes('reaction')) score -= 10;
  if (lowerTitle.includes('review')) score -= 8;
  if (lowerTitle.includes('tutorial')) score -= 10;
  if (lowerTitle.includes('cover') && !lowerTitle.includes('official')) score -= 5;
  if (lowerTitle.includes('podcast')) score -= 10;
  if (lowerTitle.includes('interview')) score -= 8;
  if (lowerTitle.includes('live')) score -= 5;
  
  if (lowerTitle.includes(' - ') || lowerTitle.includes(' – ')) score += 2;
  
  return score;
}

function filterMusicVideos(videos: YouTubeVideo[]): YouTubeVideo[] {
  return videos
    .filter(video => {
      if (video.timestamp && !isShortDuration(video.timestamp)) {
        return false;
      }
      
      if (!hasMusicKeywords(video.title)) {
        return false;
      }
      
      if (hasNonMusicKeywords(video.title)) {
        return false;
      }
      
      return true;
    })
    .map(video => ({
      ...video,
      author: extractArtistFromTitle(video.title, video.author),
      title: cleanSongTitle(video.title),
    }))
    .sort((a, b) => {
      const scoreA = getMusicScore(a.title);
      const scoreB = getMusicScore(b.title);
      return scoreB - scoreA;
    });
}

export async function searchYouTube(
  query: string, 
  limit: number = 10,
  musicOnly: boolean = true
): Promise<YouTubeVideo[]> {
  if (!query) return [];

  try {
    const youtube = await getInnertube();
    
    const searchQuery = musicOnly 
      ? `${query} official audio OR official music video OR official lyric video`
      : query;
    
    const searchResults = await youtube.search(searchQuery, {
      type: 'video',
    });
    
    let videos: YouTubeVideo[] = [];
    
    if (searchResults?.results) {
      videos = searchResults.results
        .filter((item: any) => item.type === 'Video')
        .slice(0, limit * 2)
        .map((video: any) => ({
          videoId: video.id,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          title: video.title?.text || 'Unknown Title',
          image: video.thumbnails?.[0]?.url || '',
          author: video.author?.name || 'Unknown Artist',
          timestamp: video.duration?.text || '',
          views: video.view_count?.text || '0',
          duration: video.duration?.text || '',
        }));
    }
    
    if (musicOnly && videos.length > 0) {
      videos = filterMusicVideos(videos);
    }
    
    return videos.slice(0, limit);
    
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

export async function searchMusicRecommendations(
  query: string,
  limit: number = 10
): Promise<YouTubeVideo[]> {
  return searchYouTube(query, limit, true);
}

export interface SpotifyPlaylist {
  listId: string
  url: string
  title: string
  image: string
  author: string
  videoCount: number
}

export interface SpotifyArtist {
  name: string
  url: string
  image: string
  subCountLabel?: string
  videoCount?: number
}

export interface SpotifyAllResults {
  songs: YouTubeVideo[]
  playlists: SpotifyPlaylist[]
  artists: SpotifyArtist[]
}

export async function searchAll(
  query: string,
  limit: number = 10,
  musicOnly: boolean = true
): Promise<SpotifyAllResults> {
  if (!query) return { songs: [], playlists: [], artists: [] };

  try {
    const youtube = await getInnertube();
    
    const searchQuery = musicOnly 
      ? `${query} official audio OR official music video OR official lyric video`
      : query;
    
    const searchResults = await youtube.search(searchQuery, {
      type: 'video',
    });
    
    let videos: YouTubeVideo[] = [];
    let playlists: SpotifyPlaylist[] = [];
    let artists: SpotifyArtist[] = [];
    
    if (searchResults?.results) {
      searchResults.results.forEach((item: any) => {
        if (item.type === 'Video') {
          videos.push({
            videoId: item.id,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            title: item.title?.text || 'Unknown Title',
            image: item.thumbnails?.[0]?.url || '',
            author: item.author?.name || 'Unknown Artist',
            timestamp: item.duration?.text || '',
            views: item.view_count?.text || '0',
            duration: item.duration?.text || '',
          });
        } else if (item.type === 'Playlist') {
          playlists.push({
            listId: item.id,
            url: `https://www.youtube.com/playlist?list=${item.id}`,
            title: item.title?.text || 'Unknown Playlist',
            image: item.thumbnails?.[0]?.url || '',
            author: item.author?.name || 'Unknown Creator',
            videoCount: item.video_count || 0,
          });
        } else if (item.type === 'Channel') {
          artists.push({
            name: item.author?.name || 'Unknown Artist',
            url: item.author?.url || '',
            image: item.author?.thumbnails?.[0]?.url || '',
            subCountLabel: item.author?.subscriber_count || '',
            videoCount: 0,
          });
        }
      });
    }
    
    if (musicOnly && videos.length > 0) {
      videos = filterMusicVideos(videos);
    }
    
    return {
      songs: videos.slice(0, limit),
      playlists: playlists.slice(0, limit),
      artists: artists.slice(0, limit),
    };
    
  } catch (error) {
    console.error('Spotify-style search error:', error);
    return { songs: [], playlists: [], artists: [] };
  }
}