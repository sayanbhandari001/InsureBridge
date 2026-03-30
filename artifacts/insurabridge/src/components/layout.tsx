import React, { useState } from "react"
import { Link, useLocation } from "wouter"
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Phone, 
  FolderOpen, 
  Receipt, 
  Star, 
  Users,
  Bell,
  Search,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Claims", href: "/claims", icon: FileText },
  { name: "Communication", href: "/chat", icon: MessageSquare },
  { name: "Call Logs", href: "/calls", icon: Phone },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Bills", href: "/bills", icon: Receipt },
  { name: "Feedback", href: "/feedback", icon: Star },
  { name: "Users", href: "/users", icon: Users },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-slate-50/50">
      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex-col bg-white border-r border-slate-200 transition-transform duration-300 lg:static lg:flex lg:translate-x-0 shadow-lg shadow-slate-200/50 lg:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-inner">
              <span className="text-white text-lg leading-none">I</span>
            </div>
            InsuraBridge
          </div>
          <button className="ml-auto lg:hidden text-slate-500" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto py-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-slate-400")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/50 cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@insurabridge.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-600 p-2 rounded-md hover:bg-slate-100"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search claims, users, or bills..." 
                className="h-9 w-64 lg:w-96 pl-10 pr-4 text-sm rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-white"></span>
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
