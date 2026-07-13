// lib/youtube/types.ts
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