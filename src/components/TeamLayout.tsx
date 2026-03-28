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
  Film,
  MessageSquare,
  ShieldCheck,
  Globe,
  Zap,
  Clock
} from 'lucide-react'
import RemoteCheckInWidget from './RemoteCheckIn'

export default function TeamLayout({ children, profile }: { children: React.ReactNode, profile?: any }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/team', icon: LayoutDashboard },
    { name: 'Media Production', href: '/team/media', icon: Film },
    { name: 'Messages', href: '/team/messages', icon: MessageSquare },
    { name: 'Tasks', href: '/team/tasks', icon: CheckSquare },
    { name: 'Time Logs', href: '/team/time', icon: Timer },
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
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans antialiased text-gray-900">
      {/* Mobile Menu Button - Fixed Top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-6">
        <div className="flex items-center text-blue-600 font-bold text-[10px] uppercase tracking-wider gap-2">
          <img src="/brand/logo.png" alt="Creova" className="h-6 w-auto" />
          TEAM_PORTAL
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-100 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) w-72
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shrink-0 flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-gray-50 shrink-0">
          <Link href="/team" className="group">
            <img src="/brand/logo.png" alt="Creova" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10 custom-scrollbar">
          <div className="space-y-4">
            <h3 className="px-5 text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Workspace</h3>
            <div className="space-y-1.5">
               {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center px-5 py-3.5 rounded-lg text-sm font-medium transition-all group/nav
                      ${active 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                    `}
                  >
                    <item.icon className={`w-[18px] h-[18px] mr-4 shrink-0 transition-transform group-hover/nav:scale-110 ${active ? 'text-blue-600' : 'text-gray-300 group-hover/nav:text-black'}`} />
                    {item.name}
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Area (Remote Watch & Logout) */}
        <div className="p-6 border-t border-gray-50 shrink-0 bg-gray-50/30">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                   <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">System Active</span>
             </div>
             <p className="text-[10px] font-medium text-gray-400 leading-relaxed">Secure monitoring active for verification.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-5 py-3.5 text-[10px] font-semibold text-sm text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all group shadow-sm hover:shadow-xl"
          >
            <LogOut className="w-4 h-4 mr-3 shrink-0 text-gray-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-20 lg:pt-0 overflow-y-auto custom-scrollbar">
        <header className="h-16 flex items-center justify-between px-6 lg:px-12 shrink-0 border-b border-gray-100 bg-white">
           <div>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[15px] font-semibold text-gray-900">Team Dashboard</span>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-6">
              <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-3">
                 <Clock className="w-4 h-4 text-blue-600" />
                 <span className="text-xs font-medium text-gray-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EST</span>
              </div>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{profile?.full_name || 'Team Member'}</div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Online</div>
                  </div>
                 <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group hover:rotate-6 transition-transform">
                    {profile?.full_name?.charAt(0) || 'P'}
                 </div>
              </div>
           </div>
        </header>
        <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-12">
          <div className="mb-14">
            <RemoteCheckInWidget profile={profile} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
