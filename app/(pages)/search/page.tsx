'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { searchAll, SpotifyAllResults, YouTubeVideo, SpotifyPlaylist, SpotifyArtist } from '@/lib/youtube/search'
import { useSearch } from '@/app/contexts/SearchContext'
import { 
  Play, 
  ArrowLeft, 
  Download, 
  Loader2, 
  Search, 
  X, 
  Music, 
  Clock, 
  Users
} from 'lucide-react'

const BROWSE_CATEGORIES = [
  { title: "Podcasts", bg: "bg-purple-700", img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=200&auto=format&fit=crop" },
  { title: "Made For You", bg: "bg-blue-800", img: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=200&auto=format&fit=crop" },
  { title: "New Releases", bg: "bg-pink-700", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=200&auto=format&fit=crop" },
  { title: "Pop", bg: "bg-green-700", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=200&auto=format&fit=crop" },
  { title: "Hip-Hop", bg: "bg-amber-700", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop" },
  { title: "Rock", bg: "bg-red-700", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=200&auto=format&fit=crop" },
  { title: "Discover", bg: "bg-purple-600", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop" },
  { title: "Indie", bg: "bg-emerald-700", img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=200&auto=format&fit=crop" },
  { title: "Workout", bg: "bg-neutral-600", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop" },
  { title: "Charts", bg: "bg-indigo-700", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop" },
]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') || ''

  const { 
    searchQuery, 
    setSearchQuery, 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlayPause,
    downloadTrack,
  } = useSearch()

  const [activeTab, setActiveTab] = useState<'All' | 'Songs' | 'Playlists' | 'Artists'>('All')
  const [results, setResults] = useState<SpotifyAllResults>({ songs: [], playlists: [], artists: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (urlQuery && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery)
    }
  }, [urlQuery])

  const updateUrl = (q: string) => {
    if (q.trim()) {
      router.replace(`/search?q=${encodeURIComponent(q)}`)
    } else {
      router.replace('/search')
    }
  }

  useEffect(() => {
    let active = true
    if (!searchQuery.trim()) {
      setResults({ songs: [], playlists: [], artists: [] })
      return
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await searchAll(searchQuery)
        if (active) {
          setResults(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (active) {
          setIsSearching(false)
        }
      }
    }, 400)

    return () => {
      active = false
      clearTimeout(delayDebounce)
    }
  }, [searchQuery])

  const handlePlayClick = (song: YouTubeVideo) => {
    if (currentTrack?.videoId === song.videoId) {
      togglePlayPause()
    } else {
      playTrack(song.videoId, song.title, song.image, song.author)
    }
  }

  const handleDownloadClick = async (e: React.MouseEvent, song: YouTubeVideo) => {
    e.stopPropagation()
    setDownloadingId(song.videoId)
    try {
      await downloadTrack(song.videoId, song.title)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloadingId(null)
    }
  }

  const selectCategory = (cat: string) => {
    setSearchQuery(cat)
    updateUrl(cat)
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    updateUrl(value)
  }

  const clearInput = () => {
    setSearchQuery('')
    updateUrl('')
    inputRef.current?.focus()
  }

  const formatViews = (views: string) => {
    const num = parseInt(views)
    if (isNaN(num)) return views
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return views
  }

  const firstSong = results.songs[0]
  const otherSongs = results.songs.slice(0, 4)
  const tabs = ['All', 'Songs', 'Playlists', 'Artists'] as const

  return (
    <div className="min-h-screen bg-[#121212] text-white p-2 md:p-6 pb-24">
      {/* Mobile Search Header */}
      <div className="flex items-center gap-3 md:hidden mb-4 px-1">
        <button onClick={() => router.back()} className="text-white p-1 hover:bg-neutral-800 rounded-full transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={handleInputChange}
            className="w-full h-10 pl-9 pr-9 bg-[#242424] text-white rounded-full text-xs font-semibold outline-none focus:bg-[#2a2a2a] focus:ring-1 focus:ring-white/20 transition-all placeholder-neutral-500"
          />
          {searchQuery && (
            <button onClick={clearInput} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-full">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs/Pills */}
      <div className="flex overflow-x-auto scrollbar-none gap-2 pb-3 mb-6 sticky top-0 bg-[#121212] z-10 py-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition duration-200 ${
              activeTab === tab 
                ? 'bg-white text-black' 
                : 'bg-[#2a2a2a] text-white hover:bg-[#3e3e3e]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Browse All (Default empty query state) */}
      {!searchQuery.trim() && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-white mb-6">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {BROWSE_CATEGORIES.map((cat, idx) => (
              <div
                key={cat.title + idx}
                onClick={() => selectCategory(cat.title)}
                className={`${cat.bg} aspect-[4/3] sm:aspect-square p-4 rounded-lg relative overflow-hidden cursor-pointer hover:brightness-110 active:scale-95 transition-all duration-200 shadow-md group`}
              >
                <span className="text-white text-base sm:text-lg font-bold tracking-tight block max-w-[80%] break-words leading-tight">
                  {cat.title}
                </span>
                <img 
                  src={cat.img} 
                  alt="" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover absolute -bottom-2 -right-2 rotate-[25deg] rounded-md shadow-lg group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {searchQuery.trim() && (
        <div>
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2 className="w-10 h-10 text-[#1db954] animate-spin" />
              <p className="text-neutral-400 text-sm">Searching for &ldquo;{searchQuery}&rdquo;...</p>
            </div>
          ) : (
            <div>
              {results.songs.length === 0 && results.playlists.length === 0 && results.artists.length === 0 ? (
                <div className="text-center py-24 text-neutral-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-bold text-white">No results found for &ldquo;{searchQuery}&rdquo;</h3>
                  <p className="text-sm mt-1">Please make sure your words are spelled correctly, or use fewer or different keywords.</p>
                </div>
              ) : (
                <div>
                  {/* TAB: ALL */}
                  {activeTab === 'All' && (
                    <div>
                      {/* Top Result & Songs layout */}
                      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 mb-8">
                        {/* Top Result */}
                        <div className="lg:col-span-5">
                          <h2 className="text-2xl font-bold text-white mb-4">Top result</h2>
                          {firstSong ? (
                            <div 
                              onClick={() => handlePlayClick(firstSong)}
                              className="bg-[#181818] hover:bg-[#282828] p-6 rounded-lg transition-all duration-300 relative group flex flex-col h-auto sm:h-[280px] cursor-pointer"
                            >
                              <div className="relative w-28 h-28 rounded-md overflow-hidden mb-6 shadow-lg flex-shrink-0 bg-neutral-800">
                                <img 
                                  src={firstSong.image} 
                                  alt={firstSong.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-extrabold text-white tracking-tight truncate max-w-full group-hover:text-green-500 transition-colors">
                                  {firstSong.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-3 text-sm text-[#a7a7a7] font-medium">
                                  <span className="truncate">{firstSong.author}</span>
                                  <span className="bg-[#121212] px-3 py-1 rounded-full text-xs text-white font-semibold flex-shrink-0">
                                    Song
                                  </span>
                                </div>
                              </div>

                              {/* Green play button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayClick(firstSong);
                                }}
                                className={`absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#1ed760] ${
                                  currentTrack?.videoId === firstSong.videoId && isPlaying
                                    ? 'opacity-100'
                                    : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                                }`}
                              >
                                {currentTrack?.videoId === firstSong.videoId && isPlaying ? (
                                  <span className="w-4 h-4 flex items-center justify-center gap-0.5">
                                    <span className="w-1 h-3 bg-black animate-pulse"></span>
                                    <span className="w-1 h-3 bg-black animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                                    <span className="w-1 h-3 bg-black animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                                  </span>
                                ) : (
                                  <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="bg-[#181818] p-6 rounded-lg h-[280px] flex items-center justify-center text-neutral-400">
                              No top results
                            </div>
                          )}
                        </div>

                        {/* Songs List */}
                        <div className="lg:col-span-7">
                          <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
                          <div className="space-y-1">
                            {otherSongs.map((song) => {
                              const isSongPlaying = currentTrack?.videoId === song.videoId && isPlaying;
                              return (
                                <div
                                  key={song.videoId}
                                  onClick={() => handlePlayClick(song)}
                                  onMouseEnter={() => setHoveredSongId(song.videoId)}
                                  onMouseLeave={() => setHoveredSongId(null)}
                                  className="flex items-center gap-4 hover:bg-white/10 p-2 rounded-md transition group select-none cursor-pointer"
                                >
                                  <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-neutral-800">
                                    <img 
                                      src={song.image} 
                                      alt={song.title} 
                                      className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                                      hoveredSongId === song.videoId || isSongPlaying ? 'opacity-100' : 'opacity-0'
                                    }`}>
                                      {isSongPlaying ? (
                                        <span className="w-3 h-3 flex items-center gap-0.5">
                                          <span className="w-0.5 h-3 bg-white animate-pulse"></span>
                                          <span className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                                          <span className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                                        </span>
                                      ) : (
                                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${
                                      currentTrack?.videoId === song.videoId ? 'text-green-500' : 'text-white'
                                    }`}>
                                      {song.title}
                                    </p>
                                    <p className="text-xs text-[#a7a7a7] mt-0.5 truncate">{song.author}</p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={(e) => handleDownloadClick(e, song)}
                                      disabled={downloadingId === song.videoId}
                                      className="p-2 rounded-full hover:bg-white/10 text-[#a7a7a7] hover:text-white
                                                opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100
                                                opacity-100 transition-opacity" // Always visible on mobile
                                      title="Download MP3"
                                    >
                                      {downloadingId === song.videoId ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                      ) : (
                                        <Download className="w-4 h-4" />
                                      )}
                                    </button>
                                    <span className="text-xs text-[#a7a7a7] w-12 text-right">
                                      {song.duration || song.timestamp || '--:--'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Featuring Artist Section */}
                      {firstSong && firstSong.author && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-white mb-4">Featuring {firstSong.author}</h2>
                          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                            {/* "This Is" Card */}
                            <div 
                              onClick={() => selectCategory(`This is ${firstSong.author}`)}
                              className="w-36 sm:w-44 bg-[#181818] hover:bg-[#282828] p-4 rounded-lg flex flex-col flex-shrink-0 cursor-pointer group transition duration-300"
                            >
                              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-4 shadow-md bg-neutral-800">
                                <img src={firstSong.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                  <span className="text-[10px] font-black text-[#1db954] uppercase tracking-widest leading-none">This Is</span>
                                  <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-full leading-tight mt-1">{firstSong.author}</span>
                                </div>
                              </div>
                              <p className="text-xs font-bold text-white truncate">This Is {firstSong.author}</p>
                              <p className="text-[10px] text-[#a7a7a7] mt-1 font-semibold leading-normal line-clamp-2">
                                The essential tracks, all in one.
                              </p>
                            </div>

                            {/* "Radio" Card */}
                            <div 
                              onClick={() => selectCategory(`${firstSong.author} Radio`)}
                              className="w-36 sm:w-44 bg-[#181818] hover:bg-[#282828] p-4 rounded-lg flex flex-col flex-shrink-0 cursor-pointer group transition duration-300"
                            >
                              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-4 shadow-md bg-neutral-800">
                                <img src={firstSong.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                  <span className="text-[9px] font-black text-white uppercase tracking-widest opacity-60 leading-none">Radio</span>
                                  <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-full leading-tight mt-1">{firstSong.author} Radio</span>
                                </div>
                              </div>
                              <p className="text-xs font-bold text-white truncate">{firstSong.author} Radio</p>
                              <p className="text-[10px] text-[#a7a7a7] mt-1 font-semibold leading-normal line-clamp-2">
                                Similar songs and artists.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Artists Row */}
                      {results.artists.length > 0 && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
                          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                            {results.artists.slice(0, 10).map((artist, idx) => (
                              <div
                                key={artist.name + idx}
                                onClick={() => selectCategory(artist.name)}
                                className="w-32 sm:w-36 bg-[#181818] hover:bg-[#282828] p-3 sm:p-4 rounded-lg flex flex-col flex-shrink-0 items-center text-center transition duration-300 cursor-pointer group"
                              >
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 shadow-md bg-neutral-800 flex-shrink-0">
                                  {artist.image ? (
                                    <img 
                                      src={artist.image} 
                                      alt={artist.name} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-neutral-400">
                                      <Users className="w-8 h-8" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-white truncate max-w-full">{artist.name}</p>
                                <p className="text-[10px] text-[#a7a7a7] mt-1 font-semibold">Artist</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Playlists Row */}
                      {results.playlists.length > 0 && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-white mb-4">Playlists</h2>
                          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                            {results.playlists.slice(0, 10).map((playlist, idx) => (
                              <div
                                key={playlist.listId + idx}
                                onClick={() => selectCategory(playlist.title)}
                                className="w-32 sm:w-36 bg-[#181818] hover:bg-[#282828] p-3 sm:p-4 rounded-lg flex flex-col flex-shrink-0 transition duration-300 cursor-pointer group"
                              >
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden mb-4 shadow-md bg-neutral-800 flex-shrink-0">
                                  {playlist.image ? (
                                    <img 
                                      src={playlist.image} 
                                      alt={playlist.title} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-neutral-400">
                                      <Music className="w-8 h-8" />
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectCategory(playlist.title);
                                    }}
                                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-[#1ed760]"
                                  >
                                    <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                                  </button>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-white truncate max-w-full mb-1">{playlist.title}</p>
                                <p className="text-[10px] text-[#a7a7a7] truncate max-w-full font-semibold">By {playlist.author}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: SONGS */}
                  {activeTab === 'Songs' && (
                    <div className="bg-[#181818] rounded-lg p-2 sm:p-6">
                      <div className="flex justify-between border-b border-[#2a2a2a] pb-2 text-[10px] sm:text-xs text-[#a7a7a7] uppercase tracking-wider font-bold mb-4 px-2 sm:px-4">
                        <div className="w-8 sm:w-12 text-center">#</div>
                        <div className="flex-1">Title</div>
                        <div className="hidden md:block w-48">Artist</div>
                        <div className="hidden sm:block w-32 text-right">Views</div>
                        <div className="w-16 text-right"><Clock className="w-4 h-4 inline" /></div>
                      </div>

                      <div className="space-y-1">
                        {results.songs.map((song, index) => {
                          const isSongPlaying = currentTrack?.videoId === song.videoId && isPlaying;
                          return (
                            <div
                              key={song.videoId}
                              onClick={() => handlePlayClick(song)}
                              onMouseEnter={() => setHoveredSongId(song.videoId)}
                              onMouseLeave={() => setHoveredSongId(null)}
                              className="flex items-center justify-between hover:bg-white/10 p-2 sm:p-3 rounded-md transition group select-none cursor-pointer px-2 sm:px-4"
                            >
                              <div className="w-8 sm:w-12 flex justify-center text-xs sm:text-sm font-medium text-[#a7a7a7]">
                                {hoveredSongId === song.videoId ? (
                                  <button onClick={(e) => { e.stopPropagation(); handlePlayClick(song); }}>
                                    {isSongPlaying ? (
                                      <span className="w-3.5 h-3.5 flex items-center gap-0.5">
                                        <span className="w-0.5 h-3.5 bg-white animate-pulse"></span>
                                        <span className="w-0.5 h-3.5 bg-white animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                                        <span className="w-0.5 h-3.5 bg-white animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                                      </span>
                                    ) : (
                                      <Play className="w-3.5 h-3.5 text-white fill-current animate-fade-in" />
                                    )}
                                  </button>
                                ) : isSongPlaying ? (
                                  <span className="w-3.5 h-3.5 flex items-center gap-0.5">
                                    <span className="w-0.5 h-3.5 bg-green-500 animate-pulse"></span>
                                    <span className="w-0.5 h-3.5 bg-green-500 animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                                    <span className="w-0.5 h-3.5 bg-green-500 animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                                  </span>
                                ) : (
                                  index + 1
                                )}
                              </div>

                              <div className="flex-1 min-w-0 flex items-center gap-3">
                                <img src={song.image} className="w-9 h-9 sm:w-10 sm:h-10 rounded object-cover bg-neutral-800" />
                                <div className="min-w-0">
                                  <p className={`text-xs sm:text-sm font-semibold truncate ${
                                    currentTrack?.videoId === song.videoId ? 'text-green-500' : 'text-white'
                                  }`}>
                                    {song.title}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-[#a7a7a7] mt-0.5 truncate md:hidden">{song.author}</p>
                                </div>
                              </div>

                              <div className="hidden md:block w-48 text-sm text-[#a7a7a7] truncate">
                                {song.author}
                              </div>

                              <div className="hidden sm:block w-32 text-sm text-[#a7a7a7] text-right truncate">
                                {formatViews(song.views || '0')}
                              </div>

                              <div className="w-20 sm:w-24 flex items-center justify-end gap-3 flex-shrink-0">
                                <button
                                  onClick={(e) => handleDownloadClick(e, song)}
                                  disabled={downloadingId === song.videoId}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-white/10 text-[#a7a7a7] hover:text-white"
                                >
                                  {downloadingId === song.videoId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>
                                <span className="text-xs sm:text-sm text-[#a7a7a7]">
                                  {song.duration || song.timestamp || '--:--'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB: PLAYLISTS */}
                  {activeTab === 'Playlists' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {results.playlists.map((playlist, idx) => (
                        <div
                          key={playlist.listId + idx}
                          onClick={() => selectCategory(playlist.title)}
                          className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg flex flex-col transition duration-300 cursor-pointer group"
                        >
                          <div className="relative aspect-square w-full rounded-md overflow-hidden mb-4 shadow-md bg-neutral-800">
                            {playlist.image ? (
                              <img 
                                src={playlist.image} 
                                alt={playlist.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-neutral-400">
                                <Music className="w-12 h-12" />
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  selectCategory(playlist.title);
                              }}
                              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-[#1ed760]"
                            >
                              <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-white truncate max-w-full mb-1">{playlist.title}</p>
                          <p className="text-xs text-[#a7a7a7] truncate max-w-full font-semibold">By {playlist.author}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB: ARTISTS */}
                  {activeTab === 'Artists' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {results.artists.map((artist, idx) => (
                        <div
                          key={artist.name + idx}
                          onClick={() => selectCategory(artist.name)}
                          className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg flex flex-col items-center text-center transition duration-300 cursor-pointer group"
                        >
                          <div className="relative aspect-square w-full rounded-full overflow-hidden mb-4 shadow-md bg-neutral-800">
                            {artist.image ? (
                              <img 
                                src={artist.image} 
                                alt={artist.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-neutral-400">
                                <Users className="w-12 h-12" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-bold text-white truncate max-w-full">{artist.name}</p>
                          <p className="text-xs text-[#a7a7a7] mt-1 font-semibold">Artist</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function YouTubeSearch() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 bg-[#121212] min-h-screen text-white">
        <Loader2 className="w-10 h-10 text-[#1db954] animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}