'use client'

import { useState } from 'react'
import { 
  CheckCircle2, XCircle, Clock, Copy, Download, Trash2, 
  ExternalLink, MessageSquare, AlertCircle, Loader2, Sparkles,
  Film, Image as ImageIcon, Search, Calendar, User, FileWarning,
  Zap, ArrowRight, ShieldCheck
} from 'lucide-react'
import Image from 'next/image'
import { approveMedia, rejectMedia, deleteMediaItem, cleanupMedia } from './actions'

type MediaItem = {
  id: string
  media_url: string
  media_type: 'image' | 'video'
  topic_context: string | null
  status: 'pending_admin' | 'approved' | 'rejected' | 'ready'
  generated_caption: string | null
  admin_feedback: string | null
  created_at: string
  file_name: string | null
  file_size: number | null
  ai_status: 'pending' | 'processing' | 'done' | 'failed'
  clients: { company_name: string }
  profiles?: { full_name: string } | null
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function MediaQueue({ 
  initialItems, 
  cleanupCount = 0, 
  cleanupSize = 0 
}: { 
  initialItems: any[],
  cleanupCount?: number,
  cleanupSize?: number
}) {
  const [items, setItems] = useState<MediaItem[]>(initialItems)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  async function handleApprove(id: string) {
    if (!confirm('Approve this media and generate AI captions?')) return
    setLoadingId(id)
    try {
      const result = await approveMedia(id)
      if (result?.error) {
        alert(result.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleReject(id: string) {
    const feedback = prompt('Provide feedback for rejection:')
    if (!feedback) return
    setLoadingId(id)
    try {
      const result = await rejectMedia(id, feedback)
      if (result?.error) {
        alert(result.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleCleanup() {
    if (cleanupCount === 0) {
      alert('No media files older than 7 days exist.')
      return
    }
    const msg = `Are you sure you want to clean up?\n\nFiles to delete: ${cleanupCount}\nStorage to free: ${formatBytes(cleanupSize)}`
    if (!confirm(msg)) return
    
    try {
      const result = await cleanupMedia()
      if (result?.error) {
        alert(result.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  const filteredItems = items.filter(item => {
    const clientMatch = item.clients?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchFilter = filter === 'all' || item.status === filter
    return clientMatch && matchFilter
  })

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        
        <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 w-full md:w-[400px] focus-within:ring-8 focus-within:ring-red-50 focus-within:border-red-100 focus-within:bg-white transition-all group">
          <Search className="w-5 h-5 text-gray-300 group-focus-within:text-brand-red transition-colors" />
          <input 
            type="text" 
            placeholder="FILTER SOURCE CLIENT..." 
            className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest w-full outline-none placeholder:text-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar relative z-10">
          {['all', 'pending_admin', 'ready', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`
                px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                ${filter === s 
                  ? 'bg-black text-white border-black shadow-xl shadow-black/10' 
                  : 'bg-white text-gray-400 border-gray-50 hover:bg-gray-50 hover:text-black'}
              `}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
          <div className="w-px h-8 bg-gray-100 mx-3 hidden md:block"></div>
          <button
            onClick={handleCleanup}
            className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white border border-gray-50 hover:bg-red-50 hover:text-brand-red hover:border-red-100 flex items-center gap-3 transition-all active:scale-95"
            title={`${cleanupCount} files ready for extraction`}
          >
            <FileWarning className="w-4 h-4 text-brand-red" />
            GC_CLEANUP
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden overflow-x-auto relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-32">Resource</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Metadata</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Origin Hub</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Neural Status</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registry Phase</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-red-50/10 transition-all group">
                <td className="p-8">
                  <a 
                    href={item.media_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block relative w-20 h-20 rounded-[1.5rem] overflow-hidden bg-black shadow-xl group-hover:ring-4 ring-brand-red/20 transition-all group-hover:rotate-2"
                  >
                    {item.media_type === 'video' ? (
                      <video src={item.media_url} className="w-full h-full object-cover opacity-80" muted playsInline />
                    ) : (
                      <Image 
                        src={item.media_url} 
                        alt="Media Thumbnail"
                        fill
                        sizes="128px"
                        className="object-cover opacity-90 transition-transform group-hover:scale-110 duration-500" 
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </a>
                </td>
                
                <td className="p-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                       {item.media_type === 'video' ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <span className="font-black text-gray-900 text-sm uppercase tracking-tight truncate max-w-[200px]" title={item.file_name || 'unknown'}>
                      {item.file_name || 'UNDEFINED_ASSET'}
                    </span>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-2.5 flex items-center gap-3">
                    <span className="bg-gray-50 px-2 py-0.5 rounded">{formatBytes(item.file_size)}</span>
                    <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse"></div>
                    <span>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </td>

                <td className="p-8">
                  <div className="font-black text-gray-900 text-xs uppercase tracking-tight mb-2 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-black" />
                     {item.clients?.company_name}
                  </div>
                  <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-gray-400 italic">
                    <User className="w-3 h-3 mr-2 opacity-30" />
                    {item.profiles?.full_name || 'DELETED_USER'}
                  </div>
                </td>

                <td className="p-8">
                  <AiStatusBadge status={item.ai_status || 'pending'} />
                </td>

                <td className="p-8 text-sm">
                  <AdminStatusBadge status={item.status} />
                </td>

                <td className="p-8 text-right">
                  {item.status === 'pending_admin' ? (
                    <div className="flex justify-end gap-3 translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={loadingId === item.id}
                        className="p-4 bg-white border border-gray-100 text-gray-300 hover:text-brand-red hover:bg-red-50 hover:border-red-100 rounded-2xl transition-all shadow-sm hover:shadow-xl active:scale-90"
                        title="Reject Payload"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={loadingId === item.id}
                        className="p-4 bg-black text-white hover:bg-brand-red rounded-2xl shadow-xl hover:shadow-red-200 transition-all active:scale-95 flex items-center"
                        title="Commence Approval"
                      >
                        {loadingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end pr-4">
                       <ShieldCheck className="w-6 h-6 text-emerald-500 opacity-20" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 bg-gray-50/20">
            <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-10 border border-gray-100 relative group">
               <div className="absolute inset-0 bg-red-50 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
               <Clock className="w-12 h-12 text-gray-100 relative z-10 transition-transform group-hover:rotate-12" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Queue Silent</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3 max-w-sm mx-auto leading-loose text-center">
               Operational matrix clear. Awaiting fresh payload ingestion from deployed personnel.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

function AiStatusBadge({ status }: { status: string }) {
  const map: any = {
    pending: { bg: 'bg-gray-50', text: 'text-gray-400', icon: Clock },
    processing: { bg: 'bg-red-50', text: 'text-brand-red', icon: Loader2 },
    done: { bg: 'bg-black', text: 'text-white', icon: Sparkles },
    failed: { bg: 'bg-red-50', text: 'text-brand-red', icon: FileWarning }
  }
  const config = map[status] || map.pending
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100/10 ${config.bg} ${config.text} transition-all`}>
      <Icon className={`w-3.5 h-3.5 mr-2.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {status}
    </div>
  )
}

function AdminStatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending_admin: 'bg-amber-50 text-amber-600 border-amber-100',
    ready: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-red-50 text-brand-red border-red-100',
    approved: 'bg-black text-white border-black'
  }

  return (
    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
