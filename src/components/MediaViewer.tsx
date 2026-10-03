import React, { useState, useRef, useEffect } from 'react'
import { useVault } from '../context/VaultContext'
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Download,
  Info,
  Trash2,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react'

export const MediaViewer: React.FC = () => {
  const {
    selectedMedia,
    setSelectedMedia,
    nextMedia,
    prevMedia,
    downloadMedia,
    deleteMedia,
    toggleFavorite,
  } = useVault()

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset states when selected media changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
  }, [selectedMedia?.id])

  // Mouse activity auto-hides controls during video playback
  const handleMouseMove = () => {
    setControlsVisible(true)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 3000)
    }
  }

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Handle Video play/pause
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (!selectedMedia) return null

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-[#0A0A0C] text-white flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* Top Bar Controls */}
      <div
        className={`w-full px-6 py-4 flex items-center justify-between z-30 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Back Button */}
        <button
          onClick={() => setSelectedMedia(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md transition duration-150 text-[13px] font-medium cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Media Title & Metadata */}
        <div className="text-center max-w-md truncate px-4">
          <p className="text-[14px] font-medium tracking-tight text-white/95 truncate">
            {selectedMedia.filename}
          </p>
          <p className="text-[11px] text-white/50 tracking-tight mt-0.5">
            {selectedMedia.size} · {selectedMedia.date}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(selectedMedia.id)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition duration-150 cursor-pointer"
            title="Favorite"
          >
            <Heart
              className={`w-4 h-4 ${
                selectedMedia.isFavorite
                  ? 'text-[#FF2D55] fill-[#FF2D55]'
                  : 'text-white/80'
              }`}
            />
          </button>

          <button
            onClick={() => downloadMedia(selectedMedia)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition duration-150 cursor-pointer"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition duration-150 cursor-pointer ${
              showInfo
                ? 'bg-white text-black'
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
            }`}
            title="Details"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition duration-150 cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Central Media Display */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden px-4 md:px-12">
        {/* Previous Button (Left) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            prevMedia()
          }}
          className={`absolute left-4 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition duration-200 cursor-pointer ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Previous Media"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Media Element */}
        {selectedMedia.type === 'video' ? (
          <div className="relative max-w-full max-h-[82vh] flex items-center justify-center">
            <video
              ref={videoRef}
              src={selectedMedia.url}
              poster={selectedMedia.thumbnailUrl}
              playsInline
              muted={isMuted}
              onClick={togglePlay}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime)
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration)
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer"
            />
          </div>
        ) : (
          <div className="relative max-w-full max-h-[82vh] flex items-center justify-center">
            <img
              src={selectedMedia.url}
              alt={selectedMedia.title}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-transform duration-300"
            />
          </div>
        )}

        {/* Next Button (Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            nextMedia()
          }}
          className={`absolute right-4 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition duration-200 cursor-pointer ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Next Media"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Info Drawer (Modal) */}
        {showInfo && (
          <div className="absolute right-6 top-6 z-40 w-72 bg-[#161617]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-[13px] animate-in fade-in slide-in-from-right-2 duration-150">
            <h4 className="font-semibold text-white mb-3">Item Details</h4>
            <div className="space-y-2.5 text-white/70">
              <div className="flex justify-between">
                <span className="text-white/40">File</span>
                <span className="truncate max-w-[140px] text-white">
                  {selectedMedia.filename}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Type</span>
                <span className="capitalize text-white">
                  {selectedMedia.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Size</span>
                <span className="text-white">{selectedMedia.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Date</span>
                <span className="text-white">{selectedMedia.date}</span>
              </div>
              {selectedMedia.description && (
                <div className="pt-2 border-t border-white/10 text-[12px] text-white/50 leading-relaxed">
                  {selectedMedia.description}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => deleteMedia(selectedMedia.id)}
                className="w-full py-1.5 px-3 rounded-lg text-red-400 hover:bg-red-500/10 text-left flex items-center gap-2 text-[12px] transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove from vault</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`w-full max-w-2xl mx-auto px-6 py-5 z-30 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {selectedMedia.type === 'video' ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-5 py-3 flex items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-white/80 transition cursor-pointer focus:outline-none"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            {/* Time progress */}
            <span className="text-[11px] font-mono text-white/60">
              {formatTime(currentTime)}
            </span>

            {/* Scrub Bar */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const targetTime = Number(e.target.value)
                setCurrentTime(targetTime)
                if (videoRef.current) {
                  videoRef.current.currentTime = targetTime
                }
              }}
              className="flex-1 h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer"
            />

            <span className="text-[11px] font-mono text-white/60">
              {formatTime(duration)}
            </span>

            {/* Audio Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white/70 hover:text-white transition cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-4 text-[12px] text-white/60">
              <span>Use arrow keys to browse</span>
              <span>·</span>
              <span>Esc to return</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
