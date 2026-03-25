'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Chrome, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

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
      setLoading(true) // Keep loading true to prevent multiple clicks
    }
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
          <p className="text-gray-500 mt-2">Welcome back! Sign in to manage your agency.</p>
        </div>

        {/* Google Login Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl text-base font-bold hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1A56DB]" />
            ) : (
              <>
                <Chrome className="w-6 h-6 text-[#4285F4]" />
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
            Build v2.0.1 • Secure OAuth 2.0
          </span>
        </div>
      </div>
    </div>
  )
}