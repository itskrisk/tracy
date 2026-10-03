import React, { useState, useEffect } from 'react'
import { useVault } from '../context/VaultContext'
import { Lock, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const LoginScreen: React.FC = () => {
  const { unlockVault, sendPasswordReset, updatePassword } = useVault()

  const [mode, setMode]                 = useState<'login' | 'forgot' | 'reset'>('login')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [confirmPassword, setConfirm]   = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [errorMsg, setErrorMsg]         = useState<string | null>(null)
  const [successMsg, setSuccessMsg]     = useState<string | null>(null)

  // Listen for Supabase password recovery link click or URL hash/params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setMode('reset')
        setErrorMsg(null)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset')
        setErrorMsg(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Enter your email and password.')
      return
    }
    setIsLoading(true)
    setErrorMsg(null)
    const err = await unlockVault(email.trim(), password)
    setIsLoading(false)
    if (err) {
      if (err.toLowerCase().includes('confirm')) {
        setErrorMsg('Email not confirmed in Supabase yet. Run the 1-line SQL in Supabase SQL Editor: UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = \'adedetracy481@gmail.com\';')
      } else {
        setErrorMsg(err)
      }
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErrorMsg('Enter your email address.')
      return
    }
    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    const err = await sendPasswordReset(email.trim())
    setIsLoading(false)
    if (err) {
      setErrorMsg(err)
    } else {
      setSuccessMsg('Recovery email sent. Check your inbox for the reset link.')
    }
  }

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }
    setIsLoading(true)
    setErrorMsg(null)
    const err = await updatePassword(newPassword)
    setIsLoading(false)
    if (err) {
      setErrorMsg(err)
    } else {
      setSuccessMsg('Master password updated. You may now unlock your vault.')
      setMode('login')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F3EC] flex items-center justify-center px-4 select-none font-sans">
      <div className="w-full max-w-[380px] flex flex-col">

        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-[42px] font-black tracking-[-0.04em] text-black leading-none">
            VAULT<span className="text-[#FF2E93]">.</span>
          </h1>
          <p className="text-[13px] font-mono text-[#888] mt-2">
            Your space. Your memories.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-black p-7" style={{ boxShadow: '4px 4px 0px #0F0F0F' }}>

          {/* ── MODE: LOGIN ── */}
          {mode === 'login' && (
            <>
              <h2 className="text-[20px] font-black text-black tracking-tight mb-5">
                Welcome back, Tracy.
              </h2>

              {successMsg && (
                <div className="mb-4 bg-[#10B981]/15 text-[#065F46] font-mono text-[11px] font-bold px-3 py-2 border-2 border-[#10B981] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                {/* Email */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-black uppercase tracking-widest mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(null) }}
                  placeholder="adedetracy481@gmail.com"
                    autoComplete="email"
                    className="w-full px-3 py-2.5 bg-[#F5F3EC] border-2 border-black text-[13px] text-black font-medium outline-none focus:bg-white focus:border-[#2563EB] transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono font-bold text-black uppercase tracking-widest">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="text-[10px] font-mono text-[#888] hover:text-black cursor-pointer uppercase tracking-widest"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrorMsg(null) }}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full px-3 py-2.5 bg-[#F5F3EC] border-2 border-black text-[13px] text-black font-medium outline-none focus:bg-white focus:border-[#FF2E93] transition-colors pr-9"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null) }}
                    className="text-[10px] font-mono text-[#888] hover:text-[#2563EB] cursor-pointer uppercase tracking-wider underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Error */}
                {errorMsg && (
                  <div className="bg-[#EF4444] text-white font-mono text-[11px] font-bold px-3 py-2 border-2 border-black">
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#FF2E93] hover:bg-[#E01E7E] text-white text-[12px] font-black uppercase tracking-widest border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ boxShadow: '3px 3px 0px #0F0F0F' }}
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── MODE: FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null) }}
                  className="w-6 h-6 border border-black flex items-center justify-center hover:bg-[#F5F3EC] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <h2 className="text-[18px] font-black text-black tracking-tight">
                  Recover Passphrase
                </h2>
              </div>

              <p className="text-[12px] font-mono text-[#666] mb-4 leading-relaxed">
                Enter your vault email address. We'll send a secure password reset link to your inbox.
              </p>

              {successMsg ? (
                <div className="space-y-4">
                  <div className="bg-[#10B981]/15 text-[#065F46] font-mono text-[11px] font-bold p-3 border-2 border-[#10B981]">
                    {successMsg}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null) }}
                    className="w-full py-2 bg-black text-white font-mono text-[11px] font-bold uppercase tracking-wider border-2 border-black cursor-pointer hover:bg-[#333]"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-black uppercase tracking-widest mb-1.5">
                      Vault Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrorMsg(null) }}
                    placeholder="adedetracy481@gmail.com"
                      autoComplete="email"
                      required
                      className="w-full px-3 py-2.5 bg-[#F5F3EC] border-2 border-black text-[13px] text-black font-medium outline-none focus:bg-white focus:border-[#2563EB] transition-colors"
                    />
                  </div>

                  {errorMsg && (
                    <div className="bg-[#EF4444] text-white font-mono text-[11px] font-bold px-3 py-2 border-2 border-black">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-black uppercase tracking-widest border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ boxShadow: '3px 3px 0px #0F0F0F' }}
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Send Recovery Email</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(null) }}
                      className="text-[11px] font-mono text-[#888] hover:text-black cursor-pointer uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── MODE: RESET PASSWORD (FROM EMAIL LINK) ── */}
          {mode === 'reset' && (
            <>
              <h2 className="text-[18px] font-black text-black tracking-tight mb-2">
                Set New Passphrase
              </h2>
              <p className="text-[12px] font-mono text-[#666] mb-4">
                Enter your new master passphrase for Tracy's Vault.
              </p>

              <form onSubmit={handleSetNewPassword} className="space-y-4" noValidate>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-black uppercase tracking-widest mb-1.5">
                    New Passphrase
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(null) }}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full px-3 py-2.5 bg-[#F5F3EC] border-2 border-black text-[13px] text-black font-medium outline-none focus:bg-white focus:border-[#2563EB] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-black uppercase tracking-widest mb-1.5">
                    Confirm Passphrase
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirm(e.target.value); setErrorMsg(null) }}
                    placeholder="Repeat passphrase"
                    required
                    className="w-full px-3 py-2.5 bg-[#F5F3EC] border-2 border-black text-[13px] text-black font-medium outline-none focus:bg-white focus:border-[#2563EB] transition-colors"
                  />
                </div>

                {errorMsg && (
                  <div className="bg-[#EF4444] text-white font-mono text-[11px] font-bold px-3 py-2 border-2 border-black">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#FF2E93] hover:bg-[#E01E7E] text-white text-[12px] font-black uppercase tracking-widest border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ boxShadow: '3px 3px 0px #0F0F0F' }}
                >
                  {isLoading ? 'Updating...' : 'Save New Passphrase'}
                </button>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  )
}
