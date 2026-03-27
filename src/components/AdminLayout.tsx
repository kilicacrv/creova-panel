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
  MessageSquare
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
      { name: 'Media Production', href: '/admin/media', icon: Film },
      { name: 'Content Calendar', href: '/admin/content', icon: CalendarDays },
    ]
  },
  {
    label: 'Finance',
    allowedRoles: ['admin'],
    items: [
      { name: 'Invoices', href: '/admin/invoices', icon: FileText },
      { name: 'Proposals', href: '/admin/proposals', icon: FileSignature },
    ]
  },
  {
    label: 'Marketing',
    allowedRoles: ['admin'],
    items: [
      { name: 'Ad Campaigns', href: '/admin/campaigns', icon: Megaphone },
      { name: 'Social Listening', href: '/admin/listening', icon: Ear },
    ]
  },
  {
    label: 'Team & Settings',
    allowedRoles: ['admin'], // we kept team management hidden from regular editors
    items: [
      { name: 'Team', href: '/admin/team', icon: UsersRound },
      { name: 'Management', href: '/admin/management', icon: Settings },
      { name: 'Messenger', href: '/admin/messages', icon: MessageSquare },
      { name: 'AI Assistant', href: '/admin/ai', icon: Bot },
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center mr-3 shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="2,14 7,8 11,12 16,6 22,4"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Creova</span>
        </div>

        {/* Navigation Grouped */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) => {
            if (!group.allowedRoles.includes(safeRole)) return null

            return (
              <div key={group.label} className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {group.label}
                </h3>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const isExactAdmin = item.href === '/admin' && pathname !== '/admin'
                  const reallyActive = isExactAdmin ? false : isActive

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${reallyActive 
                          ? 'bg-[#2563EB]/10 text-[#2563EB]' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 mr-3 shrink-0 ${reallyActive ? 'text-[#2563EB]' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-gray-200 shrink-0 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-gray-900 truncate">{userName}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                  safeRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-[#2563EB]'
                }`}>
                  {safeRole}
                </span>
              </div>
              <span className="text-xs text-gray-500 truncate">{userEmail}</span>
            </div>
            <form action="/auth/logout" method="POST">
              <button 
                type="submit"
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Log out"
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 mr-3 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-bold text-gray-900 text-lg tracking-tight flex items-center">
              <div className="w-6 h-6 rounded bg-[#2563EB] flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="2,14 7,8 11,12 16,6 22,4"/>
                </svg>
              </div>
              Creova
            </div>
          </div>
          <div className="hidden lg:block">
             <div className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    <span className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">
                        You're all caught up!
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                           <div key={n.id} className={`p-4 transition-colors ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                              <div className="flex gap-3">
                                 <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                 <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                      {n.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                                    <div className="flex items-center mt-2 justify-between">
                                      <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                                      {!n.is_read && (
                                        <button 
                                          onClick={() => handleMarkAsRead(n.id)}
                                          className="text-xs font-medium text-[#2563EB] hover:text-blue-700 flex items-center"
                                        >
                                          <Check className="w-3 h-3 mr-1" /> Mark read
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
                </div>
              )}
            </div>
            
            <div className="hidden lg:block w-px h-6 bg-gray-200"></div>
            
            <div className="hidden lg:flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex flex-col items-center justify-center text-sm">
                 {userName.charAt(0).toUpperCase()}
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white/50">
          {children}
        </main>
      </div>
    </div>
  )
}
