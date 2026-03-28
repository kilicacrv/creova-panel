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
  Clock
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
    allowedRoles: ['admin'], 
    items: [
      { name: 'Team', href: '/admin/team', icon: UsersRound },
      { name: 'Management', href: '/admin/management', icon: Settings },
      { name: 'AI Assistant', href: '/admin/ai', icon: Bot },
      { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
      { name: 'Remote Watch', href: '/admin/watch', icon: Eye },
    ]
  }
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

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
  const firstName = userName.split(' ')[0]

  async function handleMarkAsRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await markNotificationAsRead(id)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans antialiased text-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 shrink-0">
          <Link href="/admin" className="block">
            <img src="/brand/logo.png" alt="Creova Media" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {navGroups.map((group) => {
            if (!group.allowedRoles.includes(safeRole)) return null

            return (
              <div key={group.label} className="mb-6">
                <h3 className="px-3 mb-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  {group.label}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const isExactAdmin = item.href === '/admin' && pathname !== '/admin'
                    const reallyActive = isExactAdmin ? false : isActive

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
                          ${reallyActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className={`w-[18px] h-[18px] mr-3 shrink-0 ${reallyActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded capitalize">{safeRole}</span>
                </div>
              </div>
            </div>
            <form action="/auth/logout" method="POST">
              <button 
                type="submit"
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0">
          {/* Left: mobile menu + greeting */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Mobile logo */}
            <div className="lg:hidden">
              <img src="/brand/logo.png" alt="Creova" className="h-7 w-auto object-contain" />
            </div>

            {/* Desktop greeting */}
            <div className="hidden lg:block">
              <h1 className="text-[15px] font-semibold text-gray-900">
                {getGreeting()}, {firstName} 👋
              </h1>
            </div>
          </div>

          {/* Center: date */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-lg transition-colors relative ${notificationsOpen ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} new</span>
                    )}
                  </div>
                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-sm text-gray-400">No notifications</div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                          <div key={n.id} className={`px-4 py-3 transition-colors hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-blue-600' : 'bg-gray-200'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {timeAgo(n.created_at)}
                                  </span>
                                  {!n.is_read && (
                                    <button 
                                      onClick={() => handleMarkAsRead(n.id)}
                                      className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" /> Mark read
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
             
            {/* User avatar */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{userName}</div>
                <div className="text-xs text-gray-500 capitalize">{safeRole}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
