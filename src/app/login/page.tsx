'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Loader2, Globe, Shield, ArrowRight, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (googleError) {
      setError(googleError.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-10 w-full max-w-md relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        
        {/* Logo Section */}
        <div className="text-center mb-12 relative z-10">
          <div className="w-20 h-20 bg-brand-red rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100 rotate-3 hover:rotate-0 transition-all duration-500 group">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Creova Media</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Executive Access Portal</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Secure Identify</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:ring-4 focus:ring-red-100/50 focus:bg-white transition-all text-sm placeholder:text-gray-300"
                placeholder="Email address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Access Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-6 font-bold focus:outline-none focus:ring-4 focus:ring-red-100/50 focus:bg-white transition-all text-sm placeholder:text-gray-300"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-red-100 disabled:opacity-50 flex items-center justify-center group active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Initialize Login <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 mr-3 shrink-0" />
            {error}
          </div>
        )}

        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-50"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Global Auth</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full h-14 bg-white border border-gray-100 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-4 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Globe className="w-5 h-5 text-gray-400" />
          Google Workspace
        </button>

        {/* Footer */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
            Identity Verified • SSL 256-Bit
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Service Operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}