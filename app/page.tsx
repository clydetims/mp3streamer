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
    
        </div>
      </div>

      {/* Discover / Curated recommendations */}
      <div className="px-4">
        <RecommendedMusic />
      </div>
    </div>
  )
}