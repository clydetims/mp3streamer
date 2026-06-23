// components/ui/ScrollArea.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  showOnHover?: boolean
  className?: string
}

export function ScrollArea({ 
  children, 
  showOnHover = true,
  className,
  ...props 
}: ScrollAreaProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      className={cn(
        "overflow-auto transition-all duration-300",
        showOnHover 
          ? isHovered 
            ? "scrollbar-visible" 
            : "scrollbar-hidden"
          : "scrollbar-always",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </div>
  )
}