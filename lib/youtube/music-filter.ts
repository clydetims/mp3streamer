// lib/youtube/music-filter.ts

/**
 * Keywords that indicate a video is actual music content
 */
const MUSIC_KEYWORDS = [
  'official audio',
  'official music video',
  'official lyric video',
  'official video',
  'lyric video',
  'music video',
  'audio',
  'lyrics',
  'visualizer',
  'official',
] as const;

/**
 * Keywords that indicate non-music content (to exclude)
 */
const NON_MUSIC_KEYWORDS = [
  'reaction',
  'review',
  'tutorial',
  'how to',
  'cover',
  'karaoke',
  'instrumental version',
  'remix contest',
  'podcast',
  'interview',
  'behind the scenes',
  'making of',
  'vlog',
  'live stream',
  'compilation',
  'playlist',
  'mix',
  'mashup',
  'nightcore',
  'sped up',
  'slowed',
  '8d audio',
  'bass boosted',
] as const;

/**
 * Common artist name indicators in titles
 * Artist name usually appears before " - " or before keywords
 */
const ARTIST_INDICATORS = [
  ' - ',
  ' – ',
  ' | ',
  ' // ',
] as const;

interface YouTubeVideo {
  videoId: string;
  title: string;
  author: string;
  image: string;
  views: string;
  likes?: string;
  duration?: string;
}

/**
 * Parse duration string to seconds
 * Supports formats: "3:45", "1:23:45", "145"
 */
export function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  
  const parts = duration.split(':').map(Number);
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS
    return parts[0];
  }
  
  return 0;
}

/**
 * Check if duration is less than 10 minutes (600 seconds)
 */
export function isShortDuration(duration: string | number): boolean {
  const seconds = typeof duration === 'string' 
    ? parseDurationToSeconds(duration) 
    : duration;
  
  return seconds > 0 && seconds <= 600; // 10 minutes = 600 seconds
}

/**
 * Check if title contains music-related keywords
 */
export function hasMusicKeywords(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return MUSIC_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

/**
 * Check if title contains non-music keywords to exclude
 */
export function hasNonMusicKeywords(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return NON_MUSIC_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

/**
 * Extract artist name from title
 * Examples:
 * - "Artist Name - Song Title (Official Music Video)" -> "Artist Name"
 * - "Song Title (Official Audio)" -> channel author
 */
export function extractArtistFromTitle(title: string, fallbackAuthor?: string): string {
  const lowerTitle = title.toLowerCase();
  
  // Try to find artist before separator
  for (const indicator of ARTIST_INDICATORS) {
    if (title.includes(indicator)) {
      const parts = title.split(indicator);
      const possibleArtist = parts[0].trim();
      
      // Validate that it looks like an artist name (not too long, contains letters)
      if (possibleArtist.length > 0 && 
          possibleArtist.length < 100 && 
          /[a-zA-Z]/.test(possibleArtist) &&
          !possibleArtist.startsWith('[') && // Filter out [TAG] prefixes
          !possibleArtist.startsWith('(')) {  // Filter out (TAG) prefixes
        return possibleArtist;
      }
    }
  }
  
  // If no artist found in title, use the channel author
  return fallbackAuthor || 'Unknown Artist';
}

/**
 * Extract song title (remove artist and keywords)
 */
export function extractSongTitle(fullTitle: string): string {
  let title = fullTitle;
  
  // Remove music keywords
  for (const keyword of MUSIC_KEYWORDS) {
    const regex = new RegExp(`\\(${keyword}\\)|\\[${keyword}\\]|\\b${keyword}\\b`, 'gi');
    title = title.replace(regex, '');
  }
  
  // Remove artist prefix if exists
  for (const indicator of ARTIST_INDICATORS) {
    if (title.includes(indicator)) {
      const parts = title.split(indicator);
      if (parts.length > 1) {
        title = parts.slice(1).join(indicator).trim();
        break;
      }
    }
  }
  
  // Clean up extra spaces and special characters
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
 * Higher score = more likely to be music
 */
export function getMusicScore(video: YouTubeVideo): number {
  let score = 0;
  const title = video.title.toLowerCase();
  
  // Check for official music keywords (high weight)
  if (title.includes('official music video')) score += 10;
  if (title.includes('official audio')) score += 9;
  if (title.includes('official lyric video')) score += 8;
  if (title.includes('official video')) score += 7;
  if (title.includes('lyric video')) score += 6;
  if (title.includes('music video')) score += 5;
  if (title.includes('visualizer')) score += 4;
  if (title.includes('audio')) score += 3;
  
  // Penalize non-music content
  if (title.includes('reaction')) score -= 10;
  if (title.includes('review')) score -= 8;
  if (title.includes('tutorial')) score -= 10;
  if (title.includes('cover')) score -= 3;
  if (title.includes('podcast')) score -= 10;
  if (title.includes('interview')) score -= 8;
  if (title.includes('live')) score -= 5;
  
  // Bonus for having artist separator (indicates proper title format)
  if (title.includes(' - ') || title.includes(' – ')) score += 2;
  
  return score;
}

/**
 * Filter and clean YouTube search results for music only
 */
export function filterMusicResults(videos: YouTubeVideo[]): YouTubeVideo[] {
  return videos
    .filter(video => {
      // Duration check - must be less than 10 minutes
      if (video.duration && !isShortDuration(video.duration)) {
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
      // Extract clean artist name
      author: extractArtistFromTitle(video.title, video.author),
      // Clean up the title to show song name
      title: extractSongTitle(video.title),
    }))
    .sort((a, b) => {
      // Sort by music score (higher first), then by views
      const scoreA = getMusicScore(a);
      const scoreB = getMusicScore(b);
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      // If scores are equal, sort by views (higher first)
      const viewsA = parseInt(a.views?.replace(/[^0-9]/g, '') || '0');
      const viewsB = parseInt(b.views?.replace(/[^0-9]/g, '') || '0');
      return viewsB - viewsA;
    });
}