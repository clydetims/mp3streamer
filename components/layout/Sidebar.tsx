"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  ArrowRight, 
  Heart, 
  Music, 
  ChevronLeft, 
  ChevronRight,
  ListMusic
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

// Types
type SidebarContextProps = {
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

interface Playlist {
  id: string
  title: string
  subtitle: string
  type: "liked" | "playlist" | "podcast"
  colorClass?: string
}

// Context
const SidebarContext = React.createContext<SidebarContextProps | null>(null)

// Custom Hook
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

// Provider Component
export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const toggleSidebar = React.useCallback(() => setOpen((prev) => !prev), [])

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <TooltipProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-black text-[#b3b3b3] font-sans p-2 gap-2">
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// Trigger Component
export function SidebarTrigger({ className }: { className?: string }) {
  const { open, toggleSidebar } = useSidebar()
  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        "flex items-center justify-center p-2 rounded-full hover:bg-neutral-800 text-[#b3b3b3] hover:text-white transition duration-200",
        className
      )}
      aria-label="Toggle Sidebar"
    >
      {open ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
    </button>
  )
}

// Mock Data
const mockPlaylists: Playlist[] = [
  { 
    id: "liked", 
    title: "Liked Songs", 
    subtitle: "Playlist • 42 songs", 
    type: "liked", 
    colorClass: "from-indigo-700 to-purple-950" 
  },
  { 
    id: "1", 
    title: "Chill Acoustic Vibes", 
    subtitle: "Playlist • HP", 
    type: "playlist", 
    colorClass: "from-emerald-700 to-neutral-900" 
  },
  { 
    id: "2", 
    title: "Discover Weekly", 
    subtitle: "Playlist • Spotify", 
    type: "playlist", 
    colorClass: "from-blue-600 to-indigo-950" 
  },
  { 
    id: "3", 
    title: "Lofi Beats for Coding", 
    subtitle: "Playlist • HP", 
    type: "playlist", 
    colorClass: "from-rose-700 to-amber-950" 
  },
  { 
    id: "4", 
    title: "The Joe Rogan Experience", 
    subtitle: "Podcast • Joe Rogan", 
    type: "podcast", 
    colorClass: "from-zinc-800 to-neutral-900" 
  },
  { 
    id: "5", 
    title: "Late Night Drive", 
    subtitle: "Playlist • Spotify", 
    type: "playlist", 
    colorClass: "from-violet-800 to-black" 
  }
]

// Navigation Item Component
function NavItem({ 
  href, 
  icon: Icon, 
  label, 
  isActive 
}: { 
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean 
}) {
  const { open } = useSidebar()
  
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-5 font-bold transition duration-200 group",
        isActive ? "text-white" : "text-[#b3b3b3] hover:text-white"
      )}
    >
      <Icon className="size-6 shrink-0" />
      {open && <span>{label}</span>}
    </Link>
  )
}

// Playlist Item Component
function PlaylistItem({ playlist }: { playlist: Playlist }) {
  const { open } = useSidebar()
  const isLiked = playlist.type === "liked"
  
  const playlistElement = (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-900 cursor-pointer transition duration-200",
        !open && "justify-center"
      )}
    >
      {/* Playlist Art / Icon */}
      <div
        className={cn(
          "size-12 rounded-md shrink-0 flex items-center justify-center bg-gradient-to-br shadow-md overflow-hidden",
          playlist.colorClass || "from-neutral-800 to-neutral-900"
        )}
      >
        {isLiked ? (
          <Heart className="size-5 text-white fill-white" />
        ) : playlist.type === "podcast" ? (
          <ListMusic className="size-5 text-emerald-400" />
        ) : (
          <Music className="size-5 text-neutral-400" />
        )}
      </div>

      {/* Playlist Details (Only when open) */}
      {open && (
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-sm font-semibold truncate">
            {playlist.title}
          </h4>
          <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
            {playlist.subtitle}
          </p>
        </div>
      )}
    </div>
  )

  // If collapsed, wrap in tooltip
  if (!open) {
    return (
      <Tooltip key={playlist.id} delayDuration={300}>
        <TooltipTrigger asChild>{playlistElement}</TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="center" 
          className="bg-[#282828] text-white border-none shadow-xl font-bold py-1.5 px-3 rounded-md text-xs"
        >
          {playlist.title}
        </TooltipContent>
      </Tooltip>
    )
  }

  return playlistElement
}

// Filter Pill Component
function FilterPill({ 
  tag, 
  isActive, 
  onClick 
}: { 
  tag: string
  isActive: boolean
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs font-semibold px-3 py-1.5 rounded-full transition duration-200 whitespace-nowrap",
        isActive
          ? "bg-white text-black"
          : "bg-[#2a2a2a] text-white hover:bg-[#3e3e3e]"
      )}
    >
      {tag}
    </button>
  )
}

// Main Sidebar Component
export function Sidebar() {
  const { open, toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const [activeTag, setActiveTag] = React.useState<string | null>(null)

  const handleTagClick = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag))
  }

  const filteredPlaylists = activeTag
    ? mockPlaylists.filter((p) => {
        if (activeTag === "Playlists") return p.type === "playlist" || p.type === "liked"
        if (activeTag === "Podcasts") return p.type === "podcast"
        return true
      })
    : mockPlaylists

  return (
    <div
      className={cn(
        "hidden md:flex flex-col gap-2 h-full transition-all duration-300 ease-in-out shrink-0 select-none",
        open ? "w-[280px]" : "w-[72px]"
      )}
    >
      {/* Navigation Box */}
      <div className="bg-[#121212] rounded-xl p-5 flex flex-col gap-4">
        <NavItem 
          href="/" 
          icon={Home} 
          label="Home" 
          isActive={pathname === "/"} 
        />
        <NavItem 
          href="/search" 
          icon={Search} 
          label="Search" 
          isActive={pathname === "/search"} 
        />
      </div>

      {/* Library Box */}
      <div className="bg-[#121212] rounded-xl flex-1 p-2 flex flex-col min-h-0 gap-3">
        {/* Library Header */}
        <div className="flex items-center justify-between px-3 py-2 text-[#b3b3b3]">
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-3 font-bold hover:text-white transition duration-200 outline-none"
          >
            <Library className="size-6 shrink-0" />
            {open && <span>Your Library</span>}
          </button>
          
          {open && (
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-full hover:bg-neutral-800 hover:text-white transition duration-200 outline-none">
                <Plus className="size-4" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-neutral-800 hover:text-white transition duration-200 outline-none">
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tags / Filter Pills (Only when open) */}
        {open && (
          <div className="flex gap-2 px-3 pb-1 overflow-x-auto no-scrollbar shrink-0">
            {["Playlists", "Podcasts"].map((tag) => (
              <FilterPill
                key={tag}
                tag={tag}
                isActive={activeTag === tag}
                onClick={() => handleTagClick(tag)}
              />
            ))}
          </div>
        )}

        {/* Scrollable Playlist/Library List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 min-h-0 scrollbar-thin">
          {filteredPlaylists.map((playlist) => (
            <PlaylistItem key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>
    </div>
  )
}