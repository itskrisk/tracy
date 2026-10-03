import React from 'react'
import { useVault } from '../context/VaultContext'

export const Toast: React.FC = () => {
  const { toastMessage } = useVault()

  if (!toastMessage) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div
        className="bg-[#0F0F0F] text-white text-[12px] font-mono uppercase tracking-widest px-4 py-2 border-2 border-[#0F0F0F] flex items-center gap-2.5"
        style={{ boxShadow: '3px 3px 0px #555' }}
      >
        <span className="w-2 h-2 bg-[#30D158]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  )
}
