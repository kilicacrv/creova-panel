'use client'

import { useState } from 'react'
import { 
  CheckCircle2, XCircle, Clock, Copy, Download, Trash2, 
  ExternalLink, MessageSquare, AlertCircle, Loader2, Sparkles,
  Film, Image as ImageIcon, Search, Calendar, User, FileWarning
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search client..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['all', 'pending_admin', 'ready', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                ${filter === s ? 'bg-[#1A56DB] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
              `}
            >
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>
          <button
            onClick={handleCleanup}
            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center gap-2 transition-all border border-transparent hover:border-gray-200"
            title={`${cleanupCount} files (${formatBytes(cleanupSize)}) ready for cleanup`}
          >
            <FileWarning className="w-4 h-4 text-orange-400" />
            Cleanup (&gt;7d)
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4 w-24">Media</th>
              <th className="p-4">File Info</th>
              <th className="p-4">Client & Editor</th>
              <th className="p-4">AI Captioning</th>
              <th className="p-4">Admin Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-4">
                  <a href={item.media_url} target="_blank" rel="noopener noreferrer" className="block relative w-16 h-16 rounded-lg overflow-hidden bg-black shadow-sm group-hover:ring-2 ring-[#1A56DB] transition-all">
                    {item.media_type === 'video' ? (
                      <video src={item.media_url} className="w-full h-full object-cover opacity-80" muted playsInline />
                ) : (
                  <Image 
                    src={item.media_url} 
                    alt="Media Thumbnail"
                    fill
                    sizes="(max-width: 768px) 100vw, 128px"
                    className="object-cover opacity-90" 
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </span>
                  </a>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {item.media_type === 'video' ? <Film className="w-4 h-4 text-gray-400" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                    <span className="font-semibold text-gray-900 text-sm truncate max-w-[150px]" title={item.file_name || 'unknown'}>
                      {item.file_name || 'Uploaded File'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    {formatBytes(item.file_size)}
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </td>

                <td className="p-4">
                  <div className="font-medium text-gray-900 text-sm mb-1">{item.clients?.company_name}</div>
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    {item.profiles?.full_name || 'Unknown Editor'}
                  </div>
                </td>

                <td className="p-4">
                  <AiStatusBadge status={item.ai_status || 'pending'} />
                </td>

                <td className="p-4">
                  <AdminStatusBadge status={item.status} />
                </td>

                <td className="p-4 text-right">
                  {item.status === 'pending_admin' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={loadingId === item.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={loadingId === item.id}
                        className="p-2 text-white bg-[#1A56DB] hover:bg-[#1e4eb8] rounded-lg shadow-sm transition-colors"
                        title="Approve & Run AI"
                      >
                        {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-gray-50/30">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900">No uploads yet</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Your media queue is empty. Invite your editors to start uploading files to review them here.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

function AiStatusBadge({ status }: { status: string }) {
  const map: any = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
    processing: { bg: 'bg-blue-100', text: 'text-[#1A56DB]', icon: Loader2 },
    done: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Sparkles },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle }
  }
  const config = map[status] || map.pending
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className={`w-3 h-3 mr-1 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
}

function AdminStatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending_admin: 'bg-amber-100 text-amber-700 border-amber-200',
    ready: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200'
  }

  return (
    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
