import { createServerSupabaseClient } from '@/lib/supabase-server'
import MediaUpload from './MediaUpload'

export const dynamic = 'force-dynamic'

export default async function MediaUploadPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('status', 'active')
    .order('company_name')

  return (
    <div className="p-6 lg:p-8 w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Media Production Upload</h1>
        <p className="text-gray-500 mt-1">Upload photos or videos for admin approval and AI caption generation.</p>
      </div>

      <MediaUpload clients={clients || []} />
    </div>
  )
}
