import React, { useState } from 'react'
import { useVault } from '../context/VaultContext'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  X,
  Shield,
  KeyRound,
  LogOut,
  Smartphone,
  Laptop,
  Tablet,
  DownloadCloud,
  Trash2,
  AlertTriangle,
  HardDrive,
  User,
} from 'lucide-react'

export const SecurityModal: React.FC = () => {
  const {
    isSecurityModalOpen,
    setIsSecurityModalOpen,
    lockVault,
    settings,
    updateSettings,
    stats,
    downloadAllVault,
    deleteAllMedia,
    resetVault,
    user,
    updatePassword,
  } = useVault()

  const [activeSection, setActiveSection] = useState<
    'account' | 'security' | 'storage' | 'vault'
  >('account')
  const [dangerConfirm, setDangerConfirm] = useState<
    'none' | 'deleteAll' | 'deleteVault' | 'password'
  >('none')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  if (!isSecurityModalOpen) return null

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.')
      return
    }
    setIsUpdatingPassword(true)
    setPasswordError(null)
    const err = await updatePassword(newPassword)
    setIsUpdatingPassword(false)
    if (err) {
      setPasswordError(err)
    } else {
      setPasswordSuccess(true)
      setTimeout(() => {
        setPasswordSuccess(false)
        setDangerConfirm('none')
        setNewPassword('')
        setConfirmPassword('')
      }, 2500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsSecurityModalOpen(false)}
      />

      {/* Settings Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-[#FAF8F5] border-3 border-black overflow-hidden z-10 animate-in fade-in duration-150 flex flex-col max-h-[90vh] nb-shadow-xl my-auto"
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-black text-white flex items-center justify-between border-b-3 border-black">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
            <span className="text-[12px] font-mono font-black uppercase tracking-widest text-[#FFE600]">
              VAULT CONFIGURATION · ANNE
            </span>
          </div>

          <button
            onClick={() => setIsSecurityModalOpen(false)}
            className="w-7 h-7 bg-white text-black border-2 border-black flex items-center justify-center hover:bg-[#FF2E93] hover:text-white transition cursor-pointer nb-shadow-xs"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Section Navigation Tabs with Colorful Active Fills */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b-3 border-black bg-white flex gap-2 overflow-x-auto">
          {[
            { id: 'account', label: 'Account', icon: User, activeBg: 'bg-[#2563EB] text-white' },
            { id: 'security', label: 'Security', icon: Shield, activeBg: 'bg-[#FF2E93] text-white' },
            { id: 'storage', label: 'Storage', icon: HardDrive, activeBg: 'bg-[#10B981] text-white' },
            { id: 'vault', label: 'Vault Actions', icon: Trash2, activeBg: 'bg-[#EF4444] text-white' },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeSection === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id as any)
                  setDangerConfirm('none')
                }}
                className={`px-3 py-1.5 text-[11px] font-mono font-black uppercase tracking-wider border-2 border-black flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  isActive
                    ? `${tab.activeBg} nb-shadow-xs`
                    : 'bg-[#FAF8F5] text-black hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* SECTION: ACCOUNT */}
          {activeSection === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Profile Card */}
              <div
                className="p-5 bg-white border-3 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 nb-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2563EB] text-white border-2 border-black text-[20px] font-black flex items-center justify-center nb-shadow-xs">
                    ANNE
                  </div>
                  <div>
                    <h4 className="text-[18px] font-black text-black tracking-tight leading-tight">
                      Anne
                    </h4>
                    <p className="text-[12px] font-mono text-[#666]">
                      {user?.email || 'adedetracy481@gmail.com'} · Vault Owner
                    </p>
                    <p className="text-[10px] font-mono text-[#888] mt-0.5">
                      Account active since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 2026'}
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto bg-[#FFE600] text-black font-mono text-[10px] font-black uppercase tracking-widest border-2 border-black px-3 py-1 nb-shadow-xs">
                  AUTHORIZED
                </span>
              </div>

              {/* Password change */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-mono font-black uppercase tracking-wider text-black">
                  Authentication Passphrase
                </h5>
                {dangerConfirm === 'password' ? (
                  <form
                    onSubmit={handlePasswordChange}
                    className="p-4 bg-white border-2 border-black space-y-3 nb-shadow"
                  >
                    <label className="block text-[11px] font-mono text-[#666]">
                      Enter new Master Passphrase:
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null) }}
                      placeholder="Minimum 8 characters"
                      required
                      className="w-full px-3 py-2 text-[13px] bg-[#FAF8F5] border-2 border-black outline-none font-mono"
                    />

                    <label className="block text-[11px] font-mono text-[#666]">
                      Confirm new passphrase:
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null) }}
                      placeholder="Re-enter new passphrase"
                      required
                      className="w-full px-3 py-2 text-[13px] bg-[#FAF8F5] border-2 border-black outline-none font-mono"
                    />

                    {passwordError && (
                      <div className="text-[11px] font-mono font-bold text-red-600 bg-red-50 p-2 border border-red-200">
                        {passwordError}
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="text-[11px] font-mono font-bold text-green-700 bg-green-50 p-2 border border-green-200">
                        ✓ Passphrase updated! Use your new password on next sign-in.
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isUpdatingPassword || passwordSuccess}
                        className="px-4 py-2 bg-[#2563EB] text-white text-[11px] font-mono font-black uppercase tracking-wider border-2 border-black hover:bg-[#1D4ED8] transition cursor-pointer nb-shadow-xs disabled:opacity-60"
                      >
                        {isUpdatingPassword ? 'Updating...' : passwordSuccess ? '✓ Updated!' : 'Save New Passphrase'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDangerConfirm('none'); setPasswordError(null); setNewPassword(''); setConfirmPassword('') }}
                        className="px-3 py-2 text-[11px] font-mono text-[#666] hover:text-black cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => { setDangerConfirm('password'); setPasswordError(null) }}
                    className="w-full py-3 px-4 bg-white border-2 border-black hover:bg-[#FFFDE7] text-[13px] font-bold text-left flex items-center justify-between text-black transition cursor-pointer nb-shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-black" />
                      <span>Change master password</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#888]">
                      Last sign-in: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                    </span>
                  </button>
                )}
              </div>

              {/* Sign out */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSecurityModalOpen(false)
                    lockVault()
                  }}
                  className="w-full py-3 px-4 border-2 border-black bg-[#EF4444] text-white text-left text-[12px] font-mono font-black uppercase tracking-wider hover:bg-[#DC2626] flex items-center gap-2 transition cursor-pointer nb-shadow-xs"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                  <span>Lock Vault & Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 2FA Toggle */}
              <div
                className="p-5 bg-white border-3 border-black flex items-center justify-between nb-shadow"
              >
                <div>
                  <h4 className="text-[16px] font-black text-black">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-[12px] font-mono text-[#666] mt-0.5">
                    Hardware key & Secure Enclave protection
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSettings({
                      twoFactorEnabled: !settings.twoFactorEnabled,
                    })
                  }
                  className={`w-13 h-7 border-2 border-black transition-colors relative cursor-pointer ${
                    settings.twoFactorEnabled ? 'bg-[#FF2E93]' : 'bg-[#E5E5EA]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white border-2 border-black absolute top-0.5 transition-transform ${
                      settings.twoFactorEnabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Active Sessions */}
              <div>
                <h5 className="text-[11px] font-mono font-black uppercase tracking-wider text-black mb-2">
                  Active Verified Session
                </h5>
                <div className="border-2 border-black bg-white nb-shadow-xs">
                  {(() => {
                    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
                    const isPhone = /iPhone|Android|Mobile/i.test(ua)
                    const isTab = /iPad|Tablet/i.test(ua)
                    const isMac = /Macintosh/i.test(ua)
                    const isWin = /Windows/i.test(ua)
                    const deviceName = isPhone ? (/iPhone/i.test(ua) ? 'iPhone' : 'Mobile Device') : isTab ? 'iPad / Tablet' : isMac ? 'Mac' : isWin ? 'Windows PC' : 'Workstation'
                    const browserName = /Firefox/i.test(ua) ? 'Firefox' : /Edg/i.test(ua) ? 'Microsoft Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Web Browser'
                    const Icon = isPhone ? Smartphone : isTab ? Tablet : Laptop

                    return (
                      <div className="p-3.5 flex items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 border-2 border-black bg-[#FFE600] flex items-center justify-center text-black shrink-0 nb-shadow-xs">
                            <Icon className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-bold text-black truncate">
                                {deviceName}
                              </p>
                              <span className="text-[9px] font-mono font-black uppercase text-white bg-black px-1.5 py-0.2 shrink-0">
                                Current Active Session
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-[#666]">
                              {browserName} · Verified via Supabase Auth
                            </p>
                          </div>
                        </div>

                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" title="Active now" />
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Cloud Status */}
              <div className="p-4 border-2 border-black bg-white text-[12px] flex items-center justify-between font-mono nb-shadow-xs">
                <span className="text-[#666]">Cloud Storage Status</span>
                <span className="font-black text-black flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSupabaseConfigured ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                    }`}
                  />
                  <span>
                    {isSupabaseConfigured
                      ? 'Supabase Private Storage'
                      : 'Local Encrypted Sandbox'}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* SECTION: STORAGE */}
          {activeSection === 'storage' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div
                className="p-5 bg-white border-3 border-black nb-shadow"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="text-[34px] font-black text-black tracking-tight">
                    {stats.usedFormatted}
                  </h4>
                  <span className="text-[12px] font-mono font-bold text-[#666]">
                    of {stats.totalFormatted} quota
                  </span>
                </div>

                {/* Chunky Bar with Real Proportions */}
                <div className="w-full h-4 bg-[#FAF8F5] border-2 border-black overflow-hidden mb-3 flex">
                  {stats.photosPercent > 0 && (
                    <div className="h-full bg-[#FF2E93] border-r border-black" style={{ width: `${stats.photosPercent}%` }} />
                  )}
                  {stats.videosPercent > 0 && (
                    <div className="h-full bg-[#EF4444] border-r border-black" style={{ width: `${stats.videosPercent}%` }} />
                  )}
                  {stats.filesPercent > 0 && (
                    <div className="h-full bg-[#2563EB]" style={{ width: `${stats.filesPercent}%` }} />
                  )}
                  {stats.usedBytes === 0 && (
                    <div className="h-full w-full bg-[#FAF8F5]" />
                  )}
                </div>

                <div className="flex justify-between text-[11px] font-mono text-[#555] font-bold">
                  <span>{stats.percentageUsed}% consumed</span>
                  <span>{stats.remainingFormatted} remaining</span>
                </div>
              </div>

              {/* Storage breakdown with Real Values */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-mono font-black uppercase tracking-wider text-black">
                  Vault Usage by Format
                </h5>
                <div className="divide-y-2 divide-black border-2 border-black bg-white text-[13px] nb-shadow-xs">
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="font-black text-black flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#EF4444] border border-black" />
                      <span>Videos ({stats.videosCount})</span>
                    </span>
                    <span className="font-mono font-bold text-black">{stats.videosFormatted}</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="font-black text-black flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#FF2E93] border border-black" />
                      <span>Photos ({stats.photosCount})</span>
                    </span>
                    <span className="font-mono font-bold text-black">{stats.photosFormatted}</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="font-black text-black flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#2563EB] border border-black" />
                      <span>Files & Docs ({stats.filesCount})</span>
                    </span>
                    <span className="font-mono font-bold text-black">{stats.filesFormatted}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: VAULT (Danger Zone) */}
          {activeSection === 'vault' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Download all */}
              <div
                className="p-5 bg-white border-3 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 nb-shadow"
              >
                <div>
                  <h4 className="text-[16px] font-black text-black">
                    Download Vault Archive
                  </h4>
                  <p className="text-[12px] font-mono text-[#666] mt-0.5">
                    Export all your vault contents
                  </p>
                </div>
                <button
                  onClick={downloadAllVault}
                  className="px-4 py-2 border-2 border-black bg-[#FFE600] text-black text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#FDD835] transition cursor-pointer nb-shadow-xs shrink-0"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Download Archive</span>
                </button>
              </div>

              {/* Visually separated Danger Zone */}
              <div className="p-5 bg-[#FFF0F0] border-3 border-[#EF4444] space-y-4 nb-shadow">
                <div className="flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                  <h5 className="text-[12px] font-mono font-black uppercase tracking-widest">
                    RESTRICTED DANGER ZONE
                  </h5>
                </div>
                <p className="text-[12px] font-mono text-black leading-relaxed">
                  Actions in this section are irreversible. Data will be purged from local storage and remote vaults immediately.
                </p>

                {/* Confirmation for Delete All Media */}
                {dangerConfirm === 'deleteAll' ? (
                  <div className="p-3 bg-white border-2 border-black space-y-2">
                    <p className="text-[12px] font-bold text-red-600">
                      Are you certain you wish to delete all items?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          deleteAllMedia()
                          setDangerConfirm('none')
                        }}
                        className="px-3 py-1.5 bg-[#EF4444] text-white text-[11px] font-mono font-black uppercase tracking-wider border-2 border-black cursor-pointer nb-shadow-xs"
                      >
                        Confirm Delete All
                      </button>
                      <button
                        onClick={() => setDangerConfirm('none')}
                        className="px-3 py-1.5 text-[11px] font-mono text-[#666] hover:text-black cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDangerConfirm('deleteAll')}
                    className="w-full py-2.5 px-3 bg-white hover:bg-red-50 border-2 border-black text-[#EF4444] text-[11px] font-mono font-black uppercase tracking-wider text-left flex items-center justify-between transition cursor-pointer nb-shadow-xs"
                  >
                    <span>Delete All Media Items</span>
                    <span className="text-[10px] text-red-500 font-bold">
                      Clear all items
                    </span>
                  </button>
                )}

                {/* Confirmation for Delete Vault */}
                {dangerConfirm === 'deleteVault' ? (
                  <div className="p-3 bg-white border-2 border-black space-y-2">
                    <p className="text-[12px] font-bold text-red-600">
                      Permanently wipe Anne's entire vault and cryptographic keys?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          resetVault()
                          setDangerConfirm('none')
                          setIsSecurityModalOpen(false)
                          lockVault()
                        }}
                        className="px-3 py-1.5 bg-[#EF4444] text-white text-[11px] font-mono font-black uppercase tracking-wider border-2 border-black cursor-pointer nb-shadow-xs"
                      >
                        Purge & Reset Vault
                      </button>
                      <button
                        onClick={() => setDangerConfirm('none')}
                        className="px-3 py-1.5 text-[11px] font-mono text-[#666] hover:text-black cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDangerConfirm('deleteVault')}
                    className="w-full py-2.5 px-3 bg-white hover:bg-red-50 border-2 border-black text-[#EF4444] text-[11px] font-mono font-black uppercase tracking-wider text-left flex items-center justify-between transition cursor-pointer nb-shadow-xs"
                  >
                    <span>Delete Vault Permanently</span>
                    <span className="text-[10px] text-red-500 font-bold">
                      Permanent wipe
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
