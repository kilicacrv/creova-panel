'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Film, Image as ImageIcon, ArrowRight, Zap } from 'lucide-react'
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
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${clientId}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        setProgresses(prev => ({ ...prev, [file.name]: 35 }))
        
        const { error: uploadError } = await supabase.storage
          .from('media-production')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError
        
        setProgresses(prev => ({ ...prev, [file.name]: 75 }))

        const { data: { publicUrl } } = supabase.storage
          .from('media-production')
          .getPublicUrl(filePath)

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
      setError(err.message || 'Error executing upload protocol')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-30"></div>
      
      <form onSubmit={handleUpload} className="p-10 lg:p-14 space-y-10 relative z-10">
        <div className="flex justify-between items-center border-b border-gray-50 pb-8">
           <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-bold">Media Uplink</h2>
              <p className="text-[10px] font-semibold text-sm text-gray-400 mt-2">Payload Ingestion Interface</p>
           </div>
           <div className="w-16 h-16 bg-red-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner ring-1 ring-red-100">
              <Upload className="w-8 h-8" />
           </div>
        </div>

        {error && (
          <div className="bg-red-50 text-blue-600 p-6 rounded-2xl text-[10px] font-semibold text-sm flex items-center border border-red-100 animate-in shake-200">
            <AlertCircle className="w-5 h-5 mr-4 shrink-0" />
            System Override: {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl text-[10px] font-semibold text-sm flex items-center border border-emerald-100 animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 mr-4 shrink-0" />
            Payload broadcast successful. Awaiting hub validation.
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[10px] font-semibold text-sm text-gray-400 flex items-center ml-1">
            <Zap className="w-3 h-3 mr-2 text-blue-600" />
            Asset Matrix <span className="text-blue-600 ml-2 font-bold">*</span>
          </label>
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative border-4 border-dashed rounded-xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[300px] group
              ${files.length > 0 ? 'border-blue-600/20 bg-red-50/10' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-600/30 hover:shadow-xl hover:shadow-red-50'}
              ${uploading ? 'opacity-30 cursor-not-allowed scale-[0.98]' : 'active:scale-95'}
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
            <div className="w-20 h-20 bg-white shadow-2xl border border-gray-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:rotate-12 group-hover:scale-110">
              <Upload className="w-8 h-8" />
            </div>
            <p className="font-bold text-gray-900 uppercase tracking-normal text-sm">Initialize Drag-Drop</p>
            <p className="text-[10px] font-semibold text-sm text-gray-300 mt-2">MP4 / MOV / JPG / PNG / Max Payload 400MB</p>
            
            {files.length > 0 && (
              <div className="absolute top-6 right-6 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-semibold text-sm">
                {files.length} Nodes Loaded
              </div>
            )}
          </div>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h4 className="text-[10px] font-semibold text-sm text-gray-400 ml-1">Loaded Payload Queue</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {files.map((f, idx) => {
                const prog = progresses[f.name] || 0
                return (
                  <div key={idx} className="bg-gray-50/50 border border-gray-100 p-5 rounded-xl flex items-center gap-5 group hover:bg-white hover:shadow-xl transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                      {f.type.includes('video') ? <Film className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-900 truncate">{f.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-normal">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                        {uploading && <span className="text-[10px] font-bold text-blue-600">{prog}%</span>}
                      </div>
                      {uploading && (
                        <div className="w-full h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${prog}%` }}></div>
                        </div>
                      )}
                    </div>
                    {!uploading && (
                      <button type="button" onClick={() => removeFile(idx)} className="p-3 text-gray-300 hover:text-blue-600 hover:bg-red-50 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Form Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-50">
          <div className="space-y-3">
            <label className="text-[10px] font-semibold text-sm text-gray-400 flex items-center ml-1">
              Destination Hub <span className="text-blue-600 ml-2 font-bold">*</span>
            </label>
            <select
              name="client_id"
              required
              disabled={uploading}
              className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white font-bold text-[11px] uppercase tracking-normal transition-all cursor-pointer"
            >
              <option value="">-- SELECT RECEIVER --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-semibold text-sm text-gray-400 ml-1">Operational Context</label>
            <input
              name="topic_context"
              type="text"
              placeholder="E.G. Q4 BRAND IDENTITY PROTOCOL"
              disabled={uploading}
              className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white font-bold text-[11px] uppercase tracking-normal transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={files.length === 0 || uploading}
          className={`
            w-full h-20 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center shadow-2xl relative overflow-hidden group active:scale-95
            ${files.length === 0 || uploading ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100' : 'bg-black text-white hover:bg-blue-600 shadow-blue-100'}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 mr-4 animate-spin" />
              Executing Broadcast: {files.length} Nodes...
            </>
          ) : (
            <>
              Initialize Broadcast Phase <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
