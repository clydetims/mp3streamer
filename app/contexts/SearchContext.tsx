// app/contexts/SearchContext.tsx
"use client"
import * as React from "react";

interface TrackInfo {
  url: string;
  title: string;
  videoId: string;
  thumbnail?: string;
  author?: string;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Playback state
  currentTrack: TrackInfo | null;
  isPlaying: boolean;
  queue: TrackInfo[];
  
  // Playback actions
  playTrack: (videoId: string, title?: string, thumbnail?: string, author?: string) => Promise<void>;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: TrackInfo) => void;
  clearQueue: () => void;
  
  // Download action
  downloadTrack: (videoId: string, title: string, artist?: string) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
  isDownloading: boolean;
}

const SearchContext = React.createContext<SearchContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'recent_searches_music';
const MAX_RECENT_SEARCHES = 10;

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentTrack, setCurrentTrack] = React.useState<TrackInfo | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [queue, setQueue] = React.useState<TrackInfo[]>([]);
  const [queueIndex, setQueueIndex] = React.useState(-1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);


  // Function to play a track
  const playTrack = async (videoId: string, title?: string, thumbnail?: string, author?: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/play?videoId=${videoId}`);
      if (!response.ok) throw new Error("Failed to load track");
      
      const data = await response.json();
      
      const newTrack: TrackInfo = {
        url: data.audioUrl,
        title: title || data.title || "Unknown Track",
        videoId: videoId,
        thumbnail: thumbnail || data.thumbnail,
        author: author || data.author,
      };
      
      setCurrentTrack(newTrack);
      setIsPlaying(true);
      
      if (queueIndex === -1) {
        setQueue(prev => [...prev, newTrack]);
        setQueueIndex(0);
      }
      
    } catch (error) {
      console.error("Error playing track:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Download function
  const downloadTrack = async (videoId: string, title: string, artist?: string) => {
    setIsDownloading(true);
    
    try {
      // First, ensure the audio is prepared
      const response = await fetch(`/api/play?videoId=${videoId}`);
      if (!response.ok) throw new Error("Failed to prepare audio");
      
      const data = await response.json();
      
      if (data.audioUrl) {
        // Create a download link
        const link = document.createElement('a');
        
        // Pass title and artist parameters to download API for clean attachment filename
        link.href = `/api/download?videoId=${videoId}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist || '')}`;
        
        // Construct display filename
        const downloadName = artist && artist !== 'Unknown Artist'
          ? `${title} - ${artist}`
          : title;
          
        const safeTitle = downloadName
          .replace(/[^\w\s-]/g, '') // Keep alphanumeric, spaces, and hyphens
          .replace(/\s+/g, ' ')      // Normalize spaces
          .trim()
          .substring(0, 100);
          
        link.download = `${safeTitle}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Downloading: ${safeTitle}.mp3`);
      }
    } catch (error) {
      console.error("Error downloading track:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const playNext = () => {
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
      setIsPlaying(true);
    }
  };

  const addToQueue = (track: TrackInfo) => {
    setQueue(prev => [...prev, track]);
    if (!currentTrack) {
      setQueueIndex(0);
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(-1);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  return (
    <SearchContext.Provider 
      value={{ 
        searchQuery, 
        setSearchQuery,
        currentTrack,
        isPlaying,
        queue,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        addToQueue,
        clearQueue,
        downloadTrack,
        isLoading,
        isDownloading,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = React.useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}