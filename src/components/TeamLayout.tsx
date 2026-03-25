'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  LayoutDashboard, 
  CheckSquare, 
  Timer,
  Menu, 
  X,
  LogOut,
  Settings,
  Sparkles,
  Film
} from 'lucide-react'

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/team', icon: LayoutDashboard },
    { name: 'Media Production', href: '/team/media', icon: Film },
    { name: 'My Tasks', href: '/team/tasks', icon: CheckSquare },
    { name: 'Log Time', href: '/team/time', icon: Timer },
    { name: 'AI Assistant', href: '/admin/ai', icon: Sparkles },
  ]

  const isActive = (path: string) => {
    if (path === '/team' && pathname !== '/team') return false
    return pathname?.startsWith(path)
  }

  const handleLogout = async () => {
    window.location.href = '/auth/logout'
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Mobile Menu Button - Fixed Top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center text-[#1A56DB] font-bold text-xl">
          <Users className="w-6 h-6 mr-2" />
          Team Panel
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-transform duration-300 w-64
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shrink-0 flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center text-[#1A56DB] font-bold text-xl">
            <Users className="w-6 h-6 mr-2" />
            Team Panel
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group
                    ${active 
                      ? 'bg-blue-50 text-[#1A56DB]' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon className={`w-5 h-5 mr-3 shrink-0 ${active ? 'text-[#1A56DB]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom Area (Settings & Logout) */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors group"
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0 text-gray-400 group-hover:text-red-600" />
            Logout Securely
          </button>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
