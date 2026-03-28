'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Film,
  Users, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  FileSignature, 
  UsersRound, 
  CalendarDays, 
  Megaphone, 
  Ear, 
  Bot, 
  Timer,
  Menu,
  X,
  LogOut,
  Settings,
  Eye,
  Bell,
  Check,
  MessageSquare,
  Zap,
  ShieldCheck,
  Target
} from 'lucide-react'
import { markNotificationAsRead } from '@/app/admin/notification-actions'

type Notification = {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

const navGroups = [
  {
    label: 'Operations',
    allowedRoles: ['admin', 'team'],
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Projects', href: '/admin/projects', icon: Briefcase },
      { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
      { name: 'Time Tracking', href: '/admin/time', icon: Timer },
    ]
  },
  {
    label: 'Clients & Media',
    allowedRoles: ['admin', 'team'],
    items: [
      { name: 'Clients', href: '/admin/clients', icon: Users },
      { name: 'Media Queue', href: '/admin/media', icon: Film },
      { name: 'Content Grid', href: '/admin/content', icon: CalendarDays },
    ]
  },
  {
    label: 'Finance',
    allowedRoles: ['admin'],
    items: [
      { name: 'Billing Ledger', href: '/admin/invoices', icon: FileText },
      { name: 'Proposals', href: '/admin/proposals', icon: FileSignature },
    ]
  },
  {
    label: 'Intelligence',
    allowedRoles: ['admin'],
    items: [
      { name: 'Ad Logistics', href: '/admin/campaigns', icon: Megaphone },
      { name: 'Social Frequency', href: '/admin/listening', icon: Ear },
    ]
  },
  {
    label: 'Command Hub',
    allowedRoles: ['admin'], 
    items: [
      { name: 'Personnel', href: '/admin/team', icon: UsersRound },
      { name: 'Access Matrix', href: '/admin/management', icon: Settings },
      { name: 'Neural Link', href: '/admin/ai', icon: Bot },
      { name: 'Terminal Chat', href: '/admin/messages', icon: MessageSquare },
      { name: 'Remote Watch', href: '/admin/watch', icon: Eye },
    ]
  }
]

export default function AdminLayout({
  children,
  userEmail,
  userName,
  userRole,
  initialNotifications = []
}: {
  children: React.ReactNode
  userEmail: string
  userName: string
  userRole?: string
  initialNotifications?: Notification[]
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const pathname = usePathname()

  const safeRole = userRole || 'admin'
  const unreadCount = notifications.filter(n => !n.is_read).length

  async function handleMarkAsRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await markNotificationAsRead(id)
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans antialiased text-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo area */}
        <div className="h-24 flex items-center px-8 shrink-0 relative">
          <Link href="/admin" className="block group">
            <img src="/brand/logo.png" alt="Creova Media" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute top-1/2 -right-4 w-12 h-12 bg-red-50 rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition-opacity"></div>
          </Link>
        </div>

        {/* Navigation Grouped */}
        <nav className="flex-1 overflow-y-auto pt-4 pb-12 px-6 space-y-10 custom-scrollbar">
          {navGroups.map((group) => {
            if (!group.allowedRoles.includes(safeRole)) return null

            return (
              <div key={group.label} className="space-y-4">
                <h3 className="px-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-2 italic">
                  {group.label}
                </h3>
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const isExactAdmin = item.href === '/admin' && pathname !== '/admin'
                    const reallyActive = isExactAdmin ? false : isActive

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          flex items-center px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group/nav
                          ${reallyActive 
                            ? 'bg-black text-white shadow-2xl shadow-black/10 translate-x-1' 
                            : 'text-gray-500 hover:text-black hover:bg-gray-50'}
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className={`w-4 h-4 mr-4 shrink-0 transition-transform group-hover/nav:scale-110 ${reallyActive ? 'text-brand-red' : 'text-gray-300 group-hover/nav:text-black'}`} />
                        {item.name}
                        {reallyActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse"></div>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-6 border-t border-gray-50 shrink-0 bg-gray-50/30">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black text-gray-900 truncate uppercase tracking-tight">{userName}</span>
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <span className="text-[8px] font-black text-gray-400 truncate uppercase tracking-widest opacity-60">ADMIN_NODE_01</span>
            </div>
            <form action="/auth/logout" method="POST">
              <button 
                type="submit"
                className="p-2.5 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all active:scale-90"
                title="Terminate Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Global Topbar Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 shrink-0 z-30 sticky top-0">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 -ml-2 mr-4 text-gray-500 hover:text-black hover:bg-gray-50 rounded-2xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center">
              <img src="/brand/logo.png" alt="Creova" className="h-8 w-auto object-contain" />
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
             <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-brand-red" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Core Access Verified</span>
             </div>
             <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 flex items-center gap-3">
               <CalendarDays className="w-4 h-4 opacity-50" />
               {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-3 rounded-2xl transition-all relative group ${notificationsOpen ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
              >
                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-red ring-4 ring-white rounded-full animate-pulse group-hover:animate-none"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-5 w-96 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="font-black text-gray-900 text-[11px] uppercase tracking-widest italic flex items-center">
                      <Zap className="w-4 h-4 mr-3 text-brand-red" />
                      Tactical Alerts
                    </h3>
                    <span className="text-[9px] font-black text-white bg-black px-3 py-1.5 rounded-xl uppercase tracking-widest">{unreadCount} Pending</span>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-20 text-center flex flex-col items-center opacity-20">
                        <Target className="w-12 h-12 mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Intel Logs</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                           <div key={n.id} className={`p-8 transition-all hover:bg-red-50/20 group/note ${!n.is_read ? 'bg-red-50/5' : ''}`}>
                              <div className="flex gap-6">
                                 <div className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 transition-transform group-hover/note:scale-150 ${!n.is_read ? 'bg-brand-red shadow-lg shadow-red-500' : 'bg-gray-200'}`} />
                                 <div className="flex-1 min-w-0">
                                    <p className={`text-[11px] tracking-tight uppercase leading-snug ${!n.is_read ? 'font-black text-gray-900' : 'font-bold text-gray-500 line-through opacity-40'}`}>
                                      {n.title}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-2 font-medium leading-relaxed">{n.message}</p>
                                    <div className="flex items-center mt-6 justify-between">
                                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center">
                                        <Clock className="w-3 h-3 mr-2 opacity-50" />
                                        {new Date(n.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {!n.is_read && (
                                        <button 
                                          onClick={() => handleMarkAsRead(n.id)}
                                          className="text-[9px] font-black text-brand-red hover:text-black uppercase tracking-widest transition-all flex items-center bg-white px-4 py-2 rounded-xl border border-red-50 shadow-sm hover:shadow-md"
                                        >
                                          <Check className="w-3.5 h-3.5 mr-2" /> Mark Done
                                        </button>
                                      )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-gray-50/80 text-center">
                     <button className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-black transition-colors italic">Clear Grid Archive</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="hidden lg:block w-px h-8 bg-gray-100 mx-2"></div>
            
            <div className="hidden lg:flex items-center gap-4 group cursor-pointer">
               <div className="text-right">
                  <div className="text-[10px] font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-red transition-colors">{userName}</div>
                  <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{safeRole} HUB</div>
               </div>
               <div className="w-11 h-11 rounded-2xl bg-black text-white font-black flex items-center justify-center text-sm shadow-2xl shadow-black/10 transition-transform group-hover:rotate-6 group-hover:bg-brand-red">
                 {userName.charAt(0).toUpperCase()}
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 lg:py-14 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
