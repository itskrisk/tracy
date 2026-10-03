// Mock data removed — all data now comes from Supabase.
// This file is kept only because VaultContext imports INITIAL_SETTINGS from here.

import type { VaultSettings, UserSession } from '../types/vault'

export const INITIAL_SETTINGS: VaultSettings = {
  twoFactorEnabled: false,
  autoLockMinutes: 30,
  biometricEnabled: false,
  cloudSync: true,
  encryptExif: true,
}

export const INITIAL_SESSIONS: UserSession[] = []

// No mock media items
export const INITIAL_MEDIA_ITEMS = [] as const
