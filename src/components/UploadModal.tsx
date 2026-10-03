import React, { useRef, useState } from 'react'
import { useVault } from '../context/VaultContext'
import { X, FolderOpen, Image as ImageIcon, Film, File, UploadCloud } from 'lucide-react'

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadProgress,
    handleFileUpload,
  } = useVault()

  const [isDragOver, setIsDragOver] = useState(false)
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  if (!isUploadModalOpen) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(e.type === 'dragover' || e.type === 'dragenter')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files)
    }
  }

  const uploadOptions = [
    { label: 'Photos', icon: ImageIcon, ref: photoInputRef, bg: 'bg-[#FF2E93] text-white hover:bg-[#E01E7E]', accept: 'image/*', multiple: true },
    { label: 'Videos', icon: Film, ref: videoInputRef, bg: 'bg-[#EF4444] text-white hover:bg-[#DC2626]', accept: 'video/*', multiple: true },
    { label: 'Files', icon: File, ref: fileInputRef, bg: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]', accept: '*/*', multiple: true },
    { label: 'Folder', icon: FolderOpen, ref: folderInputRef, bg: 'bg-[#FFE600] text-black hover:bg-[#FDD835]', accept: '*/*', multiple: true, folder: true },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !uploadProgress?.isUploading && setIsUploadModalOpen(false)}
      />

      {/* Neo-brutalist Modal Card (Deliberate mobile sizing) */}
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] border-3 border-black z-10 nb-shadow-lg my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top colorful header banner */}
        <div className="px-5 py-3.5 border-b-3 border-black bg-black text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
            <span className="text-[12px] font-mono font-black uppercase tracking-widest text-[#FFE600]">
              ADD TO TRACY'S VAULT
            </span>
          </div>

          <button
            onClick={() => !uploadProgress?.isUploading && setIsUploadModalOpen(false)}
            disabled={uploadProgress?.isUploading}
            className="w-7 h-7 bg-white text-black border-2 border-black flex items-center justify-center hover:bg-[#FF2E93] hover:text-white transition disabled:opacity-30 cursor-pointer nb-shadow-xs"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* Active Upload State */}
          {uploadProgress?.isUploading ? (
            <div className="py-6 sm:py-8 text-center bg-white border-2 border-black p-5 nb-shadow">
              <span className="inline-block bg-[#FFE600] text-black font-mono text-[10px] font-black uppercase px-2.5 py-1 border-2 border-black mb-3">
                UPLOADING...
              </span>

              <h4 className="text-[17px] sm:text-[19px] font-black text-black truncate mb-4 px-2">
                {uploadProgress.filename}
              </h4>

              {/* Colorful Neo-Brutalist Progress Track */}
              <div className="w-full h-4 bg-[#F5F3EC] border-2 border-black overflow-hidden relative max-w-xs mx-auto">
                <div
                  className="h-full bg-[#FF2E93] transition-all duration-200"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>

              <div className="text-[28px] font-black text-black mt-3 font-mono">
                {uploadProgress.percentage}%
              </div>
            </div>
          ) : (
            <>
              {/* Drop Zone with Warm Butter Yellow fill */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-3 border-dashed p-6 sm:p-8 text-center transition-all duration-150 mb-4 ${
                  isDragOver
                    ? 'border-black bg-[#FFE600]/30 scale-101'
                    : 'border-black bg-[#FFFDE7] hover:bg-[#FFF9C4]'
                }`}
              >
                <div className="w-12 h-12 bg-[#2563EB] text-white border-2 border-black mx-auto flex items-center justify-center mb-2 nb-shadow-xs">
                  <UploadCloud className="w-6 h-6 stroke-[2.5]" />
                </div>
                <p className="text-[14px] sm:text-[15px] font-black text-black tracking-tight">
                  Drag and drop anything here
                </p>
                <p className="text-[11px] font-mono text-[#555] mt-1 uppercase tracking-wider">
                  Photos · Videos · Files · Folders
                </p>
              </div>

              {/* 4 Colorful Neo-Brutalist Pickers */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {uploadOptions.map(({ label, icon: Icon, ref, bg }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => ref.current?.click()}
                    className={`py-3 sm:py-3.5 px-3 border-2 border-black ${bg} font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all nb-shadow-xs active:translate-x-0.5 active:translate-y-0.5 cursor-pointer`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                    <span>Upload {label}</span>
                  </button>
                ))}
              </div>

              {/* Hidden file inputs */}
              {uploadOptions.map(({ label, ref, accept, multiple, folder }) => (
                <input
                  key={label}
                  ref={ref}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  {...(folder ? { webkitdirectory: '', mozdirectory: '' } : {})}
                  className="hidden"
                  onChange={handleChange}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
