import React from 'react'
import { useVault, type VaultTab } from '../context/VaultContext'
import { Plus, Lock } from 'lucide-react'

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsUploadModalOpen,
    lockVault,
    setIsSecurityModalOpen,
  } = useVault()

  const navItems: { id: VaultTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'files', label: 'Files' },
    { id: 'security', label: 'Settings' },
  ]

  const handleNavClick = (tab: VaultTab) => {
    if (tab === 'security') {
      setIsSecurityModalOpen(true)
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F5F3EC]/95 backdrop-blur-md border-b-2 border-black">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand + Nav */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('home')}
            className="font-black text-[20px] tracking-[-0.04em] text-black cursor-pointer leading-none"
          >
            VAULT
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id && item.id !== 'security'
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1 text-[11px] font-mono uppercase tracking-widest transition duration-150 cursor-pointer border-2 ${
                    isActive
                      ? 'bg-black text-white border-black nb-shadow-xs'
                      : 'border-transparent text-[#777] hover:text-black'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right: Add + Anne + Lock */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="h-8 px-3 bg-black text-white text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5 cursor-pointer border-2 border-black nb-shadow-xs hover:bg-[#1a1a1a] transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add</span>
          </button>

          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="h-8 px-3 border-2 border-black bg-white hover:bg-[#F5F3EC] transition cursor-pointer font-bold text-[13px] tracking-tight text-black nb-shadow-xs"
          >
            Anne
          </button>

          <button
            onClick={lockVault}
            className="w-8 h-8 flex items-center justify-center border border-black/30 hover:border-black bg-white text-[#777] hover:text-black transition cursor-pointer"
            title="Lock Vault"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
