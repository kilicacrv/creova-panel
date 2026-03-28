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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        
        <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full md:w-[400px] focus-within:ring-2 focus-within:ring-blue-50 focus-within:border-blue-600 focus-within:bg-white transition-all group">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by client..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none placeholder:text-gray-400 font-medium"
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
                px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border
                ${filter === s 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              {s === 'pending_admin' ? 'Pending' : s.replace('_', ' ')}
            </button>
          ))}
          <div className="w-px h-8 bg-gray-100 mx-3 hidden md:block"></div>
          <button
            onClick={handleCleanup}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 flex items-center gap-2 transition-all active:scale-95"
            title={`${cleanupCount} files ready for cleanup`}
          >
            <FileWarning className="w-4 h-4" />
            Cleanup
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden overflow-x-auto relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Media</th>
              <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Status</th>
              <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-red-50/10 transition-all group">
                <td className="px-8 py-6">
                  <a 
                    href={item.media_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm transition-all hover:ring-4 hover:ring-blue-50"
                  >
                    {item.media_type === 'video' ? (
                      <video src={item.media_url} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <Image 
                        src={item.media_url} 
                        alt="Media Thumbnail"
                        fill
                        sizes="64px"
                        className="object-cover transition-transform group-hover:scale-105 duration-500" 
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </a>
                </td>
                
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-blue-600 transition-colors">
                       {item.media_type === 'video' ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm tracking-tight truncate max-w-[180px]" title={item.file_name || 'unknown'}>
                      {item.file_name || 'Unnamed Asset'}
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold text-gray-400 mt-2 flex items-center gap-3 uppercase tracking-wider">
                    <span>{formatBytes(item.file_size)}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </td>

                <td className="px-8 py-6">
                  <div className="font-semibold text-gray-900 text-sm tracking-tight mb-1 flex items-center gap-2">
                     {item.clients?.company_name}
                  </div>
                  <div className="flex items-center text-[10px] font-medium text-gray-400">
                    <User className="w-3 h-3 mr-1.5 opacity-40" />
                    {item.profiles?.full_name || 'Member'}
                  </div>
                </td>

                <td className="px-8 py-6">
                  <AiStatusBadge status={item.ai_status || 'pending'} />
                </td>

                <td className="px-8 py-6">
                  <AdminStatusBadge status={item.status} />
                </td>

                <td className="px-8 py-6 text-right">
                  {item.status === 'pending_admin' ? (
                    <div className="flex justify-end gap-2.5">
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={loadingId === item.id}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Reject Media"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={loadingId === item.id}
                        className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all shadow-sm active:scale-95 flex items-center"
                        title="Approve Media"
                      >
                        {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end pr-3">
                       <ShieldCheck className="w-5 h-5 text-emerald-500 opacity-30" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-gray-50/20">
            <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 border border-gray-100 relative group">
               <Clock className="w-8 h-8 text-gray-200 relative z-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Queue is empty</h2>
            <p className="text-sm font-medium text-gray-400 mt-2 max-w-sm mx-auto text-center">
               All media items have been processed. Awaiting new uploads from clients or team members.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

function AiStatusBadge({ status }: { status: string }) {
  const map: any = {
    pending: { bg: 'bg-gray-50', text: 'text-gray-500', icon: Clock },
    processing: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Loader2 },
    done: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Sparkles },
    failed: { bg: 'bg-red-50', text: 'text-red-700', icon: FileWarning }
  }
  const config = map[status] || map.pending
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-gray-100/10 ${config.bg} ${config.text} transition-all`}>
      <Icon className={`w-3 h-3 mr-1.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {status}
    </div>
  )
}

function AdminStatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending_admin: 'bg-amber-50 text-amber-700 border-amber-100',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
    approved: 'bg-blue-50 text-blue-700 border-blue-100'
  }

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${styles[status]}`}>
      {status === 'pending_admin' ? 'Pending Approval' : status.replace('_', ' ')}
    </span>
  )
}
