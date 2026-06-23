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
  downloadTrack: (videoId: string, title: string) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
  isDownloading: boolean;
}

const SearchContext = React.createContext<SearchContextType | undefined>(undefined);

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
  const downloadTrack = async (videoId: string, title: string) => {
    setIsDownloading(true);
    
    try {
      // First, ensure the audio is prepared
      const response = await fetch(`/api/play?videoId=${videoId}`);
      if (!response.ok) throw new Error("Failed to prepare audio");
      
      const data = await response.json();
      
      if (data.audioUrl) {
        // Create a download link
        const link = document.createElement('a');
        link.href = data.audioUrl;
        
        // Clean filename
        const safeTitle = title
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '_')      // Replace spaces with underscores
          .substring(0, 100);        // Limit length
          
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