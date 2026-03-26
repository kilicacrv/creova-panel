'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Film, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { uploadMedia } from '@/app/admin/media/actions'

export default function MediaUpload({ clients }: { clients: { id: string, company_name: string }[] }) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progresses, setProgresses] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    if (uploading) return
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped])
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  function removeFile(index: number) {
    if (uploading) return
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (files.length === 0) return
    
    setUploading(true)
    setError('')
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)
      const clientId = formData.get('client_id') as string
      const topicContext = formData.get('topic_context') as string
      
      for (const file of files) {
        setProgresses(prev => ({ ...prev, [file.name]: 10 }))
        
        // 1. Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${clientId}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        setProgresses(prev => ({ ...prev, [file.name]: 35 }))
        
        const { error: uploadError } = await supabase.storage
          .from('media-production')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError
        
        setProgresses(prev => ({ ...prev, [file.name]: 75 }))

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
        finalFormData.append('file_name', file.name)
        finalFormData.append('file_size', file.size.toString())

        await uploadMedia(finalFormData)
        setProgresses(prev => ({ ...prev, [file.name]: 100 }))
      }
      
      setSuccess(true)
      setFiles([])
      setProgresses({})
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error uploading files')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <form onSubmit={handleUpload} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center border border-red-100">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm flex items-center border border-green-100">
            <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
            Media uploaded successfully and sent for admin approval!
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            Upload Media <span className="text-red-500 ml-1">*</span>
          </label>
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[200px]
              ${files.length > 0 ? 'border-[#1A56DB]/40 bg-blue-50/20' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input 
              type="file" 
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".mp4,.mov,.jpg,.jpeg,.png,.pdf"
              disabled={uploading}
            />
            <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 text-[#1A56DB] rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-gray-900">Drag & drop files here</p>
            <p className="text-sm text-gray-500 mt-1">MP4, MOV, JPG, PNG, PDF up to 400MB</p>
          </div>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-700">Selected Files ({files.length})</h4>
            <div className="space-y-3">
              {files.map((f, idx) => {
                const prog = progresses[f.name] || 0
                return (
                  <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-[#1A56DB]/10 flex items-center justify-center text-[#1A56DB] shrink-0">
                      {f.type.includes('video') ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{f.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                        {uploading && <span className="text-xs font-bold text-[#1A56DB]">{prog}%</span>}
                      </div>
                      {uploading && (
                        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#1A56DB] transition-all duration-300" style={{ width: `${prog}%` }}></div>
                        </div>
                      )}
                    </div>
                    {!uploading && (
                      <button type="button" onClick={() => removeFile(idx)} className="p-2 text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Form Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Target Client <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="client_id"
              required
              disabled={uploading}
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            >
              <option value="">Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Topic / Context</label>
            <input
              name="topic_context"
              type="text"
              placeholder="e.g., Summer collection preview"
              disabled={uploading}
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={files.length === 0 || uploading}
          className={`
            w-full h-12 rounded-xl font-bold text-white transition-all flex items-center justify-center
            ${files.length === 0 || uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#1A56DB] hover:bg-[#1e4eb8] shadow-md shadow-[#1A56DB]/20'}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Uploading {files.length} files...
            </>
          ) : (
            'Start Upload'
          )}
        </button>
      </form>
    </div>
  )
}
