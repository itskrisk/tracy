import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { MediaItem, UserSession, VaultSettings, FileCategory } from '../types/vault'
import { supabase, uploadVaultFile, deleteVaultFile } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

export type VaultTab = 'home' | 'photos' | 'videos' | 'files' | 'security'
export type VaultColor = 'blue' | 'pink' | 'red' | 'mono'

interface UploadProgressState {
  filename: string
  percentage: number
  isUploading: boolean
}

interface VaultContextType {
  // Auth
  isAuthenticated: boolean
  user: User | null
  isFirstLogin: boolean
  isAuthLoading: boolean
  unlockVault: (email: string, password: string) => Promise<string | null>
  lockVault: () => Promise<void>
  changeCredentials: (email: string, password: string) => Promise<string | null>
  sendPasswordReset: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  dismissFirstLogin: () => void

  // Media
  mediaItems: MediaItem[]
  isMediaLoading: boolean
  selectedMedia: MediaItem | null
  setSelectedMedia: (item: MediaItem | null) => void
  nextMedia: () => void
  prevMedia: () => void
  handleFileUpload: (files: FileList | File[]) => Promise<void>
  deleteMedia: (id: string) => Promise<void>
  downloadMedia: (item: MediaItem) => void
  toggleFavorite: (id: string) => Promise<void>
  downloadAllVault: () => void
  deleteAllMedia: () => Promise<void>
  resetVault: () => Promise<void>

  // Tabs
  activeTab: VaultTab
  setActiveTab: (tab: VaultTab) => void

  // Modals
  isUploadModalOpen: boolean
  setIsUploadModalOpen: (v: boolean) => void
  isSecurityModalOpen: boolean
  setIsSecurityModalOpen: (v: boolean) => void
  isFirstLoginModalOpen: boolean
  setIsFirstLoginModalOpen: (v: boolean) => void

  // Upload progress
  uploadProgress: UploadProgressState | null

  // Stats
  stats: {
    usedBytes: number
    usedFormatted: string
    totalFormatted: string
    remainingFormatted: string
    percentageUsed: number
    photosCount: number
    videosCount: number
    filesCount: number
    photosBytes: number
    videosBytes: number
    filesBytes: number
    photosFormatted: string
    videosFormatted: string
    filesFormatted: string
    photosPercent: number
    videosPercent: number
    filesPercent: number
  }

  // Toast
  showToast: (msg: string) => void
  toastMessage: string | null

  // Settings (UI / lightweight)
  settings: VaultSettings
  updateSettings: (patch: Partial<VaultSettings>) => void

  // Sessions (UI representation)
  sessions: UserSession[]
  revokeSession: (id: string) => void

  // Colors
  vaultColor: VaultColor
  setVaultColor: (c: VaultColor) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  if (bytes >= 1024 * 1024)        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function extToCategory(ext: string): FileCategory {
  if (ext === 'pdf') return 'pdf'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'spreadsheet'
  if (['doc', 'docx', 'pages', 'txt', 'rtf'].includes(ext)) return 'doc'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
  if (['mp3', 'aac', 'wav', 'flac', 'm4a'].includes(ext)) return 'audio'
  if (['js', 'ts', 'py', 'rs', 'go', 'cpp', 'json'].includes(ext)) return 'code'
  return 'other'
}

/** Map a DB row → MediaItem (without signed URL, which is filled separately) */
function rowToMediaItem(row: Record<string, unknown>): MediaItem {
  return {
    id:          row.id as string,
    title:       (row.title as string) || (row.filename as string),
    filename:    row.filename as string,
    type:        row.type as MediaItem['type'],
    fileCategory: row.file_category as FileCategory | undefined,
    mimeType:    row.mime_type as string | undefined,
    url:         (row.thumbnail_url as string) || '',  // will be replaced by signed URL
    thumbnailUrl: (row.thumbnail_url as string) || '',
    size:        row.size as string,
    rawBytes:    (row.raw_bytes as number) || 0,
    date:        row.date as string,
    duration:    row.duration as string | undefined,
    description: row.description as string | undefined,
    isFavorite:  (row.is_favorite as boolean) || false,
    // We'll use storage_path separately to generate signed URLs
    _storagePath: row.storage_path as string | undefined,
  } as MediaItem & { _storagePath?: string }
}

// ── INITIAL_SESSIONS (still used as UI mock for the sessions panel) ───────────

const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'current',
    device: 'MacBook Pro',
    browser: 'Safari',
    location: 'Current session',
    lastActive: 'Now',
    isCurrent: true,
  },
  {
    id: 'iphone',
    device: 'iPhone 15 Pro',
    browser: 'Safari iOS',
    location: 'Mobile',
    lastActive: '2 hrs ago',
    isCurrent: false,
  },
]

const INITIAL_SETTINGS: VaultSettings = {
  twoFactorEnabled: false,
  autoLockMinutes: 30,
  biometricEnabled: false,
  cloudSync: true,
  encryptExif: true,
}

// ── Context ───────────────────────────────────────────────────────────────────

const VaultContext = createContext<VaultContextType | null>(null)

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading]     = useState(true)
  const [user, setUser]                       = useState<User | null>(null)
  const [isFirstLogin, setIsFirstLogin]       = useState(false)
  const [isFirstLoginModalOpen, setIsFirstLoginModalOpen] = useState(false)

  // ── Media state
  const [mediaItems, setMediaItems]     = useState<MediaItem[]>([])
  const [isMediaLoading, setIsMediaLoading] = useState(false)
  const [selectedMedia, setSelectedMedia]   = useState<MediaItem | null>(null)

  // ── Browser URL Routing sync
  const getInitialTab = (): VaultTab => {
    if (typeof window === 'undefined') return 'home'
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
    if (path === 'photos' || path === 'videos' || path === 'files') {
      return path
    }
    return 'home'
  }

  // ── UI state
  const [activeTab, setActiveTabState] = useState<VaultTab>(getInitialTab)

  const setActiveTab = useCallback((tab: VaultTab) => {
    setActiveTabState(tab)
    if (typeof window !== 'undefined') {
      const targetPath = tab === 'home' ? '/' : `/${tab}`
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath)
      }
    }
  }, [])

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTab())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  const [isUploadModalOpen, setIsUploadModalOpen]   = useState(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const [uploadProgress, setUploadProgress]     = useState<UploadProgressState | null>(null)
  const [toastMessage, setToastMessage]         = useState<string | null>(null)
  const [vaultColor, setVaultColorState]        = useState<VaultColor>(() =>
    (localStorage.getItem('vault_color') as VaultColor) || 'pink'
  )
  const [settings, setSettings] = useState<VaultSettings>(() => {
    const saved = localStorage.getItem('vault_settings')
    if (saved) { try { return JSON.parse(saved) } catch { /* noop */ } }
    return INITIAL_SETTINGS
  })
  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Persist settings
  useEffect(() => {
    localStorage.setItem('vault_settings', JSON.stringify(settings))
  }, [settings])

  // ── Toast
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMessage(msg)
    toastTimer.current = setTimeout(() => setToastMessage(null), 2800)
  }, [])

  // ── Auth listener: runs once on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session)
      setIsAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session)
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSessionChange = (session: Session | null) => {
    if (session?.user) {
      setUser(session.user)
      setIsAuthenticated(true)
      const first = session.user.user_metadata?.first_login === true
      setIsFirstLogin(first)
      if (first) setIsFirstLoginModalOpen(true)
      loadMediaItems(session.user.id)
    } else {
      setUser(null)
      setIsAuthenticated(false)
      setIsFirstLogin(false)
      setIsFirstLoginModalOpen(false)
      setMediaItems([])
    }
  }

  // ── Load media from Supabase DB + generate signed URLs
  const loadMediaItems = async (userId: string) => {
    setIsMediaLoading(true)
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[vault] load media error:', error.message)
        setIsMediaLoading(false)
        return
      }

      // Generate signed URLs in parallel
      const items = await Promise.all(
        (data || []).map(async (row) => {
          const item = rowToMediaItem(row as Record<string, unknown>)
          const extItem = item as MediaItem & { _storagePath?: string }
          if (extItem._storagePath) {
            const { data: signed } = await supabase.storage
              .from('vault')
              .createSignedUrl(extItem._storagePath, 60 * 60 * 6)
            if (signed?.signedUrl) {
              item.url = signed.signedUrl
              item.thumbnailUrl = signed.signedUrl
            }
          }
          return item
        })
      )

      setMediaItems(items)
    } finally {
      setIsMediaLoading(false)
    }
  }

  // ── Auth actions

  const unlockVault = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    if (data?.session) {
      handleSessionChange(data.session)
    }
    return null
  }

  const lockVault = async () => {
    await supabase.auth.signOut()
    setSelectedMedia(null)
    setIsUploadModalOpen(false)
    setIsSecurityModalOpen(false)
    setActiveTab('home')
  }

  /**
   * Change email and password.
   * Updates password and metadata first, then handles email update.
   */
  const changeCredentials = async (newEmail: string, newPassword: string): Promise<string | null> => {
    // 0. Verify active session exists
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData?.session) {
      return 'Session expired. Please sign in again, then update your credentials.'
    }

    // 1. Update password and metadata FIRST (fast and reliable)
    const { error: passErr } = await supabase.auth.updateUser({
      password: newPassword,
      data: { first_login: false },
    })
    if (passErr) {
      if (passErr.message.toLowerCase().includes('session missing')) {
        return 'Session expired. Please sign in again, then update your credentials.'
      }
      return passErr.message
    }

    // 2. If email is provided and different from current:
    const trimmedEmail = newEmail.trim()
    if (trimmedEmail && trimmedEmail.toLowerCase() !== sessionData.session.user.email?.toLowerCase()) {
      try {
        const { error: emailErr } = await supabase.auth.updateUser({ email: trimmedEmail })
        if (emailErr) {
          const isTimeout = emailErr.message.includes('504') || (emailErr as unknown as Record<string, unknown>).status === 504
          if (isTimeout) {
            setIsFirstLogin(false)
            setIsFirstLoginModalOpen(false)
            showToast('Passphrase updated! For email changes, disable "Secure email change" in Supabase.')
            return null
          }
          return `Password updated, but email change failed: ${emailErr.message}`
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        if (errMsg.includes('504')) {
          setIsFirstLogin(false)
          setIsFirstLoginModalOpen(false)
          showToast('Passphrase updated! For email changes, disable "Secure email change" in Supabase.')
          return null
        }
      }
    }

    setIsFirstLogin(false)
    setIsFirstLoginModalOpen(false)
    showToast('Credentials updated. Check email for confirmation.')
    return null
  }

  const sendPasswordReset = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    if (error) return error.message
    showToast('Reset link sent. Check your inbox.')
    return null
  }

  const updatePassword = async (password: string): Promise<string | null> => {
    // Force-load the session into SDK memory before calling updateUser
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
    if (sessionErr || !session) {
      // Try refreshing the session from localStorage
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession()
      if (refreshErr || !refreshed.session) {
        return 'Session expired. Please lock and sign in again.'
      }
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return error.message
    showToast('Master passphrase updated! Please use your new password next time you sign in.')
    return null
  }

  const dismissFirstLogin = () => {
    // Hides the modal for this session only; next login will show again
    setIsFirstLoginModalOpen(false)
  }

  // ── 5-Minute Inactivity Auto-Lock
  useEffect(() => {
    if (!isAuthenticated || isFirstLoginModalOpen) return

    let timeoutId: ReturnType<typeof setTimeout>

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (isFirstLoginModalOpen) return
        lockVault()
        showToast('Session locked after 5 minutes of inactivity.')
      }, 5 * 60 * 1000)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }))

    resetTimer()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach((ev) => window.removeEventListener(ev, resetTimer))
    }
  }, [isAuthenticated, isFirstLoginModalOpen, showToast])

  // ── Navigation

  const nextMedia = useCallback(() => {
    if (!selectedMedia) return
    const idx = mediaItems.findIndex((m) => m.id === selectedMedia.id)
    setSelectedMedia(mediaItems[(idx + 1) % mediaItems.length] ?? null)
  }, [selectedMedia, mediaItems])

  const prevMedia = useCallback(() => {
    if (!selectedMedia) return
    const idx = mediaItems.findIndex((m) => m.id === selectedMedia.id)
    setSelectedMedia(mediaItems[(idx - 1 + mediaItems.length) % mediaItems.length] ?? null)
  }, [selectedMedia, mediaItems])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMedia) return
      if (e.key === 'Escape')      setSelectedMedia(null)
      else if (e.key === 'ArrowRight') nextMedia()
      else if (e.key === 'ArrowLeft')  prevMedia()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMedia, nextMedia, prevMedia])

  // ── File upload

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!user) return
    const fileList = Array.from(files)
    if (fileList.length === 0) return

    for (const file of fileList) {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      const ext     = file.name.split('.').pop()?.toLowerCase() || ''
      const mediaType: MediaItem['type'] = isVideo ? 'video' : isImage ? 'image' : 'file'
      const fileCategory = mediaType === 'file' ? extToCategory(ext) : undefined

      setUploadProgress({ filename: file.name, percentage: 10, isUploading: true })

      // Upload to Supabase Storage
      const result = await uploadVaultFile(user.id, file, (pct) => {
        setUploadProgress((p) => p ? { ...p, percentage: Math.round(pct * 0.85) } : null)
      })

      setUploadProgress((p) => p ? { ...p, percentage: 92 } : null)

      const today = new Date().toLocaleDateString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric',
      })

      const dbRow = {
        user_id:       user.id,
        title:         file.name.replace(/\.[^/.]+$/, ''),
        filename:      file.name,
        type:          mediaType,
        file_category: fileCategory ?? null,
        mime_type:     file.type || null,
        size:          formatBytes(file.size),
        raw_bytes:     file.size,
        date:          today,
        storage_path:  result?.storagePath ?? null,
        thumbnail_url: result?.signedUrl ?? '',
        is_favorite:   false,
      }

      const { data: inserted, error: dbError } = await supabase
        .from('media_items')
        .insert(dbRow)
        .select()
        .single()

      if (dbError) {
        console.error('[vault] insert error:', dbError.message)
        setUploadProgress(null)
        showToast(`Failed to save ${file.name}.`)
        continue
      }

      const newItem: MediaItem = {
        ...rowToMediaItem(inserted as Record<string, unknown>),
        url:          result?.signedUrl ?? '',
        thumbnailUrl: result?.signedUrl ?? '',
      }

      setMediaItems((prev) => [newItem, ...prev])
      setUploadProgress((p) => p ? { ...p, percentage: 100 } : null)
      await new Promise((r) => setTimeout(r, 200))
    }

    setUploadProgress(null)
    setIsUploadModalOpen(false)
    showToast(
      fileList.length === 1
        ? 'Added to your vault.'
        : `${fileList.length} items added to your vault.`
    )
  }

  // ── CRUD

  const deleteMedia = async (id: string) => {
    // Find storage path before removing from state
    const item = mediaItems.find((m) => m.id === id) as (MediaItem & { _storagePath?: string }) | undefined
    const storagePath = (item as unknown as Record<string, unknown>)?._storagePath as string | undefined

    // Remove from DB
    await supabase.from('media_items').delete().eq('id', id)

    // Remove from Storage
    if (storagePath) await deleteVaultFile(storagePath)

    setMediaItems((prev) => prev.filter((m) => m.id !== id))
    if (selectedMedia?.id === id) setSelectedMedia(null)
    showToast('Removed from vault.')
  }

  const toggleFavorite = async (id: string) => {
    const item = mediaItems.find((m) => m.id === id)
    if (!item) return
    const next = !item.isFavorite
    await supabase.from('media_items').update({ is_favorite: next }).eq('id', id)
    setMediaItems((prev) =>
      prev.map((m) => m.id === id ? { ...m, isFavorite: next } : m)
    )
    if (selectedMedia?.id === id) {
      setSelectedMedia((prev) => prev ? { ...prev, isFavorite: next } : null)
    }
  }

  const downloadMedia = (item: MediaItem) => {
    const a = document.createElement('a')
    a.href = item.url
    a.download = item.filename
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast(`Downloading ${item.filename}`)
  }

  const downloadAllVault = () => {
    showToast('Preparing vault archive...')
  }

  const deleteAllMedia = async () => {
    if (!user) return
    const allPaths = (mediaItems as Array<MediaItem & { _storagePath?: string }>)
      .map((m) => m._storagePath)
      .filter(Boolean) as string[]

    await supabase.from('media_items').delete().eq('user_id', user.id)
    if (allPaths.length > 0) {
      await supabase.storage.from('vault').remove(allPaths)
    }
    setMediaItems([])
    setSelectedMedia(null)
    showToast('All media cleared from vault.')
  }

  const resetVault = async () => {
    await deleteAllMedia()
    showToast('Vault cleared.')
  }

  // ── Settings & sessions

  const updateSettings = (patch: Partial<VaultSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
    showToast('Settings saved.')
  }

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    showToast('Session terminated.')
  }

  const setVaultColor = (color: VaultColor) => {
    setVaultColorState(color)
    localStorage.setItem('vault_color', color)
  }

  // ── Real Storage Breakdown Stats
  const photosItems = mediaItems.filter((m) => m.type === 'image')
  const videosItems = mediaItems.filter((m) => m.type === 'video')
  const filesItems  = mediaItems.filter((m) => m.type === 'file')

  const photosBytes = photosItems.reduce((acc, m) => acc + (m.rawBytes || 0), 0)
  const videosBytes = videosItems.reduce((acc, m) => acc + (m.rawBytes || 0), 0)
  const filesBytes  = filesItems.reduce((acc, m) => acc + (m.rawBytes || 0), 0)
  const usedBytes   = photosBytes + videosBytes + filesBytes
  const totalBytes  = 50 * 1024 * 1024 * 1024 // 50 GB quota
  const percentageUsed = Math.min(100, Math.round((usedBytes / totalBytes) * 100))

  const photosPercent = totalBytes > 0 ? Math.min(100, Math.max(usedBytes > 0 ? 1 : 0, Math.round((photosBytes / totalBytes) * 100))) : 0
  const videosPercent = totalBytes > 0 ? Math.min(100, Math.max(usedBytes > 0 ? 1 : 0, Math.round((videosBytes / totalBytes) * 100))) : 0
  const filesPercent  = totalBytes > 0 ? Math.min(100, Math.max(usedBytes > 0 ? 1 : 0, Math.round((filesBytes / totalBytes) * 100))) : 0

  return (
    <VaultContext.Provider
      value={{
        isAuthenticated,
        user,
        isFirstLogin,
        isAuthLoading,
        unlockVault,
        lockVault,
        changeCredentials,
        sendPasswordReset,
        updatePassword,
        dismissFirstLogin,
        mediaItems,
        isMediaLoading,
        selectedMedia,
        setSelectedMedia,
        nextMedia,
        prevMedia,
        handleFileUpload,
        deleteMedia,
        toggleFavorite,
        downloadMedia,
        downloadAllVault,
        deleteAllMedia,
        resetVault,
        activeTab,
        setActiveTab,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        isFirstLoginModalOpen,
        setIsFirstLoginModalOpen,
        uploadProgress,
        stats: {
          usedBytes,
          usedFormatted: formatBytes(usedBytes),
          totalFormatted: '50 GB',
          remainingFormatted: formatBytes(Math.max(0, totalBytes - usedBytes)),
          percentageUsed,
          photosCount: photosItems.length,
          videosCount: videosItems.length,
          filesCount:  filesItems.length,
          photosBytes,
          videosBytes,
          filesBytes,
          photosFormatted: formatBytes(photosBytes),
          videosFormatted: formatBytes(videosBytes),
          filesFormatted:  formatBytes(filesBytes),
          photosPercent,
          videosPercent,
          filesPercent,
        },
        toastMessage,
        showToast,
        settings,
        updateSettings,
        sessions,
        revokeSession,
        vaultColor,
        setVaultColor,
      }}
    >
      {children}
    </VaultContext.Provider>
  )
}

export const useVault = () => {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used inside VaultProvider')
  return ctx
}
