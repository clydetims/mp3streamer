"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Library, CircleUser } from 'lucide-react'

export function MobileNavBar() {
  const pathname = usePathname()

  const handleMockClick = (item: string) => {
    alert(`${item} page is coming soon on mobile!`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around bg-[#090909] border-t border-neutral-800 text-[#b3b3b3] select-none w-full">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors duration-200 ${
          pathname === "/" ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 ${pathname === "/" ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
        <span className="text-[10px] tracking-wide">Home</span>
      </Link>

      <Link
        href="/search"
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors duration-200 ${
          pathname === "/search" ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
        }`}
      >
        <Search className={`w-5 h-5 ${pathname === "/search" ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
        <span className="text-[10px] tracking-wide">Search</span>
      </Link>

      <button
        onClick={() => handleMockClick("Your Library")}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors duration-200 text-[#b3b3b3] hover:text-white"
      >
        <Library className="w-5 h-5 stroke-[1.8px]" />
        <span className="text-[10px] tracking-wide">Your Library</span>
      </button>

      <button
        onClick={() => handleMockClick("Premium")}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors duration-200 text-[#b3b3b3] hover:text-white"
      >
        <CircleUser className="w-5 h-5 stroke-[1.8px]" />
        <span className="text-[10px] tracking-wide">Premium</span>
      </button>
    </div>
  )
}
