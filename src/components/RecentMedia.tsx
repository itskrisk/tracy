import React, { useState } from 'react'
import { useVault } from '../context/VaultContext'
import type { MediaItem } from '../types/vault'
import {
  MoreHorizontal,
  Play,
  Download,
  Trash2,
  Heart,
  Eye,
} from 'lucide-react'

export const RecentMedia: React.FC = () => {
  const {
    mediaItems,
    setSelectedMedia,
    downloadMedia,
    deleteMedia,
    toggleFavorite,
  } = useVault()

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  // Show up to 6 most recent items
  const recentItems = mediaItems.slice(0, 6)

  const handleRowClick = (item: MediaItem) => {
    setSelectedMedia(item)
  }

  return (
    <section className="mt-14 w-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[22px] font-semibold text-[#1D1D1F] tracking-[-0.02em]">
          Recent
        </h3>
        <span className="text-[13px] text-[#86868B]">
          {recentItems.length} items
        </span>
      </div>

      <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] divide-y divide-black/[0.04] overflow-visible">
        {recentItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[14px] text-[#86868B]">No recent items found.</p>
          </div>
        ) : (
          recentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleRowClick(item)}
              className="px-5 py-4 flex items-center justify-between hover:bg-[#F9F9FB] transition-colors duration-150 cursor-pointer group relative"
            >
              {/* Left: Thumbnail & Title Info */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F5F5F7] flex-shrink-0 border border-black/[0.04]">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white text-white opacity-90" />
                    </div>
                  )}
                </div>

                {/* Text details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-[#1D1D1F] truncate tracking-tight">
                      {item.filename}
                    </p>
                    {item.isFavorite && (
                      <Heart className="w-3 h-3 text-[#FF2D55] fill-[#FF2D55] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[12px] text-[#86868B] truncate mt-0.5">
                    <span className="capitalize">{item.type}</span> · {item.size}
                  </p>
                </div>
              </div>

              {/* Right: Date & Contextual Menu */}
              <div
                className="flex items-center gap-4 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="hidden sm:inline text-[13px] text-[#86868B]">
                  {item.date}
                </span>

                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenuId(activeMenuId === item.id ? null : item.id)
                    }
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition duration-150 cursor-pointer"
                    aria-label="Options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Contextual Menu Dropdown */}
                  {activeMenuId === item.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 top-9 z-50 w-44 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1 text-[13px] animate-in fade-in duration-100">
                        <button
                          onClick={() => {
                            setSelectedMedia(item)
                            setActiveMenuId(null)
                          }}
                          className="w-full px-3.5 py-2 text-left text-[#1D1D1F] hover:bg-black/[0.04] flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#86868B]" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => {
                            toggleFavorite(item.id)
                            setActiveMenuId(null)
                          }}
                          className="w-full px-3.5 py-2 text-left text-[#1D1D1F] hover:bg-black/[0.04] flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              item.isFavorite
                                ? 'text-[#FF2D55] fill-[#FF2D55]'
                                : 'text-[#86868B]'
                            }`}
                          />
                          <span>
                            {item.isFavorite ? 'Unfavorite' : 'Favorite'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            downloadMedia(item)
                            setActiveMenuId(null)
                          }}
                          className="w-full px-3.5 py-2 text-left text-[#1D1D1F] hover:bg-black/[0.04] flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#86868B]" />
                          <span>Download</span>
                        </button>

                        <div className="h-[1px] bg-black/[0.06] my-1" />

                        <button
                          onClick={() => {
                            deleteMedia(item.id)
                            setActiveMenuId(null)
                          }}
                          className="w-full px-3.5 py-2 text-left text-[#FF3B30] hover:bg-red-50 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
