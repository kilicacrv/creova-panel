'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Send, Search, UserCircle, CheckCircle2, MessageSquare, Users as UsersIcon, Plus, X, Hash } from 'lucide-react'

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
    <div className="flex w-full h-full bg-white lg:rounded-xl overflow-hidden shadow-sm border-r lg:border border-gray-200">
      
      {/* ---------------- SIDEBAR ---------------- */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[320px] lg:w-[320px] border-r border-gray-200 bg-gray-50/50 shrink-0`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-gray-900 flex items-center tracking-tight">
               <MessageSquare className="w-5 h-5 mr-2 text-[#1A56DB]" /> Messenger
             </h2>
             <button 
               onClick={() => setIsGroupModalOpen(true)}
               title="Create New Group"
               className="p-1.5 bg-blue-50 text-[#1A56DB] hover:bg-blue-100 rounded-lg transition-colors"
             >
               <Plus className="w-4 h-4" />
             </button>
           </div>
           
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1A56DB]/50 transition-shadow outline-none"
             />
           </div>
        </div>

        {/* Channels & Directs Lists */}
        <div className="flex-1 overflow-y-auto w-full pb-4">
          
          {/* Channels (Groups) */}
          {(filteredGroups.length > 0 || searchQuery !== '') && (
            <div className="mt-4">
               <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Channels</h3>
               {filteredGroups.map(group => (
                  <button 
                    key={group.id}
                    onClick={() => setActiveChat({ type: 'group', group })}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors
                      hover:bg-blue-50/50 text-left
                      ${(activeChat?.type === 'group' && activeChat.group.id === group.id) ? 'bg-blue-50 border-l-4 border-[#1A56DB]' : 'border-l-4 border-transparent'}
                    `}
                  >
                     <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                       <Hash className="w-4 h-4" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{group.name}</div>
                     </div>
                  </button>
               ))}
            </div>
          )}

          {/* Direct Messages */}
          <div className="mt-4">
             <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Direct Messages</h3>
             {filteredContacts.map(contact => (
                <button 
                  key={contact.id}
                  onClick={() => setActiveChat({ type: 'direct', contact })}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors
                    hover:bg-blue-50/50 text-left
                    ${(activeChat?.type === 'direct' && activeChat.contact.id === contact.id) ? 'bg-blue-50 border-l-4 border-[#1A56DB]' : 'border-l-4 border-transparent'}
                  `}
                >
                   <div className="relative">
                     {contact.avatar_url ? (
                       <img src={contact.avatar_url} alt={contact.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                     ) : (
                       <div className="w-8 h-8 rounded-full text-blue-700 bg-blue-100 flex items-center justify-center shrink-0 text-sm font-bold uppercase">
                         {contact.full_name.charAt(0)}
                       </div>
                     )}
                     <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{contact.full_name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest truncate">{contact.role}</div>
                   </div>
                </button>
             ))}
          </div>

        </div>
      </div>

      {/* ---------------- MAIN CHAT AREA ---------------- */}
      {activeChat ? (
        <div className="flex-1 flex flex-col w-full h-full bg-white relative">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center shadow-sm">
             <button 
               onClick={() => setActiveChat(null)}
               className="mr-3 md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
             </button>
             
             {activeChat.type === 'direct' ? (
                <div className="flex items-center gap-3">
                  {activeChat.contact.avatar_url ? (
                     <img src={activeChat.contact.avatar_url} alt={activeChat.contact.full_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                   ) : (
                     <div className="w-10 h-10 rounded-full text-blue-700 bg-blue-100 flex items-center justify-center shrink-0 text-sm font-bold uppercase">
                       {activeChat.contact.full_name.charAt(0)}
                     </div>
                   )}
                   <div>
                      <h2 className="font-bold text-gray-900 tracking-tight">{activeChat.contact.full_name}</h2>
                      <p className="text-xs text-green-600 font-medium">Online</p>
                   </div>
                </div>
             ) : (
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-inner">
                     <Hash className="w-5 h-5" />
                   </div>
                   <div>
                      <h2 className="font-bold text-gray-900 tracking-tight">{activeChat.group.name}</h2>
                      <p className="text-xs text-gray-500 font-medium">Group Channel</p>
                   </div>
                </div>
             )}
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#F9FAFB] min-h-0">
             {isLoadingMessages ? (
               <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="animate-spin w-8 h-8 border-4 border-[#1A56DB] border-t-transparent rounded-full mr-3"></div>
               </div>
             ) : messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="w-16 h-16 text-gray-200 mb-4" />
                  <p className="font-medium text-gray-500">No messages yet.</p>
                  <p className="text-xs mt-1">Start the conversation below.</p>
               </div>
             ) : (
               messages.map((msg, idx) => {
                 const isMe = msg.sender_id === currentUser.id
                 const showHeader = activeChat.type === 'group' && !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id)
                 
                 return (
                   <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && activeChat.type === 'group' && showHeader ? (
                         <div className="mr-2 shrink-0 mt-3.5">
                            {getProfileAvatar(msg.sender_id) ? (
                              <img src={getProfileAvatar(msg.sender_id)!} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                                {getProfileName(msg.sender_id).charAt(0)}
                              </div>
                            )}
                         </div>
                      ) : (
                         !isMe && activeChat.type === 'group' && <div className="w-6 mr-2 shrink-0"></div>
                      )}

                      <div className={`max-w-[80%] lg:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {showHeader && (
                           <span className="text-[10px] font-bold text-gray-500 ml-1 mb-0.5">{getProfileName(msg.sender_id)}</span>
                        )}
                        <div 
                          className={`
                            px-4 py-2.5 text-sm rounded-2xl shadow-sm leading-relaxed
                            ${isMe 
                              ? 'bg-[#1A56DB] text-white rounded-br-none' 
                              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}
                          `}
                        >
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-gray-400 font-medium">{formatTime(msg.created_at)}</span>
                          {isMe && msg.is_read && activeChat.type === 'direct' && <CheckCircle2 className="w-3 h-3 text-[#1A56DB]" />}
                        </div>
                      </div>
                   </div>
                 )
               })
             )}
             <div ref={messagesEndRef} className="h-1 pb-2" />
          </div>

          {/* Message Input Bottom Bar */}
          <div className="p-4 bg-white border-t border-gray-200 pb-safe">
             <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto relative">
               <input 
                 type="text"
                 placeholder={activeChat.type === 'group' ? `Message #${activeChat.group.name}...` : "Write a direct message..."}
                 value={newMessage}
                 onChange={e => setNewMessage(e.target.value)}
                 className="flex-1 px-5 py-3.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1A56DB] focus:bg-white transition-all outline-none pr-14"
               />
               <button 
                 type="submit"
                 disabled={!newMessage.trim()}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#1A56DB] hover:bg-[#1e4eb8] text-white rounded-lg disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm"
               >
                 <Send className="w-4 h-4 ml-0.5" />
               </button>
             </form>
          </div>
          
        </div>
      ) : (
        /* Empty State */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#F9FAFB] text-center p-8">
           <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-[#1A56DB]" />
           </div>
           <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Team Communications</h3>
           <p className="text-gray-500 max-w-md font-medium leading-relaxed">Select a Channel or a Direct Message from the sidebar to instantly start a secure, real-time conversation.</p>
        </div>
      )}

      {/* ---------------- CREATE GROUP MODAL ---------------- */}
      {isGroupModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
             
             <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
               <h3 className="font-bold text-gray-900 flex items-center">
                 <UsersIcon className="w-5 h-5 mr-2 text-[#1A56DB]" /> Create New Channel
               </h3>
               <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:bg-gray-200 p-1 rounded-md">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleCreateGroup} className="p-6">
               <div className="mb-5">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Channel Name</label>
                 <input 
                   type="text" 
                   required
                   value={newGroupName}
                   onChange={e => setNewGroupName(e.target.value)}
                   placeholder="e.g., Marketing Team"
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/50 text-sm font-semibold"
                 />
               </div>

               <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex justify-between">
                   <span>Add Members</span>
                   <span>{selectedGroupMembers.length} selected</span>
                 </label>
                 <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 custom-scrollbar">
                   {contacts.map(c => (
                     <label key={c.id} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                       <input 
                         type="checkbox"
                         checked={selectedGroupMembers.includes(c.id)}
                         onChange={(e) => {
                           if (e.target.checked) setSelectedGroupMembers(prev => [...prev, c.id])
                           else setSelectedGroupMembers(prev => prev.filter(id => id !== c.id))
                         }}
                         className="w-4 h-4 text-[#1A56DB] rounded border-gray-300 focus:ring-[#1A56DB] mr-3"
                       />
                       <div className="flex-1 min-w-0">
                         <div className="font-semibold text-sm text-gray-900 truncate">{c.full_name}</div>
                         <div className="text-[10px] text-gray-400 uppercase tracking-widest">{c.role}</div>
                       </div>
                     </label>
                   ))}
                   {contacts.length === 0 && (
                     <div className="p-4 text-center text-xs text-gray-500">No other team members available.</div>
                   )}
                 </div>
               </div>

               <button 
                 type="submit"
                 disabled={isCreatingGroup || !newGroupName.trim() || selectedGroupMembers.length === 0}
                 className="w-full py-3.5 bg-[#1A56DB] hover:bg-[#1e4eb8] text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm"
               >
                 {isCreatingGroup ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : 'Create Channel'}
               </button>
             </form>
           </div>
         </div>
      )}

    </div>
  )
}
