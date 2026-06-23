// components/cards/MusicCard.tsx
"use client";

import { Play, Heart, Eye, Clock, Music, Download, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSearch } from "@/app/contexts/SearchContext";

interface MusicCardProps {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  views: string;
  likes: string;
  duration: string;
}

export function MusicCard({
  videoId,
  title,
  artist,
  thumbnail,
  views,
  likes,
  duration,
}: MusicCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { playTrack, downloadTrack, isLoading, isDownloading, currentTrack } = useSearch();
  
  const isCurrentlyPlaying = currentTrack?.videoId === videoId;
  const [downloading, setDownloading] = useState(false);
  
  const formatViews = (views: string) => {
    const num = parseInt(views);
    if (isNaN(num)) return views;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return views;
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(videoId, title, thumbnail, artist);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    await downloadTrack(videoId, title);
    setDownloading(false);
  };

  return (
    <div
      className={`group relative bg-card hover:bg-accent rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border ${
        isCurrentlyPlaying 
          ? "border-primary shadow-primary/20" 
          : "border-border hover:border-primary/20"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Music className="w-12 h-12 text-muted-foreground" />
          </div>
        ) : (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Hover Overlay with Play and Download buttons */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="bg-primary rounded-full p-3 transform hover:scale-110 transition-transform shadow-lg"
            title="Play"
          >
            {isLoading && isCurrentlyPlaying ? (
              <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
            ) : (
              <Play className="w-5 h-5 text-primary-foreground fill-current" />
            )}
          </button>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-white/20 backdrop-blur-sm rounded-full p-3 transform hover:scale-110 transition-transform shadow-lg hover:bg-white/30 disabled:opacity-50"
            title="Download MP3"
          >
            {downloading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
        
        {/* Duration Badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium">
            <Clock className="w-3 h-3 inline mr-1" />
            {duration}
          </div>
        )}

        {/* Playing Indicator */}
        {isCurrentlyPlaying && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium">
            Now Playing
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {artist && artist !== "Unknown" && (
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Music className="w-3 h-3" />
            {artist}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViews(views)}
            </span>
            {likes && likes !== "0" && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatViews(likes)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}