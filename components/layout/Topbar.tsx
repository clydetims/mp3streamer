// app/components/layout/Topbar.tsx
"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Bell, Search, X, User, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSearch } from "@/app/contexts/SearchContext"
// REMOVE THIS: import { searchYouTube, YouTubeVideo } from "@/lib/youtube/search"
// ADD THIS instead - import types from a separate types file
import type { YouTubeVideo } from "@/lib/youtube/types"

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    searchQuery, 
    setSearchQuery, 
    playTrack, 
    currentTrack,
    downloadTrack,
    isLoading 
  } = useSearch()
  
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  // Search Results State
  const [searchResults, setSearchResults] = React.useState<YouTubeVideo[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)

  // Store the timeout ID in a ref to persist across renders
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>(null)

  // Handle search query changes
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true)
        try {
          // Use API route instead of direct import
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
          if (!res.ok) throw new Error('Search failed')
          const data = await res.json()
          setSearchResults(data.songs || [])
          setShowResults(true)
        } catch (error) {
          console.error("Search failed:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Use event handlers instead of effects for clearing state
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setSearchQuery(newQuery)
    
    // Clear results immediately when query is cleared
    if (!newQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
  }

  const handleResultClick = (video: YouTubeVideo) => {
    // Clear search UI
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)

    // Use the context's playTrack instead of directly manipulating audio
    playTrack(video.videoId, video.title, video.image, video.author)
  }

  const handleSeeAllResults = () => {
    setShowResults(false)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-dropdown]")) {
        setShowNotifications(false)
        setShowUserMenu(false)
      }
      if (!target.closest("[data-search-area]")) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Derived state for showing results
  const shouldShowResults = showResults && searchResults.length > 0 && searchQuery.trim()
  const shouldShowNoResults = showResults && !isSearching && searchResults.length === 0 && searchQuery.trim()

  return (
    <header className={cn(
      "w-full rounded-t-xl flex items-center justify-between h-16 px-6 border-b-2 border-[#404040]",
      pathname === "/search" ? "hidden md:flex" : "flex"
    )}>


      {/* Right Section: Search + Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Search Bar with Real-time Results */}
        <div className="relative hidden md:block" data-search-area>
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 size-5 transition-colors duration-200 z-10",
              isSearchFocused ? "text-white" : "text-[#b3b3b3]"
            )}
          />
          <input
            type="text"
            placeholder="What do you want to play?"
            value={searchQuery}
            onChange={handleQueryChange}
            onFocus={() => {
              setIsSearchFocused(true)
              if (searchResults.length > 0) setShowResults(true)
            }}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              "w-[364px] h-12 pl-12 pr-10 bg-[#1f1f1f] border-none text-white placeholder-[#6a6a6a] rounded-full text-sm font-medium outline-none transition-all duration-200",
              isSearchFocused
                ? "bg-[#2a2a2a] ring-1 ring-white/20"
                : "hover:bg-[#2a2a2a]"
            )}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#b3b3b3] hover:text-white transition z-10"
            >
              <X className="size-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {shouldShowResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#282828] border border-neutral-700 rounded-lg overflow-hidden shadow-2xl max-h-96 overflow-y-auto z-50">
              {/* Loading State */}
              {isSearching && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                </div>
              )}

              {/* Results */}
              {!isSearching && searchResults.map((video) => (
                <div
                  key={video.videoId}
                  className="w-full flex items-center gap-3 p-3 hover:bg-neutral-700/50 transition text-left group"
                >
                  {/* Click to play */}
                  <button
                    onClick={() => handleResultClick(video)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <img 
                      src={video.image} 
                      alt={video.title}
                      className="w-10 h-10 rounded object-cover shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {video.title}
                      </p>
                      <p className="text-xs text-[#b3b3b3] mt-0.5">
                        {video.author}
                      </p>
                    </div>
                  </button>
                  
                  {/* Download button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTrack(video.videoId, video.title, video.author);
                    }}
                    className="p-2 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                    title="Download MP3"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {/* Playing indicator */}
                  {currentTrack?.videoId === video.videoId && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-xs text-green-500">Playing</span>
                    </div>
                  )}
                </div>
              ))}

              {/* See All Results Link */}
              <button
                onClick={handleSeeAllResults}
                className="w-full p-3 text-center text-sm font-bold text-[#b3b3b3] hover:text-white hover:bg-neutral-700/50 transition border-t border-neutral-700"
              >
                See all results for &ldquo;{searchQuery}&rdquo;
              </button>
            </div>
          )}

          {/* No Results State */}
          {shouldShowNoResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#282828] border border-neutral-700 rounded-lg overflow-hidden shadow-2xl z-50">
              <div className="p-6 text-center text-[#b3b3b3]">
                <Search className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No results found for &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-xs mt-1">Try different keywords</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search Icon */}
        <button 
          onClick={() => router.push('/search')}
          className="p-2 rounded-full hover:bg-neutral-800 text-[#b3b3b3] hover:text-white transition duration-200 md:hidden"
        >
          <Search className="size-5" />
        </button>

        {/* Notification Bell */}
        <div className="relative" data-dropdown>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
            }}
            className="p-2 rounded-full hover:bg-neutral-800 text-[#b3b3b3] hover:text-white transition duration-200"
          >
            <Bell className="size-5" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#282828] border border-neutral-700 rounded-lg shadow-2xl p-4 z-50">
              <p className="text-white font-semibold mb-2">Notifications</p>
              <p className="text-[#b3b3b3] text-sm">No new notifications</p>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" data-dropdown>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className="p-2 rounded-full hover:bg-neutral-800 text-[#b3b3b3] hover:text-white transition duration-200"
          >
            <User className="size-5" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#282828] border border-neutral-700 rounded-lg shadow-2xl py-1 z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-[#b3b3b3] hover:text-white hover:bg-neutral-700 transition">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-[#b3b3b3] hover:text-white hover:bg-neutral-700 transition">
                Settings
              </button>
              <hr className="border-neutral-700 my-1" />
              <button className="w-full text-left px-4 py-2 text-sm text-[#b3b3b3] hover:text-white hover:bg-neutral-700 transition">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}