export type MediaType = 'image' | 'video' | 'file'

export type FileCategory =
  | 'pdf'
  | 'doc'
  | 'spreadsheet'
  | 'archive'
  | 'audio'
  | 'code'
  | 'other'

export interface MediaItem {
  id: string
  title: string
  filename: string
  type: MediaType
  fileCategory?: FileCategory
  url: string
  thumbnailUrl: string
  size: string
  rawBytes: number
  date: string
  duration?: string
  aspectRatio?: string
  width?: number
  height?: number
  isFavorite?: boolean
  description?: string
  mimeType?: string
}

export interface UserSession {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  isCurrent: boolean
}

export interface VaultSettings {
  twoFactorEnabled: boolean
  autoLockMinutes: number
  biometricEnabled: boolean
  cloudSync: boolean
  encryptExif: boolean
}
