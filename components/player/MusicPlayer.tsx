// components/player/MusicPlayer.tsx
"use client";

import ProgressBar from "./ProgressBar";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearch } from "@/app/contexts/SearchContext";

export default function MusicPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    playNext, 
    playPrevious,
    queue
  } = useSearch();

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Player state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioError(false);
    };

    const handleEnded = () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentTime(0);
      if (isPlaying) {
        togglePlayPause();
      }
    };

    const handleError = () => {
      console.error("Audio playback error");
      setAudioError(true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [playNext]);

  
  useEffect(() => {
    if (currentTime >= duration && duration > 0 && isPlaying) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentTime(0);
      togglePlayPause();
    }
  }, [currentTime, duration, isPlaying, togglePlayPause]);


  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.url) return;

    // Check if source actually changed
    if (audio.src !== currentTrack.url) {
      setAudioError(false);
      audio.src = currentTrack.url;
      audio.load();
      
      if (isPlaying) {
        audio.play().catch(err => {
          console.error("Failed to play audio:", err);
          setAudioError(true);
        });
      }
    }
  }, [currentTrack?.url]);


  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.url) return;

    if (isPlaying) {
      audio.play().catch(err => {
        console.error("Failed to play audio:", err);
        setAudioError(true);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.url]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, []);

  // Handlers
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(Math.max(0, time), duration);
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // If no track is selected
  if (!currentTrack) {
    return (
      <div className="w-full z-50 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-md border-t border-white/10 shadow-2xl">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-center">
            <p className="text-gray-400 text-sm">Select a track to start playing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="z-50 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-md border-t border-white/10 shadow-2xl">
      {/* Main Player Bar */}
      <div className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">


          <div className="flex md:flex-row md:flex-1 justify-between w-full">

            {/* Track Info */}
            <div className="flex items-center gap-3 w-[60%] shrink-0">
              {/* Album art */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
                {currentTrack.thumbnail ? (
                  <img 
                    src={currentTrack.thumbnail} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg font-bold">
                    {currentTrack.title?.charAt(0) || "🎵"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm md:text-base font-medium truncate">
                  {currentTrack.title || "Unknown Track"}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {currentTrack.author || "Unknown Artist"}
                </p>
                {audioError && (
                  <p className="text-red-400 text-xs">⚠️ Playback error</p>
                )}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button
                onClick={playPrevious}
                disabled={queue.length <= 1}
                className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlayPause}
                className="bg-white text-black hover:bg-gray-200 transition-colors rounded-full p-2 md:p-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 md:w-6 md:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={playNext}
                disabled={queue.length <= 1}
                className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-3 w-full">
            <div className="flex items-center gap-3">

              <div className="flex-1">
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration || 0}
                  onSeek={handleSeek}
                />
              </div>

            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2 w-full md:w-32 shrink-0">
            <button
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="text-gray-300 hover:text-white transition-colors p-1"
              aria-label="Mute"
            >
              {volume === 0 ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-white h-1 rounded-lg cursor-pointer"
              aria-label="Volume"
            />
          </div>

          {/* Expand/Collapse Button (mobile) Lyrics */}
          {/* <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden text-gray-400 p-1"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button> */}
        </div>

        {/* Lyrics once Expanded */}


      </div>
    </div>
  );
}