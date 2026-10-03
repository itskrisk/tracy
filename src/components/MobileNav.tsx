import React from 'react'
import { useVault, type VaultTab } from '../context/VaultContext'
import { Home, Image as ImageIcon, Film, FolderOpen, Shield } from 'lucide-react'

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsSecurityModalOpen,
    vaultColor,
  } = useVault()

  const tabs: { id: VaultTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'security', label: 'Vault', icon: Shield },
  ]

  const activeColorHex =
    vaultColor === 'blue'
      ? '#2563EB'
      : vaultColor === 'pink'
      ? '#FF2E93'
      : vaultColor === 'red'
      ? '#EF4444'
      : '#0F0F0F'

  const handleTabClick = (tabId: VaultTab) => {
    if (tabId === 'security') {
      setIsSecurityModalOpen(true)
    } else {
      setActiveTab(tabId)
    }
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F5F3EC]/98 backdrop-blur-lg border-t-2 border-black pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id && tab.id !== 'security'

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center transition-all duration-150 relative min-h-[44px] cursor-pointer ${
                isActive ? 'text-black' : 'text-[#777] hover:text-black'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: activeColorHex }}
                  />
                )}
              </div>
              <span
                className={`text-[9px] font-mono uppercase tracking-widest mt-1 ${
                  isActive ? 'font-black text-black' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
