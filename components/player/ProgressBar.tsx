/**
 * @components/player/ProgressBar.tsx
 * Track progress slider.
 *
 * Shows:
 * - Current playback time
 * - Song duration
 *
 * Allows seeking.
 * 
 * Music duration Progress Bar
 */

"use client";

import { useEffect, useRef, useState } from "react";

type ProgressBarProps = {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void
}

export default function ProgressBar({
    currentTime,
    duration,
    onSeek
}: ProgressBarProps) {
    const [isSeeking, setIsSeeking] = useState(false);
    const [localTime, setLocalTime] = useState(currentTime);
    const prevCurrentTime = useRef(currentTime);


    const formatTime = (time: number) => {
        if (!isFinite(time) || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    useEffect(() => {
        if (!isSeeking && currentTime !== prevCurrentTime.current) {
            setLocalTime(currentTime);
            prevCurrentTime.current = currentTime;
        }
    }, [currentTime, isSeeking]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setLocalTime(value); // Fixed: now actually updates the value
    };

    const handleSeekStart = () => {
        setIsSeeking(true);
    };

    const handleSeekEnd = () => {
        setIsSeeking(false);
        onSeek(localTime);
    };




    const progressPercent = duration > 0 ? (localTime / duration) * 100 : 0;

    return (
        <div className="w-full flex items-center gap-3 group">
            <span className="text-xs text-gray-400 w-10 text-right tabular-nums select-none">
                {formatTime(isSeeking ? localTime : currentTime)}
            </span>

            {/* Slider */}
            <div className="flex-1 relative">
                <input 
                    type="range" 
                    min={0}
                    max={duration || 0}
                    value={isSeeking ? localTime : currentTime}
                    step={0.1}
                    onMouseDown={handleSeekStart}
                    onTouchStart={handleSeekStart}
                    onChange={handleChange}
                    onMouseUp={handleSeekEnd}
                    onTouchEnd={handleSeekEnd}

                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 
                             [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full 
                             [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
                             [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100
                             [&::-webkit-slider-thumb]:transition-opacity
                             [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 
                             [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white 
                             [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg
                    
                    "
                    style={{
                        background: `linear-gradient(to right, #3b82f6 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`
                    }}
                    aria-label="Seek"
                />

            </div>

            <span className="text-xs text-gray-400 tabular-nums select-none">
                {formatTime(duration)}
            </span>
        </div>
    )
}