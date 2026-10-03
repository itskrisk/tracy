import React, { useState } from 'react'
import { useVault } from '../context/VaultContext'
import {
  Download,
  Trash2,
  Maximize2,
  Heart,
  Plus,
} from 'lucide-react'

export const PhotoGallery: React.FC = () => {
  const {
    mediaItems,
    setSelectedMedia,
    downloadMedia,
    deleteMedia,
    toggleFavorite,
    setIsUploadModalOpen,
  } = useVault()

  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all')

  const photos = mediaItems.filter((item) => {
    if (item.type !== 'image') return false
    if (activeFilter === 'favorites') return item.isFavorite
    return true
  })

  return (
    <section className="w-full space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-3 border-black pb-5">
        <div>
          <h2 className="text-[36px] sm:text-[48px] font-black text-black tracking-[-0.04em] leading-[0.95]">
            Photos<span className="text-[#FF2E93]">.</span>
          </h2>
          <p className="text-[12px] sm:text-[14px] text-[#555] font-mono mt-1">
            {photos.length} photos
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 font-mono text-[11px] font-black uppercase tracking-wider border-2 border-black transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-black text-white nb-shadow-xs'
                : 'bg-white text-black hover:bg-[#FAF8F5]'
            }`}
          >
            All ({mediaItems.filter(m => m.type === 'image').length})
          </button>
          <button
            onClick={() => setActiveFilter('favorites')}
            className={`px-3.5 py-1.5 font-mono text-[11px] font-black uppercase tracking-wider border-2 border-black transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'favorites'
                ? 'bg-[#FF2E93] text-white nb-shadow-xs'
                : 'bg-white text-black hover:bg-[#FAF8F5]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeFilter === 'favorites' ? 'fill-white' : 'fill-none'}`} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {photos.length === 0 ? (
        <div className="py-20 text-center bg-white border-3 border-black nb-shadow p-6">
          <div className="text-[44px] font-black text-black/15 mb-2">∅</div>
          <h3 className="text-[18px] font-black text-black tracking-tight">
            No photos found in this view
          </h3>
          <p className="text-[12px] font-mono text-[#666] mt-1 mb-5 uppercase tracking-wider">
            Drag images directly onto the window or upload
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-black bg-[#FF2E93] text-white font-mono text-[11px] font-black uppercase tracking-wider hover:bg-[#E01E7E] cursor-pointer nb-shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Photos</span>
          </button>
        </div>
      ) : (
        /* Neo-Brutalist Photo Grid (Mobile deliberate: 2 columns, desktop 3-4 columns) */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {photos.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="group relative border-3 border-black bg-white aspect-[4/5] cursor-pointer transition-all duration-150 overflow-hidden nb-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              {/* Image */}
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                loading="lazy"
              />

              {/* Mobile Always-Visible Compact Meta Tag at Top */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                <span className="bg-black/80 backdrop-blur-sm text-white font-mono text-[9px] font-bold px-1.5 py-0.5 border border-white/20 truncate max-w-[120px]">
                  {item.filename}
                </span>
                {item.isFavorite && (
                  <span className="w-5 h-5 bg-[#FF2E93] text-white border border-black flex items-center justify-center nb-shadow-xs">
                    <Heart className="w-3 h-3 fill-white" />
                  </span>
                )}
              </div>

              {/* Desktop Hover & Mobile Touch Controls Strip */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-2.5 sm:p-3 flex flex-col justify-between text-white z-20">
                {/* Top quick actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(item.id)
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-black border-2 border-white flex items-center justify-center hover:bg-[#FF2E93] transition cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-[#FF2E93] text-[#FF2E93]' : 'text-white'}`} />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadMedia(item)
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-black border-2 border-white flex items-center justify-center hover:bg-[#2563EB] transition cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMedia(item.id)
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-black border-2 border-white flex items-center justify-center hover:bg-[#EF4444] transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom details & Open button */}
                <div className="flex items-end justify-between">
                  <div className="min-w-0 pr-1">
                    <div className="text-[11px] font-mono text-white/80">{item.size}</div>
                    <div className="text-[10px] font-mono text-white/60">{item.date}</div>
                  </div>

                  <span className="bg-[#FFE600] text-black font-mono text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black flex items-center gap-1 shrink-0">
                    <Maximize2 className="w-2.5 h-2.5" />
                    <span>View</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
