import React, { useState } from 'react'
import { useVault } from '../context/VaultContext'
import type { MediaItem, FileCategory } from '../types/vault'
import { Download, Trash2, Heart, Plus, Star } from 'lucide-react'

const CATEGORY_STYLES: Record<FileCategory, { label: string; bg: string; text: string; border: string }> = {
  pdf: { label: 'PDF', bg: 'bg-[#EF4444]', text: 'text-white', border: 'border-black' },
  spreadsheet: { label: 'XLS', bg: 'bg-[#10B981]', text: 'text-white', border: 'border-black' },
  doc: { label: 'DOC', bg: 'bg-[#2563EB]', text: 'text-white', border: 'border-black' },
  archive: { label: 'ZIP', bg: 'bg-[#8B5CF6]', text: 'text-white', border: 'border-black' },
  audio: { label: 'MP3', bg: 'bg-[#F59E0B]', text: 'text-white', border: 'border-black' },
  code: { label: 'SRC', bg: 'bg-[#06B6D4]', text: 'text-black', border: 'border-black' },
  other: { label: 'FILE', bg: 'bg-[#6B7280]', text: 'text-white', border: 'border-black' },
}

const FileRow: React.FC<{
  item: MediaItem
  onDownload: (item: MediaItem) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}> = ({ item, onDownload, onDelete, onToggleFavorite }) => {
  const cat = item.fileCategory || 'other'
  const style = CATEGORY_STYLES[cat]

  return (
    <div className="px-3.5 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 hover:bg-[#FFFDE7] transition-colors duration-150 border-b-2 border-black/10 last:border-0 group">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Colorful Type Badge */}
        <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center ${style.bg} nb-shadow-xs`}>
          <span className={`text-[10px] sm:text-[11px] font-mono font-black ${style.text} uppercase`}>
            {style.label}
          </span>
        </div>

        {/* File details */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <p className="text-[13px] sm:text-[14px] font-black text-black truncate tracking-tight">
              {item.filename}
            </p>
            {item.isFavorite && (
              <Star className="w-3 h-3 text-[#FFE600] fill-[#FFE600] shrink-0" />
            )}
          </div>
          {item.description && (
            <p className="text-[11px] text-[#555] truncate font-mono hidden sm:block">
              {item.description}
            </p>
          )}
          <p className="text-[10px] sm:text-[11px] text-[#777] font-mono">
            {item.size} · {item.date}
          </p>
        </div>
      </div>

      {/* Action Buttons: ALWAYS visible on mobile for touch, hover reveal on desktop */}
      <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onToggleFavorite(item.id)}
          className="w-8 h-8 border-2 border-black bg-white hover:bg-[#FFE600] text-black flex items-center justify-center transition cursor-pointer nb-shadow-xs"
          title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
        >
          <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-[#FF2E93] text-[#FF2E93]' : ''}`} />
        </button>

        <button
          onClick={() => onDownload(item)}
          className="w-8 h-8 border-2 border-black bg-white hover:bg-[#2563EB] hover:text-white text-black flex items-center justify-center transition cursor-pointer nb-shadow-xs"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="w-8 h-8 border-2 border-black bg-white hover:bg-[#EF4444] hover:text-white text-black flex items-center justify-center transition cursor-pointer nb-shadow-xs"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export const FileGallery: React.FC = () => {
  const {
    mediaItems,
    downloadMedia,
    deleteMedia,
    toggleFavorite,
    setIsUploadModalOpen,
  } = useVault()

  const [activeFilter, setActiveFilter] = useState<FileCategory | 'all'>('all')

  const allFiles = mediaItems.filter((item) => item.type === 'file')

  const filteredFiles =
    activeFilter === 'all'
      ? allFiles
      : allFiles.filter((f) => f.fileCategory === activeFilter)

  const presentCats = Array.from(
    new Set(allFiles.map((f) => f.fileCategory || 'other'))
  ) as FileCategory[]

  const totalFileBytes = allFiles.reduce((acc, f) => acc + (f.rawBytes || 0), 0)
  const totalFileSize =
    totalFileBytes > 1024 * 1024 * 1024
      ? `${(totalFileBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      : `${(totalFileBytes / (1024 * 1024)).toFixed(0)} MB`

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-3 border-black pb-5">
        <div>
          <h2 className="text-[36px] sm:text-[48px] font-black text-black tracking-[-0.04em] leading-[0.95]">
            Files<span className="text-[#FFE600]">.</span>
          </h2>
          <p className="text-[12px] sm:text-[14px] text-[#555] font-mono mt-1">
            {allFiles.length} files · {totalFileSize}
          </p>
        </div>

        {/* Filter Badges with colorful fills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider border-2 border-black transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-black text-white nb-shadow-xs'
                : 'bg-white text-black hover:bg-[#F5F3EC]'
            }`}
          >
            All ({allFiles.length})
          </button>
          {presentCats.map((cat) => {
            const style = CATEGORY_STYLES[cat]
            const isSelected = activeFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider border-2 border-black transition cursor-pointer ${
                  isSelected
                    ? `${style.bg} ${style.text} nb-shadow-xs`
                    : 'bg-white text-black hover:bg-[#F5F3EC]'
                }`}
              >
                {style.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 ? (
        <div className="py-20 text-center bg-white border-3 border-black nb-shadow p-6">
          <div className="text-[44px] font-black text-black/15 mb-2">∅</div>
          <h3 className="text-[18px] font-black text-black tracking-tight">
            No files in this category
          </h3>
          <p className="text-[12px] font-mono text-[#666] mt-1 mb-5 uppercase tracking-wider">
            Drag files anywhere or click below
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-black bg-[#FFE600] text-black font-mono text-[11px] font-black uppercase tracking-wider hover:bg-[#FDD835] cursor-pointer nb-shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Upload Documents</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border-3 border-black nb-shadow overflow-hidden">
          {/* Table Header Banner */}
          <div className="px-4 sm:px-6 py-2.5 border-b-2 border-black bg-[#0F0F0F] text-white flex items-center justify-between font-mono text-[10px] font-black uppercase tracking-wider">
            <span className="text-[#FFE600]">Files</span>
            <span className="text-white/60">{filteredFiles.length} shown</span>
          </div>

          <div>
            {filteredFiles.map((item) => (
              <FileRow
                key={item.id}
                item={item}
                onDownload={downloadMedia}
                onDelete={deleteMedia}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
