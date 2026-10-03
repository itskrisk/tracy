import React from 'react'
import { useVault } from '../context/VaultContext'
import {
  Film,
  ArrowUpRight,
  Play,
  HardDrive,
  Plus,
  Lock,
} from 'lucide-react'

const FILE_ICON_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  pdf:         { label: 'PDF', bg: 'bg-[#EF4444]', text: 'text-white' },
  spreadsheet: { label: 'XLS', bg: 'bg-[#10B981]', text: 'text-white' },
  doc:         { label: 'DOC', bg: 'bg-[#2563EB]', text: 'text-white' },
  archive:     { label: 'ZIP', bg: 'bg-[#8B5CF6]', text: 'text-white' },
  audio:       { label: 'MP3', bg: 'bg-[#F59E0B]', text: 'text-white' },
  code:        { label: 'SRC', bg: 'bg-[#06B6D4]', text: 'text-black' },
  other:       { label: 'FILE', bg: 'bg-[#6B7280]', text: 'text-white' },
}

export const BentoGrid: React.FC = () => {
  const {
    mediaItems,
    setSelectedMedia,
    setActiveTab,
    setIsSecurityModalOpen,
    setIsUploadModalOpen,
    stats,
  } = useVault()

  const photos = mediaItems.filter((m) => m.type === 'image')
  const videos = mediaItems.filter((m) => m.type === 'video')
  const files  = mediaItems.filter((m) => m.type === 'file')
  const recent = [...mediaItems].slice(0, 4)
  const photoStrip = photos.slice(0, 3)
  const featureVideo = videos[0]

  return (
    <section className="w-full space-y-5">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 pb-5 border-b-2 border-black">
        <div>
          <h1 className="text-[36px] sm:text-[48px] font-black text-black tracking-[-0.04em] leading-[0.92]">
            Tracy's Vault
          </h1>
          <p className="text-[13px] font-mono text-[#666] mt-1">
            {mediaItems.length} items stored privately
          </p>
        </div>
        <div className="shrink-0 bg-white border-2 border-black p-3 text-right nb-shadow">
          <div className="text-[28px] font-black text-black leading-none">{mediaItems.length}</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#666] mt-0.5">Items</div>
        </div>
      </div>

      {/* ── Bento Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">

        {/* ① Photos — lg:7 cols */}
        <div
          onClick={() => setActiveTab('photos')}
          className="col-span-1 sm:col-span-2 lg:col-span-7 bg-[#FFF0F5] border-2 border-black p-5 nb-shadow cursor-pointer group flex flex-col gap-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="bg-[#FF2E93] text-white font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 border-2 border-black">
              Photos
            </span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

          {/* Collage */}
          <div className="grid grid-cols-3 gap-2">
            {photoStrip.map((p) => (
              <div key={p.id} className="aspect-[4/5] border-2 border-black overflow-hidden">
                <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-[20px] font-black text-black leading-tight">{photos.length} photos</div>
              <div className="text-[11px] font-mono text-[#777]">Private collection</div>
            </div>
            <span className="bg-black text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border-2 border-black group-hover:bg-[#FF2E93] transition-colors">
              Open →
            </span>
          </div>
        </div>

        {/* ② Videos — lg:5 cols */}
        <div
          onClick={() => setActiveTab('videos')}
          className="col-span-1 sm:col-span-2 lg:col-span-5 bg-[#0F0F0F] text-white border-2 border-black p-5 nb-shadow cursor-pointer group flex flex-col gap-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="bg-[#EF4444] text-white font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 border-2 border-black">
              Videos
            </span>
            <div className="w-7 h-7 bg-[#FFE600] text-black border-2 border-black flex items-center justify-center nb-shadow-xs group-hover:scale-105 transition-transform">
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            </div>
          </div>

          {featureVideo ? (
            <div className="relative aspect-[16/9] border-2 border-white/20 overflow-hidden group-hover:border-white transition-colors">
              <img src={featureVideo.thumbnailUrl} alt={featureVideo.title} className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-opacity" loading="lazy" />
              {featureVideo.duration && (
                <span className="absolute bottom-2 right-2 bg-[#FFE600] text-black border-2 border-black font-mono text-[10px] font-black px-1.5 py-0.5">
                  {featureVideo.duration}
                </span>
              )}
            </div>
          ) : (
            <div className="aspect-[16/9] flex items-center justify-center border-2 border-white/10">
              <Film className="w-8 h-8 text-white/30" />
            </div>
          )}

          <div className="flex items-end justify-between">
            <div>
              <div className="text-[20px] font-black text-white leading-tight">{videos.length} videos</div>
              <div className="text-[11px] font-mono text-white/60">Private recordings</div>
            </div>
            <span className="bg-[#FFE600] text-black font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border-2 border-black">
              Watch →
            </span>
          </div>
        </div>

        {/* ③ Files — lg:4 cols */}
        <div
          onClick={() => setActiveTab('files')}
          className="col-span-1 sm:col-span-1 lg:col-span-4 bg-[#FFFDE7] border-2 border-black p-5 nb-shadow cursor-pointer group flex flex-col gap-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="bg-[#FFE600] text-black font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 border-2 border-black">
              Files
            </span>
            <span className="font-mono text-[11px] font-bold text-black">{files.length}</span>
          </div>

          <div className="space-y-2 flex-1">
            {files.slice(0, 3).map((f) => {
              const badge = FILE_ICON_LABEL[f.fileCategory || 'other']
              return (
                <div key={f.id} className="p-2 bg-white border-2 border-black flex items-center gap-2 nb-shadow-xs">
                  <span className={`${badge.bg} ${badge.text} font-mono text-[9px] font-black px-1 py-0.5 border border-black shrink-0`}>
                    {badge.label}
                  </span>
                  <span className="text-[12px] font-bold text-black truncate">{f.filename}</span>
                </div>
              )
            })}
            {files.length === 0 && (
              <div className="text-[12px] font-mono text-[#999]">No files yet</div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/10">
            <span className="text-[11px] font-mono text-[#777]">{files.length} documents</span>
            <span className="font-mono text-[11px] font-bold text-black group-hover:underline">View all →</span>
          </div>
        </div>

        {/* ④ Storage — lg:4 cols */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-4 bg-[#E0F2FE] border-2 border-black p-5 nb-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-[#2563EB] text-white font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 border-2 border-black">
              Storage
            </span>
            <HardDrive className="w-4 h-4 text-black" />
          </div>

          <div>
            <div className="text-[36px] font-black text-black leading-none tracking-tight">
              {stats.usedFormatted}
            </div>
            <p className="text-[12px] font-mono text-[#555] mt-1">of {stats.totalFormatted}</p>
          </div>

          <div className="mt-4">
            <div className="w-full h-3 bg-white border-2 border-black overflow-hidden flex">
              <div className="h-full bg-[#FF2E93] border-r border-black" style={{ width: '8%' }} />
              <div className="h-full bg-[#EF4444] border-r border-black" style={{ width: '22%' }} />
              <div className="h-full bg-[#2563EB]" style={{ width: '12%' }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#666] mt-1.5">
              <span className="text-[#FF2E93] font-bold">Photos</span>
              <span className="text-[#EF4444] font-bold">Videos</span>
              <span className="text-[#2563EB] font-bold">Files</span>
              <span>{stats.percentageUsed}%</span>
            </div>
          </div>
        </div>

        {/* ⑤ Security + Add row — lg:4 cols */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-2 gap-3">
          {/* Security */}
          <div
            onClick={() => setIsSecurityModalOpen(true)}
            className="bg-[#2563EB] text-white border-2 border-black p-4 nb-shadow cursor-pointer group flex flex-col justify-between hover:bg-[#1D4ED8] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 bg-[#FFE600] text-black border-2 border-black flex items-center justify-center nb-shadow-xs">
                <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            </div>
            <div className="mt-4">
              <div className="text-[15px] font-black leading-tight">Security</div>
              <div className="text-[10px] font-mono text-white/70 mt-0.5">Protected</div>
            </div>
          </div>

          {/* Add */}
          <div
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#FFE600] text-black border-2 border-black p-4 nb-shadow cursor-pointer group flex flex-col justify-between hover:bg-[#FDD835] transition-colors"
          >
            <div className="w-7 h-7 bg-black text-white border-2 border-black flex items-center justify-center nb-shadow-xs group-hover:rotate-90 transition-transform duration-200">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="mt-4">
              <div className="text-[15px] font-black leading-tight">Add</div>
              <div className="text-[10px] font-mono text-black/60 mt-0.5">Files or folders</div>
            </div>
          </div>
        </div>

        {/* ⑥ Recent — full width */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-12 bg-white border-2 border-black nb-shadow overflow-hidden">
          <div className="px-5 py-3 border-b-2 border-black bg-black flex items-center justify-between">
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#FFE600]">
              Recent
            </span>
            <span className="font-mono text-[10px] text-white/50">Tap to open</span>
          </div>

          <div className="divide-y divide-black/8">
            {recent.map((item) => {
              const isImg = item.type === 'image'
              const isVid = item.type === 'video'
              const fileBadge = FILE_ICON_LABEL[item.fileCategory || 'other']

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-[#FFFDE7] transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 border-2 border-black shrink-0 overflow-hidden bg-[#F5F3EC] flex items-center justify-center">
                    {isImg && item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : isVid && item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <span className={`font-mono text-[9px] font-black ${fileBadge.text} ${fileBadge.bg} w-full h-full flex items-center justify-center`}>
                        {fileBadge.label}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-black truncate">{item.filename}</div>
                    <div className="text-[11px] font-mono text-[#777]">{item.size} · {item.date}</div>
                  </div>

                  <span className={`shrink-0 font-mono text-[9px] font-black uppercase px-2 py-0.5 border-2 border-black ${
                    isImg ? 'bg-[#FF2E93] text-white' : isVid ? 'bg-[#EF4444] text-white' : `${fileBadge.bg} ${fileBadge.text}`
                  }`}>
                    {isImg ? 'IMG' : isVid ? 'VID' : fileBadge.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ⑦ Summary bar — full width */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-12 border-2 border-black nb-shadow overflow-hidden">
          <div className="grid grid-cols-3 divide-x-2 divide-black">
            <div
              onClick={() => setActiveTab('photos')}
              className="p-4 bg-[#FF2E93] text-white cursor-pointer hover:bg-[#E01E7E] transition-colors text-center"
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/80">Photos</div>
              <div className="text-[28px] font-black leading-none mt-1">{stats.photosCount}</div>
            </div>
            <div
              onClick={() => setActiveTab('videos')}
              className="p-4 bg-black text-white cursor-pointer hover:bg-[#1a1a1a] transition-colors text-center"
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFE600]">Videos</div>
              <div className="text-[28px] font-black leading-none mt-1">{stats.videosCount}</div>
            </div>
            <div
              onClick={() => setActiveTab('files')}
              className="p-4 bg-[#FFE600] text-black cursor-pointer hover:bg-[#FDD835] transition-colors text-center"
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/70">Files</div>
              <div className="text-[28px] font-black leading-none mt-1">{stats.filesCount}</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
