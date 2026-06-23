'use client'

import React, { useState, useEffect } from 'react'
import { RecommendedMusic } from '@/components/music/RecommendedMusic'
import { useSearch } from '@/app/contexts/SearchContext'
import { Play, Loader2, Clock } from 'lucide-react'

const HOME_SHORTCUTS = [
  { 
    title: "Lofi Chill Beats", 
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=200&auto=format&fit=crop", 
    searchQuery: "lofi chill beats" 
  },
  { 
    title: "Synthwave Retro", 
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop", 
    searchQuery: "synthwave retro" 
  },
  { 
    title: "Acoustic Pop", 
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=200&auto=format&fit=crop", 
    searchQuery: "acoustic pop" 
  },
  { 
    title: "Deep Focus", 
    image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=200&auto=format&fit=crop", 
    searchQuery: "deep focus ambient" 
  },
  { 
    title: "Workout Energy", 
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop", 
    searchQuery: "workout music" 
  },
  { 
    title: "Global Top Hits", 
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop", 
    searchQuery: "top hits 2024" 
  },
]

export default function Home() {
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useSearch()
  const [greeting, setGreeting] = useState("Hello")
  const [playingShortcutId, setPlayingShortcutId] = useState<string | null>(null)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const handleShortcutClick = async (shortcut: typeof HOME_SHORTCUTS[number]) => {
    setPlayingShortcutId(shortcut.title)
    try {
      const { searchYouTube } = await import('@/lib/youtube/search')
      const results = await searchYouTube(shortcut.searchQuery, 1)
      if (results.length > 0) {
        const song = results[0]
        if (currentTrack?.videoId === song.videoId) {
          togglePlayPause()
        } else {
          await playTrack(song.videoId, song.title, song.image, song.author)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPlayingShortcutId(null)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#121212] to-[#121212] text-white pb-32">
      {/* Header Section */}
      <div className="px-4 pt-4 pb-2">
        {/* User greeting - smaller on mobile */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
          {greeting}
        </h1>
      </div>

      {/* Recently Played / Shortcuts - 2 column grid like Spotify */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-2">
          {HOME_SHORTCUTS.map((shortcut) => {
            const isThisShortcutLoading = playingShortcutId === shortcut.title;
            const isCurrentlyPlaying = currentTrack?.videoId && 
              playingShortcutId === null && 
              isPlaying;
            
            return (
              <div
                key={shortcut.title}
                onClick={() => handleShortcutClick(shortcut)}
                className="group relative flex items-center bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 active:scale-95 cursor-pointer"
              >
                {/* Image - smaller on mobile */}
                <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                  <img
                    src={shortcut.image}
                    alt={shortcut.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isThisShortcutLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1ed760]" />
                    </div>
                  )}
                </div>
                
                {/* Title */}
                <span className="flex-1 font-semibold text-xs md:text-sm px-3 line-clamp-2 leading-tight">
                  {shortcut.title}
                </span>

                {/* Play button appears on hover (desktop) or is hidden on mobile */}
                <div className="absolute right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden md:block">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1ed760] flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                    <Play className="w-4 h-4 md:w-5 md:h-5 text-black fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Played Section (Spotify-like) */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            Recently played
          </h2>
          <button className="text-xs md:text-sm text-neutral-400 hover:text-white transition-colors">
            Show all
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {/* Example recently played items */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="group cursor-pointer">
              <div className="relative aspect-square rounded-md overflow-hidden bg-neutral-800 mb-2">
                <img
                  src={`https://images.unsplash.com/photo-${1518609878373 + item}?q=80&w=200&auto=format&fit=crop`}
                  alt="Recently played"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                  <div className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center shadow-xl">
                    <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-xs md:text-sm font-medium line-clamp-1">Daily Mix {item}</p>
              <p className="text-[10px] md:text-xs text-neutral-400 line-clamp-1">Playlist • Spotify</p>
            </div>
          ))}
        </div>
      </div>

      {/* Discover / Curated recommendations */}
      <div className="px-4">
        <RecommendedMusic />
      </div>
    </div>
  )
}