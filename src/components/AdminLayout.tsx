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
  LogOut
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Media Production', href: '/admin/media', icon: Film },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Projects', href: '/admin/projects', icon: Briefcase },
  { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Proposals', href: '/admin/proposals', icon: FileSignature },
  { name: 'Team', href: '/admin/team', icon: UsersRound },
  { name: 'Content Calendar', href: '/admin/content', icon: CalendarDays },
  { name: 'Ad Campaigns', href: '/admin/campaigns', icon: Megaphone },
  { name: 'Social Listening', href: '/admin/listening', icon: Ear },
  { name: 'AI Assistant', href: '/admin/ai', icon: Bot },
  { name: 'Time Tracking', href: '/admin/time', icon: Timer },
]

export default function AdminLayout({
  children,
  userEmail,
  userName,
}: {
  children: React.ReactNode
  userEmail: string
  userName: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

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
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="w-8 h-8 rounded bg-[#1A56DB] flex items-center justify-center mr-3 shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="2,14 7,8 11,12 16,6 22,4"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Creova</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
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
                    ? 'bg-[#1A56DB]/10 text-[#1A56DB]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`w-5 h-5 mr-3 shrink-0 ${reallyActive ? 'text-[#1A56DB]' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">{userName}</span>
              <span className="text-xs text-gray-500 truncate">{userEmail}</span>
            </div>
            <form action="/auth/logout" method="POST">
              <button 
                type="submit"
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded bg-[#1A56DB] flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="2,14 7,8 11,12 16,6 22,4"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Creova M.</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
