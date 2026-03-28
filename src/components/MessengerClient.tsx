'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Send, Search, UserCircle, CheckCircle2, MessageSquare, Users as UsersIcon, Plus, X, Hash, Zap, ShieldCheck } from 'lucide-react'

// Types
type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string | null
}

type Group = {
  id: string
  name: string
  created_by: string
  created_at: string
}

type Message = {
  id: string
  sender_id: string
  receiver_id?: string | null
  group_id?: string | null
  content: string
  is_read: boolean
  created_at: string
}

// Union type to strictly type our active selection
type ActiveChat = 
  | { type: 'direct', contact: Profile }
  | { type: 'group', group: Group }

export default function MessengerClient({ 
  currentUser, 
  profiles 
}: { 
  currentUser: any, 
  profiles: Profile[] 
}) {
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  
  // Modal State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const contacts = profiles.filter(p => p.id !== currentUser.id)
  const filteredContacts = contacts.filter(c => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredGroups = groups.filter(g => 
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 1. Fetch Groups for the current user
  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase
        .from('chat_groups')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setGroups(data as Group[])
      }
    }
    fetchGroups()
  }, [supabase, currentUser.id])

  // 2. Fetch Messages when Active Chat changes
  useEffect(() => {
    if (!activeChat) return

    let isMounted = true
    setIsLoadingMessages(true)
    setMessages([])

    async function fetchMessages() {
      let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: true })

      if (activeChat?.type === 'direct') {
        const contactId = activeChat.contact.id
        query = query
          .is('group_id', null)
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${currentUser.id})`)
      } else if (activeChat?.type === 'group') {
        query = query.eq('group_id', activeChat.group.id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching messages:', error)
      } else if (isMounted && data) {
        setMessages(data as Message[])
        setTimeout(scrollToBottom, 50)
        
        // Mark unread direct messages as read
        if (activeChat?.type === 'direct') {
          const unreadIds = data.filter(m => !m.is_read && m.receiver_id === currentUser.id).map(m => m.id)
          if (unreadIds.length > 0) {
            await supabase.from('chat_messages').update({ is_read: true }).in('id', unreadIds)
          }
        }
      }
      if (isMounted) setIsLoadingMessages(false)
    }

    fetchMessages()
    return () => { isMounted = false }
  }, [activeChat, currentUser.id, supabase])

  // 3. Global Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('chat_realtime_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as Message
          
          if (!activeChat) return

          let isRelevant = false
          if (activeChat.type === 'direct' && !newMsg.group_id) {
            isRelevant = 
              (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeChat.contact.id) ||
              (newMsg.sender_id === activeChat.contact.id && newMsg.receiver_id === currentUser.id)
          } else if (activeChat.type === 'group' && newMsg.group_id === activeChat.group.id) {
            isRelevant = true
          }

          if (isRelevant) {
            // Check if we already have it (from optimistic UI)
            setMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            setTimeout(scrollToBottom, 50)
            
            // Auto mark read if direct
            if (activeChat.type === 'direct' && newMsg.receiver_id === currentUser.id) {
               supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id)
            }
          }
        }
      )
      // Listen for new groups added
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_groups' },
        (payload) => {
           const newGrp = payload.new as Group
           setGroups(prev => [newGrp, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChat, currentUser.id, supabase])

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    const tempId = crypto.randomUUID()
    const tempMessage: Message = {
      id: tempId,
      sender_id: currentUser.id,
      content: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
      ...(activeChat.type === 'direct' ? { receiver_id: activeChat.contact.id, group_id: null } : { receiver_id: null, group_id: activeChat.group.id })
    }
    
    // Optimistic Update
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')
    setTimeout(scrollToBottom, 50)

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        id: tempId,
        sender_id: currentUser.id,
        content: tempMessage.content,
        receiver_id: tempMessage.receiver_id,
        group_id: tempMessage.group_id
      })

    if (error) console.error('Failed to send message:', error)
  }

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || selectedGroupMembers.length === 0) {
      alert("Please enter a group name and select at least one member.")
      return
    }

    setIsCreatingGroup(true)
    const groupId = crypto.randomUUID()
    
    try {
      // 1. Create Group
      const { error: groupErr } = await supabase.from('chat_groups').insert({
        id: groupId,
        name: newGroupName.trim(),
        created_by: currentUser.id
      })
      if (groupErr) throw groupErr

      // 2. Add Members (including self)
      const membersToInsert = [...selectedGroupMembers, currentUser.id].map(id => ({
        group_id: groupId,
        user_id: id
      }))

      const { error: membersErr } = await supabase.from('chat_group_members').insert(membersToInsert)
      if (membersErr) throw membersErr

      // Add artificially to local state briefly, subscription will catch it too
      const newGroupObj: Group = { id: groupId, name: newGroupName.trim(), created_by: currentUser.id, created_at: new Date().toISOString() }
      if (!groups.find(g => g.id === groupId)) setGroups([newGroupObj, ...groups])
      
      setIsGroupModalOpen(false)
      setNewGroupName('')
      setSelectedGroupMembers([])
      setActiveChat({ type: 'group', group: newGroupObj })
    } catch (err: any) {
      console.error(err)
      alert("Failed to create group. " + err.message)
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getProfileName = (id: string) => {
    if (id === currentUser.id) return 'You'
    const p = profiles.find(pr => pr.id === id)
    return p ? p.full_name : 'Unknown User'
  }
  const getProfileAvatar = (id: string) => {
    const p = profiles.find(pr => pr.id === id)
    return p?.avatar_url
  }

  return (
    <div className="flex w-full h-full bg-white lg:rounded-xl overflow-hidden shadow-2xl relative border border-gray-100">
      
      {/* ---------------- SIDEBAR ---------------- */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[360px] lg:w-[360px] border-r border-gray-50 bg-gray-50/50 shrink-0 relative z-20`}>
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-white">
           <div className="flex items-center justify-between mb-6">
             <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center tracking-tight font-bold">
                  Messenger
                </h2>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-normal mt-1">Encrypted Secure Line</p>
             </div>
             <button 
               onClick={() => setIsGroupModalOpen(true)}
               title="Initialize New Channel"
               className="p-3 bg-red-50 text-blue-600 hover:bg-black hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"
             >
               <Plus className="w-5 h-5" />
             </button>
           </div>
           
           <div className="relative group">
             <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
             <input 
               type="text" 
               placeholder="SEARCH FREQUENCIES..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-[10px] font-semibold text-sm focus:ring-4 focus:ring-red-50 focus:bg-white focus:border-red-100 transition-all outline-none placeholder:text-gray-300"
             />
           </div>
        </div>

        {/* Channels & Directs Lists */}
        <div className="flex-1 overflow-y-auto w-full pb-8">
          
          {/* Channels (Groups) */}
          {(filteredGroups.length > 0 || searchQuery !== '') && (
            <div className="mt-8 px-4 space-y-1">
               <h3 className="px-4 text-[9px] font-bold text-gray-300 uppercase tracking-[0.25em] mb-4 italic">Active Channels</h3>
               {filteredGroups.map(group => (
                  <button 
                    key={group.id}
                    onClick={() => setActiveChat({ type: 'group', group })}
                    className={`w-full px-4 py-4 flex items-center gap-4 transition-all rounded-[1.5rem]
                      hover:bg-white hover:shadow-xl hover:shadow-gray-100 text-left group/item
                      ${(activeChat?.type === 'group' && activeChat.group.id === group.id) ? 'bg-white shadow-xl shadow-red-50 ring-1 ring-red-100' : ''}
                    `}
                  >
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${(activeChat?.type === 'group' && activeChat.group.id === group.id) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 group-hover/item:bg-red-50 group-hover/item:text-blue-600'}`}>
                       <Hash className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-[11px] uppercase tracking-tight truncate">{group.name}</div>
                        <div className="text-[9px] text-gray-400 uppercase font-bold tracking-normal mt-0.5 opacity-60">Multiplex Link</div>
                     </div>
                  </button>
               ))}
            </div>
          )}

          {/* Direct Messages */}
          <div className="mt-8 px-4 space-y-1">
             <h3 className="px-4 text-[9px] font-bold text-gray-300 uppercase tracking-[0.25em] mb-4 italic">Personal Uplinks</h3>
             {filteredContacts.map(contact => (
                <button 
                  key={contact.id}
                  onClick={() => setActiveChat({ type: 'direct', contact })}
                  className={`w-full px-4 py-4 flex items-center gap-4 transition-all rounded-[1.5rem]
                    hover:bg-white hover:shadow-xl hover:shadow-gray-100 text-left group/item
                    ${(activeChat?.type === 'direct' && activeChat.contact.id === contact.id) ? 'bg-white shadow-xl shadow-red-50 ring-1 ring-red-100' : ''}
                  `}
                >
                   <div className="relative">
                     {contact.avatar_url ? (
                       <img src={contact.avatar_url} alt={contact.full_name} className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-sm" />
                     ) : (
                       <div className="w-10 h-10 rounded-2xl text-white bg-black flex items-center justify-center shrink-0 text-xs font-bold uppercase group-hover/item:bg-blue-600 transition-colors">
                         {contact.full_name.charAt(0)}
                       </div>
                     )}
                     <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-[11px] uppercase tracking-tight truncate">{contact.full_name}</div>
                      <div className="text-[9px] text-gray-400 uppercase font-bold tracking-normal mt-0.5 truncate opacity-60">{contact.role}</div>
                   </div>
                </button>
             ))}
          </div>

        </div>
      </div>

      {/* ---------------- MAIN CHAT AREA ---------------- */}
      {activeChat ? (
        <div className="flex-1 flex flex-col w-full h-full bg-white relative z-10 transition-all animate-in fade-in slide-in-from-right-4 duration-500">
          
          {/* Header */}
          <div className="px-10 py-6 border-b border-gray-50 bg-white/90 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between">
             <div className="flex items-center">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="mr-5 md:hidden p-3 -ml-3 text-gray-400 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <svg className="w-6 h-6 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
                </button>
                
                {activeChat.type === 'direct' ? (
                    <div className="flex items-center gap-5">
                      {activeChat.contact.avatar_url ? (
                        <img src={activeChat.contact.avatar_url} alt={activeChat.contact.full_name} className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-lg shadow-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl text-white bg-black flex items-center justify-center shrink-0 text-sm font-bold uppercase border-2 border-gray-50">
                          {activeChat.contact.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                          <h2 className="font-bold text-gray-900 uppercase tracking-tight text-lg">{activeChat.contact.full_name}</h2>
                          <div className="flex items-center gap-1.5 mt-0.5">
                             <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                             <p className="text-[9px] text-blue-600 font-semibold text-sm">Live Presence Active</p>
                          </div>
                      </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-lg shadow-gray-200 rotate-3 group-hover:rotate-0 transition-transform">
                        <Hash className="w-6 h-6" />
                      </div>
                      <div>
                          <h2 className="font-bold text-gray-900 uppercase tracking-tight text-lg">{activeChat.group.name}</h2>
                          <p className="text-[10px] text-gray-400 font-semibold text-sm mt-0.5">Multiplex Broadcast Channel</p>
                      </div>
                    </div>
                )}
             </div>

             <div className="hidden lg:flex items-center gap-3">
                <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span className="text-[9px] font-semibold text-sm text-gray-400 italic">E2EE Protocol Active</span>
                </div>
             </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-gray-50/30 min-h-0 relative">
             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none"></div>
             
             {isLoadingMessages ? (
               <div className="flex flex-col items-center justify-center h-full text-gray-400 relative z-10">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4 shadow-xl shadow-blue-100"></div>
                  <p className="text-[10px] font-bold uppercase tracking-wider animate-pulse">Syncing AI Assistant...</p>
               </div>
             ) : messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-gray-400 relative z-10">
                  <div className="w-24 h-24 bg-white rounded-xl shadow-2xl flex items-center justify-center mb-8 border border-gray-50">
                    <MessageSquare className="w-10 h-10 text-blue-600 opacity-20" />
                  </div>
                  <p className="font-bold text-gray-900 uppercase tracking-normal text-sm italic">Transmission Silent</p>
                  <p className="text-[10px] font-semibold text-sm mt-3">Ready for ingestion.</p>
               </div>
             ) : (
               <div className="relative z-10 space-y-8">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender_id === currentUser.id
                  const showHeader = activeChat.type === 'group' && !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id)
                  
                  return (
                    <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                       {!isMe && activeChat.type === 'group' && showHeader ? (
                          <div className="mr-4 shrink-0 mt-6">
                             {getProfileAvatar(msg.sender_id) ? (
                               <img src={getProfileAvatar(msg.sender_id)!} alt="" className="w-8 h-8 rounded-xl object-cover shadow-md" />
                             ) : (
                               <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase border border-gray-800">
                                 {getProfileName(msg.sender_id).charAt(0)}
                               </div>
                             )}
                          </div>
                       ) : (
                          !isMe && activeChat.type === 'group' && <div className="w-8 mr-4 shrink-0"></div>
                       )}

                       <div className={`max-w-[85%] lg:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {showHeader && (
                           <span className="text-[9px] font-bold text-gray-400 ml-2 mb-2 uppercase tracking-normal">{getProfileName(msg.sender_id)}</span>
                        )}
                        <div 
                          className={`
                            px-6 py-4 text-sm font-medium rounded-[1.8rem] leading-relaxed relative group/msg
                            ${isMe 
                              ? 'bg-black text-white rounded-br-none shadow-2xl shadow-gray-200 selection:bg-blue-600' 
                              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-xl shadow-gray-50'}
                          `}
                        >
                          {msg.content}
                          <div className={`absolute top-0 ${isMe ? 'right-0' : 'left-0'} w-2 h-2 bg-blue-600 opacity-0 group-hover/msg:opacity-100 transition-opacity rounded-full -m-1`}></div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 px-2">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight opacity-60">{formatTime(msg.created_at)}</span>
                          {isMe && msg.is_read && activeChat.type === 'direct' && <Zap className="w-3 h-3 text-blue-600 fill-current opacity-80" />}
                        </div>
                       </div>
                    </div>
                  )
                })}
               </div>
             )}
             <div ref={messagesEndRef} className="h-1 pb-2" />
          </div>

          {/* Message Input Bottom Bar */}
          <div className="p-8 bg-white border-t border-gray-50 pb-safe">
             <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-5xl mx-auto relative group">
               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors pointer-events-none z-10">
                  <Zap className="w-5 h-5" />
               </div>
               <input 
                 type="text"
                 placeholder={activeChat.type === 'group' ? `INJECT COMMAND TO #${activeChat.group.name.toUpperCase()}...` : "TRANSMIT DIRECT PAYLOAD..."}
                 value={newMessage}
                 onChange={e => setNewMessage(e.target.value)}
                 className="flex-1 pl-16 pr-20 py-5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-semibold text-sm focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 transition-all outline-none"
               />
               <button 
                 type="submit"
                 disabled={!newMessage.trim()}
                 className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-black hover:bg-blue-600 text-white rounded-2xl disabled:opacity-10 disabled:grayscale transition-all shadow-xl hover:shadow-blue-200 active:scale-90"
               >
                 <Send className="w-5 h-5" />
               </button>
             </form>
             <div className="text-center mt-4">
                <p className="text-[8px] font-bold text-gray-200 uppercase tracking-[0.5em]">Command line Interface v4.0.2 - Terminal Secured</p>
             </div>
          </div>
          
        </div>
      ) : (
        /* Empty State */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-white text-center p-10 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(#f1f1f1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
           <div className="relative z-10 scale-in-center">
              <div className="w-40 h-40 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-50 rounded-xl flex items-center justify-center mb-10 mx-auto relative group">
                 <div className="absolute inset-0 bg-red-50 rounded-xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                 <MessageSquare className="w-16 h-16 text-blue-600 relative z-10" />
                 <div className="absolute -top-4 -right-4 w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold italic shadow-xl rotate-12">HQ</div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight font-bold">Strategic Comms</h3>
              <p className="text-gray-400 max-w-md font-semibold text-sm text-[10px] leading-relaxed mx-auto">
                 Initialize an uplink by selecting a designated frequency from the deployment matrix on the left.
              </p>
              
              <div className="mt-12 flex justify-center gap-8 opacity-20 filter grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-1 bg-gray-200 rounded-full" />
                     <span className="text-[8px] font-semibold text-sm">Latency: 12ms</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-1 bg-blue-600 rounded-full" />
                     <span className="text-[8px] font-semibold text-sm">Buffer: Clean</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-1 bg-gray-200 rounded-full" />
                     <span className="text-[8px] font-semibold text-sm">Packets: 100%</span>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* ---------------- CREATE GROUP MODAL ---------------- */}
      {isGroupModalOpen && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500">
             
             <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50">
               <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center uppercase tracking-tight italic">
                    <UsersIcon className="w-6 h-6 mr-3 text-blue-600" /> Channel Deployment
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-normal mt-1 ml-9">Unified Broadcast Network</p>
               </div>
               <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:bg-red-50 hover:text-blue-600 p-3 rounded-2xl transition-all">
                 <X className="w-6 h-6" />
               </button>
             </div>
             
             <form onSubmit={handleCreateGroup} className="p-10 lg:p-14 space-y-10">
               <div className="space-y-3">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-normal ml-1">Channel Designation</label>
                 <input 
                   type="text" 
                   required
                   value={newGroupName}
                   onChange={e => setNewGroupName(e.target.value)}
                   placeholder="E.G. STRATEGIC OPERATIONS"
                   className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-bold text-xs uppercase tracking-normal transition-all placeholder:text-gray-200"
                 />
               </div>

               <div className="space-y-3">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-normal ml-1 flex justify-between">
                   <span>Recruit Team</span>
                   <span className="text-blue-600">{selectedGroupMembers.length} Selected</span>
                 </label>
                 <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 custom-scrollbar bg-gray-50/50">
                   {contacts.map(c => (
                     <label key={c.id} className="flex items-center px-6 py-4 hover:bg-white cursor-pointer transition-all group/member">
                       <input 
                         type="checkbox"
                         checked={selectedGroupMembers.includes(c.id)}
                         onChange={(e) => {
                           if (e.target.checked) setSelectedGroupMembers(prev => [...prev, c.id])
                           else setSelectedGroupMembers(prev => prev.filter(id => id !== c.id))
                         }}
                         className="w-5 h-5 text-black rounded-lg border-gray-200 focus:ring-black mr-5 transition-all"
                       />
                       <div className="flex-1 min-w-0">
                         <div className="font-bold text-[11px] uppercase tracking-tight text-gray-900 truncate group-hover/member:text-blue-600 transition-colors">{c.full_name}</div>
                         <div className="text-[9px] text-gray-400 uppercase font-bold tracking-normal mt-0.5">{c.role}</div>
                       </div>
                     </label>
                   ))}
                   {contacts.length === 0 && (
                     <div className="p-10 text-center text-[10px] font-semibold text-sm text-gray-300 italic">No compatible personnel detected.</div>
                   )}
                 </div>
               </div>

               <button 
                 type="submit"
                 disabled={isCreatingGroup || !newGroupName.trim() || selectedGroupMembers.length === 0}
                 className="w-full py-6 bg-black hover:bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center disabled:opacity-20 disabled:grayscale transition-all shadow-2xl hover:shadow-blue-200 active:scale-95"
               >
                 {isCreatingGroup ? (
                   <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : 'Finalize Broadcast Infrastructure'}
               </button>
             </form>
           </div>
         </div>
      )}

    </div>
  )
}
