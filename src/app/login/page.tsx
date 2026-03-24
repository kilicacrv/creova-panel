'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Sadece Magic Link / OTP gönderimi
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message || 'Davet bağlantısı gönderilirken hata oluştu.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="2,14 7,8 11,12 16,6 22,4"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Creova Media</h1>
          <p className="text-sm text-gray-500 mt-1">Panelinize erişmek için e-posta adresinizi girin</p>
        </div>

        {/* Form veya Başarı Mesajı */}
        {success ? (
          <div className="text-center bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📧</span>
            </div>
            <h3 className="text-sm font-medium text-green-800 mb-1">Giriş Bağlantısı Gönderildi</h3>
            <p className="text-sm text-green-600">
              <b>{email}</b> adresine güvenli bir giriş bağlantısı yolladık. Lütfen e-postanızı kontrol edin.
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-6 text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              Farklı bir e-posta dene
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresiniz</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ornek@creova.com"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Bağlantı Gönderiliyor...' : 'Giriş Bağlantısı Gönder'}
            </button>
          </form>
        )}

        {/* Info */}
        {!success && (
          <p className="text-center text-xs text-gray-500 mt-6 mt-4">
            Bu sisteme dışarıdan kayıt olunamaz. Sadece size yollanan davetiye ile giriş yapabilirsiniz.
          </p>
        )}
      </div>
    </div>
  )
}