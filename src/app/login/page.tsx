'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Loader2, Globe, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1A56DB] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#1A56DB]/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Creova Media Panel</h1>
          <p className="text-gray-500 mt-2">Welcome back! Sign in to manage your agency.</p>
        </div>

          <div className="space-y-4">
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError('');
              const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
              if (authError) {
                setError(authError.message);
                setLoading(false);
              } else {
                router.refresh();
              }
            }}
            className="flex flex-col gap-4 mb-4"
          >
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Client Login</label>
               <input
                 type="email"
                 required
                 placeholder="Email address"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full h-12 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 font-medium focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] transition-all"
               />
            </div>
            <div>
               <input
                 type="password"
                 required
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full h-12 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 font-medium focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] transition-all"
               />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#1A56DB] text-white rounded-xl text-sm font-bold hover:bg-[#1e4eb8] transition-all shadow-md shadow-[#1A56DB]/20 disabled:opacity-50 flex items-center justify-center"
            >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In Securely"}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">or Agency Login</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 bg-white border-2 border-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#1A56DB]" />
            ) : (
              <>
                <Globe className="w-5 h-5 text-[#4285F4]" />
                Continue with Google
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-start gap-3 animate-in shake-200 duration-300">
              <div className="pt-0.5">⚠️</div>
              <p className="leading-tight">{error}</p>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-4">
            Security & Access
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Only authorized email addresses within <strong>Creova Media</strong> can access this platform. 
            If you're having trouble, please contact support.
          </p>
        </div>

        {/* Version info */}
        <div className="mt-8 text-center">
          <span className="text-[10px] text-gray-300 font-mono tracking-tighter uppercase">
            Build v2.0.2 • Secure OAuth 2.0
          </span>
        </div>
      </div>
    </div>
  )
}