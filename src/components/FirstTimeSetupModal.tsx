import React, { useState } from 'react'
import { useVault } from '../context/VaultContext'
import { Lock, Mail, X, ShieldAlert, ArrowRight } from 'lucide-react'

export const FirstTimeSetupModal: React.FC = () => {
  const { isFirstLoginModalOpen, changeCredentials, dismissFirstLogin } = useVault()

  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [step, setStep]               = useState<'intro' | 'form'>('intro')

  if (!isFirstLoginModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password) {
      setError('New password is required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const err = await changeCredentials(email.trim(), password)
    setIsSubmitting(false)

    if (err) {
      setError(err)
    }
    // On success, VaultContext closes the modal automatically
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop — NOT clickable (we want her to consciously skip) */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-[#F5F3EC] border-2 border-black z-10 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: '6px 6px 0px #0F0F0F' }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#FF2E93] border border-white/30 flex items-center justify-center">
              <ShieldAlert className="w-3 h-3" />
            </div>
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#FFE600]">
              First Time Setup
            </span>
          </div>
          {/* Skip — deliberate small button */}
          <button
            onClick={dismissFirstLogin}
            className="text-[10px] font-mono text-white/50 hover:text-white uppercase tracking-widest cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Remind me later</span>
          </button>
        </div>

        {step === 'intro' ? (
          /* Intro step */
          <div className="p-6 space-y-5">
            <div className="bg-[#FF2E93] text-white border-2 border-black p-4">
              <p className="font-black text-[15px] tracking-tight">
                Change your login credentials.
              </p>
              <p className="font-mono text-[12px] text-white/80 mt-1 leading-relaxed">
                You're using temporary credentials. Update your email and password to secure your vault. You'll be prompted each login until you change them.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-white border-2 border-black">
                <div className="w-8 h-8 bg-[#EF4444] border-2 border-black flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[12px] font-black text-black">Current email</div>
                  <div className="text-[11px] font-mono text-[#EF4444]">adedetracy481@gmail.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border-2 border-black">
                <div className="w-8 h-8 bg-[#EF4444] border-2 border-black flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[12px] font-black text-black">Current password</div>
                  <div className="text-[11px] font-mono text-[#EF4444]">Tracy123! (temporary)</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-2.5 bg-[#FF2E93] hover:bg-[#E01E7E] text-white border-2 border-black font-mono text-[11px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
                style={{ boxShadow: '3px 3px 0px #0F0F0F' }}
              >
                <span>Change now</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <button
                onClick={dismissFirstLogin}
                className="px-4 py-2.5 bg-white border-2 border-black text-black font-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[#F5F3EC] transition-all"
              >
                Later
              </button>
            </div>
          </div>
        ) : (
          /* Form step */
          <div className="p-6">
            <button
              onClick={() => { setStep('intro'); setError(null) }}
              className="text-[10px] font-mono text-[#888] hover:text-black uppercase tracking-widest cursor-pointer mb-4 block"
            >
              ← Back
            </button>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* New email */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-black uppercase tracking-widest mb-1.5">
                  New Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
                  placeholder="your.real@email.com"
                  autoComplete="email"
                  className="w-full px-3 py-2.5 bg-white border-2 border-black text-[13px] text-black font-medium outline-none focus:border-[#FF2E93] transition-colors"
                />
              </div>

              {/* New password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono font-bold text-black uppercase tracking-widest">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    tabIndex={-1}
                    className="text-[10px] font-mono text-[#888] hover:text-black cursor-pointer uppercase tracking-widest"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 bg-white border-2 border-black text-[13px] text-black font-medium outline-none focus:border-[#FF2E93] transition-colors"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-black uppercase tracking-widest mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirm(e.target.value); setError(null) }}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 bg-white border-2 border-black text-[13px] text-black font-medium outline-none focus:border-[#FF2E93] transition-colors"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-[#EF4444] text-white font-mono text-[11px] font-bold p-3 border-2 border-black space-y-2">
                  <div>{error}</div>
                  {error.toLowerCase().includes('sign in') && (
                    <button
                      type="button"
                      onClick={dismissFirstLogin}
                      className="px-3 py-1 bg-black text-white text-[10px] uppercase tracking-wider border border-white hover:bg-neutral-800 cursor-pointer block mt-1"
                    >
                      &larr; Sign In Again
                    </button>
                  )}
                </div>
              )}

              <div className="text-[10px] font-mono text-[#888] leading-relaxed pt-1">
                After saving, you'll be asked to confirm your new email.
                You won't be prompted again after this change.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#FF2E93] hover:bg-[#E01E7E] text-white border-2 border-black font-mono text-[11px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
                style={{ boxShadow: '3px 3px 0px #0F0F0F' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Save & Secure Vault</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
