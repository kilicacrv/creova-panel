import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (typeof window !== 'undefined') {
    console.log('--- Supabase Diagnostic ---')
    console.log('URL defined:', !!url)
    console.log('Anon Key length:', anonKey?.length)
    if (anonKey?.includes('service_role')) {
      console.error('🔥 CRITICAL: Your NEXT_PUBLIC_SUPABASE_ANON_KEY contains "service_role". This is a SECRET key and should not be in the browser!')
    }
  }

  return createBrowserClient(url, anonKey)
}