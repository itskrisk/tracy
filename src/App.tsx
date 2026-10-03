import React, { useEffect, useState } from 'react'
import { VaultProvider, useVault } from './context/VaultContext'
import { LoginScreen } from './components/LoginScreen'
import { Header } from './components/Header'
import { MobileNav } from './components/MobileNav'
import { BentoGrid } from './components/BentoGrid'
import { PhotoGallery } from './components/PhotoGallery'
import { VideoGallery } from './components/VideoGallery'
import { FileGallery } from './components/FileGallery'
import { MediaViewer } from './components/MediaViewer'
import { UploadModal } from './components/UploadModal'
import { SecurityModal } from './components/SecurityModal'
import { FirstTimeSetupModal } from './components/FirstTimeSetupModal'
import { Toast } from './components/Toast'
import { Plus, UploadCloud } from 'lucide-react'

const VaultDashboard: React.FC = () => {
  const {
    isAuthenticated,
    isAuthLoading,
    activeTab,
    setIsUploadModalOpen,
    handleFileUpload,
  } = useVault()

  const [isWindowDragActive, setIsWindowDragActive] = useState(false)

  // Global drag-and-drop support
  useEffect(() => {
    let dragCounter = 0

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter++
      if (e.dataTransfer?.types?.includes('Files')) setIsWindowDragActive(true)
    }
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounter--
      if (dragCounter === 0) setIsWindowDragActive(false)
    }
    const handleDragOver = (e: DragEvent) => { e.preventDefault() }
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounter = 0
      setIsWindowDragActive(false)
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files)
      }
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleFileUpload])

  // Show loading spinner while Supabase checks session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3EC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-[32px] font-black tracking-[-0.04em] text-black">
            VAULT<span className="text-[#FF2E93]">.</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#FF2E93] animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-[#FFE600] animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-[#2563EB] animate-bounce" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <div className="min-h-screen bg-[#F5F3EC] text-[#0F0F0F] flex flex-col font-sans selection:bg-[#FF2E93] selection:text-white relative">

      {/* Global drag & drop overlay */}
      {isWindowDragActive && (
        <div className="fixed inset-0 z-50 bg-[#0F0F0F]/85 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150 text-white p-6">
          <div className="w-16 h-16 bg-[#FFE600] text-black border-3 border-black flex items-center justify-center mb-4" style={{ boxShadow: '4px 4px 0px #fff' }}>
            <UploadCloud className="w-8 h-8 stroke-[2.5]" />
          </div>
          <p className="text-[24px] font-black tracking-tight text-center">
            Drop to add to Vault
          </p>
          <p className="text-[12px] font-mono text-[#FFE600] mt-1 uppercase tracking-widest font-black">
            Photos · Videos · Files · Folders
          </p>
        </div>
      )}

      {/* Desktop Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-3.5 sm:px-6 py-6 sm:py-10 pb-28 md:pb-16 animate-in fade-in duration-150">
        {activeTab === 'home'   && <BentoGrid />}
        {activeTab === 'photos' && <PhotoGallery />}
        {activeTab === 'videos' && <VideoGallery />}
        {activeTab === 'files'  && <FileGallery />}
      </main>

      {/* Floating add button (desktop) */}
      <button
        onClick={() => setIsUploadModalOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-30 w-12 h-12 bg-[#FF2E93] text-white hover:bg-[#E01E7E] items-center justify-center border-2 border-black active:scale-95 transition-all duration-150 cursor-pointer group"
        style={{ boxShadow: '3px 3px 0px #0F0F0F' }}
        title="Add to Vault"
      >
        <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Mobile nav */}
      <MobileNav />

      {/* Modals */}
      <UploadModal />
      <SecurityModal />
      <MediaViewer />
      <FirstTimeSetupModal />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <VaultProvider>
      <VaultDashboard />
    </VaultProvider>
  )
}
