import { createServerSupabaseClient } from '@/lib/supabase-server'
import MediaQueue from './MediaQueue'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: mediaItems } = await supabase
    .from('media_production')
    .select('*, clients(company_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Media Production Pipeline 🎬
          </h1>
          <p className="text-gray-500 mt-1">Review editor uploads, approve for Gemini AI captioning, and manage final assets.</p>
        </div>
      </div>

      <MediaQueue initialItems={mediaItems || []} />
    </div>
  )
}
