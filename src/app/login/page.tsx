'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, Sparkles, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [method, setMethod] = useState<'password' | 'magic-link'>('password')
  const router = useRouter()
  const supabase = createClient()

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.replace('/')
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1A56DB] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#1A56DB]/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Creova Media Panel</h1>
          <p className="text-gray-500 mt-2">Welcome back! Please enter your details.</p>
        </div>

        {/* Method Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
          <button
            onClick={() => setMethod('password')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${method === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Password
          </button>
          <button
            onClick={() => setMethod('magic-link')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${method === 'magic-link' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Magic Link
          </button>
        </div>

        {/* Form or Success Message */}
        {success ? (
          <div className="text-center bg-blue-50 border border-blue-100 rounded-2xl p-6 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#1A56DB]" />
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">Check your email</h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              We sent a login link to <span className="font-semibold">{email}</span>. Click the link to sign in.
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-6 text-sm font-bold text-[#1A56DB] hover:text-[#1e4eb8] transition-colors"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={method === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] transition-all"
                placeholder="name@company.com"
                disabled={loading}
              />
            </div>

            {method === 'password' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-start gap-3 animate-in shake-200 duration-300">
                <div className="pt-0.5">⚠️</div>
                <p className="leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#1A56DB] text-white rounded-xl text-sm font-bold hover:bg-[#1e4eb8] shadow-lg shadow-[#1A56DB]/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {method === 'password' ? 'Sign In' : 'Send Link'}
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            For access or support, contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}