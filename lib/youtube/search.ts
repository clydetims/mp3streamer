// lib/youtube/search.ts

"use server"

import yts from 'yt-search'

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

/**
 * Music keywords that indicate actual music content
 */
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

/**
 * Keywords that indicate non-music content to exclude
 */
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

/**
 * Parse duration string to seconds
 * Supports formats: "3:45", "1:23:45"
 */
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

/**
 * Check if duration is less than 10 minutes (600 seconds)
 */
function isShortDuration(duration: string): boolean {
  const seconds = parseDurationToSeconds(duration);
  return seconds > 0 && seconds <= 1200; // 10 minutes
}

/**
 * Check if title contains music-related keywords
 */
function hasMusicKeywords(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return MUSIC_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

/**
 * Check if title contains non-music keywords to exclude
 */
function hasNonMusicKeywords(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return NON_MUSIC_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

/**
 * Extract artist name from title
 * Example: "Artist Name - Song Title (Official Music Video)" -> "Artist Name"
 */
function extractArtistFromTitle(title: string, fallbackAuthor: string): string {
  const separators = [' - ', ' – ', ' | ', ' // '];
  const lowerTitle = title.toLowerCase();
  
  // Try to find artist before separator
  for (const separator of separators) {
    if (title.includes(separator)) {
      const parts = title.split(separator);
      const possibleArtist = parts[0].trim();
      
      // Validate artist name
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

/**
 * Clean song title by removing artist prefix and music keywords
 */
function cleanSongTitle(fullTitle: string): string {
  let title = fullTitle;
  
  // Remove music keywords in parentheses or brackets
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
  
  // Remove artist prefix if exists
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
  
  // Clean up
  title = title
    .replace(/\s+/g, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/^\s*[-–|/]\s*/g, '')
    .trim();
  
  return title || fullTitle;
}

/**
 * Score how likely a video is to be actual music content
 */
function getMusicScore(title: string): number {
  let score = 0;
  const lowerTitle = title.toLowerCase();
  
  // High confidence music indicators
  if (lowerTitle.includes('official music video')) score += 10;
  if (lowerTitle.includes('official audio')) score += 9;
  if (lowerTitle.includes('official lyric video')) score += 8;
  if (lowerTitle.includes('official video')) score += 7;
  if (lowerTitle.includes('lyric video')) score += 6;
  if (lowerTitle.includes('music video')) score += 5;
  if (lowerTitle.includes('visualizer')) score += 4;
  if (lowerTitle.includes('audio')) score += 3;
  
  // Penalize non-music
  if (lowerTitle.includes('reaction')) score -= 10;
  if (lowerTitle.includes('review')) score -= 8;
  if (lowerTitle.includes('tutorial')) score -= 10;
  if (lowerTitle.includes('cover') && !lowerTitle.includes('official')) score -= 5;
  if (lowerTitle.includes('podcast')) score -= 10;
  if (lowerTitle.includes('interview')) score -= 8;
  if (lowerTitle.includes('live')) score -= 5;
  
  // Bonus for proper artist - title format
  if (lowerTitle.includes(' - ') || lowerTitle.includes(' – ')) score += 2;
  
  return score;
}

/**
 * Filter results for music-only content
 */
function filterMusicVideos(videos: YouTubeVideo[]): YouTubeVideo[] {
  return videos
    .filter(video => {
      // Duration check - must be less than 10 minutes
      if (video.timestamp && !isShortDuration(video.timestamp)) {
        return false;
      }
      
      // Must have music keywords
      if (!hasMusicKeywords(video.title)) {
        return false;
      }
      
      // Must not have non-music keywords
      if (hasNonMusicKeywords(video.title)) {
        return false;
      }
      
      return true;
    })
    .map(video => ({
      ...video,
      // Extract and set proper artist name
      author: extractArtistFromTitle(video.title, video.author),
      // Clean up the title
      title: cleanSongTitle(video.title),
    }))
    .sort((a, b) => {
      // Sort by music score (higher first)
      const scoreA = getMusicScore(a.title);
      const scoreB = getMusicScore(b.title);
      return scoreB - scoreA;
    });
}

/**
 * Search YouTube with optional music filtering
 */
export async function searchYouTube(
  query: string, 
  limit: number = 10,
  musicOnly: boolean = true
): Promise<YouTubeVideo[]> {
  if (!query) return []

  try {
    // Add music-specific terms to improve search
    const searchQuery = musicOnly 
      ? `${query} official audio OR official music video OR official lyric video`
      : query;
    
    const r = await yts(searchQuery)
    
    // Map to clean frontend object
    let videos: YouTubeVideo[] = r.videos
      .slice(0, limit * 2) // Fetch extra for filtering
      .map((video) => ({
        videoId: video.videoId,
        url: video.url,
        title: video.title,
        image: video.image || '',
        author: video.author?.name || 'Unknown Artist',
        timestamp: video.duration?.timestamp || '',
        views: String(video.views || 0),
        duration: video.duration?.timestamp || '',
      }));
    
    // Apply music filtering
    if (musicOnly) {
      videos = filterMusicVideos(videos);
    }
    
    // Return limited results
    return videos.slice(0, limit);
    
  } catch (error) {
    console.error('YouTube search error:', error)
    return []
  }
}

/**
 * Search specifically for music recommendations (always filtered)
 */
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

/**
 * Perform a search returning songs, playlists, and channels (artists)
 */
export async function searchAll(
  query: string,
  limit: number = 10,
  musicOnly: boolean = true
): Promise<SpotifyAllResults> {
  if (!query) return { songs: [], playlists: [], artists: [] }

  try {
    const searchQuery = musicOnly 
      ? `${query} official audio OR official music video OR official lyric video`
      : query;
      
    const r = await yts(searchQuery)

    // Map videos
    let videos: YouTubeVideo[] = r.videos
      .slice(0, limit * 2)
      .map((video) => ({
        videoId: video.videoId,
        url: video.url,
        title: video.title,
        image: video.image || '',
        author: video.author?.name || 'Unknown Artist',
        timestamp: video.duration?.timestamp || '',
        views: String(video.views || 0),
        duration: video.duration?.timestamp || '',
      }))

    if (musicOnly) {
      videos = filterMusicVideos(videos)
    }
    const songs = videos.slice(0, limit)

    // Map playlists
    const playlists: SpotifyPlaylist[] = r.playlists
      .slice(0, limit)
      .map((pl) => ({
        listId: pl.listId,
        url: pl.url,
        title: pl.title,
        image: pl.image || pl.thumbnail || '',
        author: pl.author?.name || 'Unknown Creator',
        videoCount: pl.videoCount,
      }))

    // Map channels/artists
    const artists: SpotifyArtist[] = r.channels
      .slice(0, limit)
      .map((ch) => ({
        name: ch.name || ch.title || 'Unknown Artist',
        url: ch.url,
        image: ch.image || ch.thumbnail || '',
        subCountLabel: ch.subCountLabel,
        videoCount: ch.videoCount,
      }))

    return { songs, playlists, artists }
  } catch (error) {
    console.error('Spotify-style search error:', error)
    return { songs: [], playlists: [], artists: [] }
  }
}
