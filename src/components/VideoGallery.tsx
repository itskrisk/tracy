import React from 'react'
import { useVault } from '../context/VaultContext'
import { Play, Download, Trash2, Heart, Plus } from 'lucide-react'

export const VideoGallery: React.FC = () => {
  const {
    mediaItems,
    setSelectedMedia,
    downloadMedia,
    deleteMedia,
    toggleFavorite,
    setIsUploadModalOpen,
  } = useVault()

  const videos = mediaItems.filter((item) => item.type === 'video')

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-3 border-black pb-5">
        <div>
          <h2 className="text-[36px] sm:text-[48px] font-black text-black tracking-[-0.04em] leading-[0.95]">
            Videos<span className="text-[#EF4444]">.</span>
          </h2>
          <p className="text-[12px] sm:text-[14px] text-[#555] font-mono mt-1">
            {videos.length} videos
          </p>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="py-20 text-center bg-white border-3 border-black nb-shadow p-6">
          <div className="text-[44px] font-black text-black/15 mb-2">∅</div>
          <h3 className="text-[18px] font-black text-black tracking-tight">
            No videos yet
          </h3>
          <p className="text-[12px] font-mono text-[#666] mt-1 mb-5 uppercase tracking-wider">
            Upload videos to get started
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-black bg-[#EF4444] text-white font-mono text-[11px] font-black uppercase tracking-wider hover:bg-[#DC2626] cursor-pointer nb-shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Upload Videos</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="bg-white border-3 border-black overflow-hidden cursor-pointer group flex flex-col transition-all duration-150 nb-shadow hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              {/* Video Thumbnail Tile */}
              <div className="relative aspect-[16/9] bg-[#0F0F0F] overflow-hidden border-b-3 border-black">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-104 transition-all duration-500"
                  loading="lazy"
                />

                {/* Duration Badge */}
                {item.duration && (
                  <span className="absolute bottom-2.5 right-2.5 bg-[#FFE600] text-black font-mono text-[10px] font-black px-2 py-0.5 border-2 border-black nb-shadow-xs">
                    {item.duration}
                  </span>
                )}

                {/* Play Button Indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#FF2E93] text-white border-2 border-black flex items-center justify-center group-hover:scale-110 group-hover:bg-[#FFE600] group-hover:text-black transition-all duration-150 nb-shadow-xs">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Favorite badge */}
                {item.isFavorite && (
                  <div className="absolute top-2.5 left-2.5 w-7 h-7 bg-[#FF2E93] text-white border-2 border-black flex items-center justify-center nb-shadow-xs">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </div>
                )}
              </div>

              {/* Video Details Card Footer */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-[#FAF8F5]">
                <div className="min-w-0 pr-2">
                  <h4 className="text-[14px] sm:text-[15px] font-black text-black tracking-tight truncate">
                    {item.filename}
                  </h4>
                  <p className="text-[11px] font-mono text-[#666] mt-0.5">
                    {item.size} · {item.date}
                  </p>
                </div>

                {/* Touch Actions */}
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="w-8 h-8 border-2 border-black bg-white hover:bg-[#FF2E93] hover:text-white text-black flex items-center justify-center transition cursor-pointer nb-shadow-xs"
                    title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        item.isFavorite ? 'text-[#FF2E93] fill-[#FF2E93]' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => downloadMedia(item)}
                    className="w-8 h-8 border-2 border-black bg-white hover:bg-[#2563EB] hover:text-white text-black flex items-center justify-center transition cursor-pointer nb-shadow-xs"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteMedia(item.id)}
                    className="w-8 h-8 border-2 border-black bg-white hover:bg-[#EF4444] hover:text-white text-black flex items-center justify-center transition cursor-pointer nb-shadow-xs"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
