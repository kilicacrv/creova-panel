'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Film, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { uploadMedia } from '@/app/admin/media/actions'

export default function MediaUpload({ clients }: { clients: { id: string, company_name: string }[] }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return
    
    setUploading(true)
    setError('')
    setSuccess(false)
    setProgress(10)

    try {
      const formData = new FormData(e.currentTarget)
      const clientId = formData.get('client_id') as string
      const topicContext = formData.get('topic_context') as string
      
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${clientId}/${Date.now()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      setProgress(30)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media-production')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError
      setProgress(70)

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media-production')
        .getPublicUrl(filePath)

      // 3. Save to Database via Server Action
      const finalFormData = new FormData()
      finalFormData.append('client_id', clientId)
      finalFormData.append('media_url', publicUrl)
      finalFormData.append('media_type', file.type.startsWith('video') ? 'video' : 'image')
      finalFormData.append('topic_context', topicContext)

      await uploadMedia(finalFormData)
      
      setProgress(100)
      setSuccess(true)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <form onSubmit={handleUpload} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center border border-red-100 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm flex items-center border border-green-100 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
            Media uploaded successfully and sent for admin approval!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Target Client <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="client_id"
              required
              disabled={uploading}
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] transition-all disabled:opacity-50"
            >
              <option value="">Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Topic / What is this about?
            </label>
            <input
              name="topic_context"
              type="text"
              placeholder="e.g., Summer collection preview"
              disabled={uploading}
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Media File (Photo or Video - Max 400MB)</label>
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer
              ${file ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              accept="image/*,video/*"
              disabled={uploading}
            />
            {file ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {file.type.startsWith('video') ? <Film className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                </div>
                <p className="font-semibold text-gray-900 truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                >
                  Change File
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 text-[#1A56DB] rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="font-bold text-gray-900">Drag & drop or click to upload</p>
                <p className="text-sm text-gray-500 mt-1">Images or MP4 Videos supported</p>
              </>
            )}
          </div>
        </div>

        {uploading && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#1A56DB]" />
                Uploading Large Media...
              </span>
              <span className="font-bold text-[#1A56DB]">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div 
                className="h-full bg-[#1A56DB] transition-all duration-300 shadow-[0_0_12px_rgba(26,86,219,0.3)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className={`
            w-full h-14 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center
            ${!file || uploading ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-[#1A56DB] hover:bg-[#1e4eb8] hover:shadow-[#1A56DB]/20'}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-3" />
              Staged for Admin Approval
            </>
          )}
        </button>
      </form>
    </div>
  )
}
