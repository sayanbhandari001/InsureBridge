import React, { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { useAuth, ROLE_LABELS, ROLE_COLORS } from "@/lib/auth"
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, FileText, MessageSquare, Phone, FolderOpen,
  Receipt, Star, Users, Bell, Menu, X, CreditCard, MapPin,
  Search as SearchIcon, ArrowLeftRight, RefreshCw, UserPlus,
  Banknote, LogOut, ChevronDown, Check, ShieldCheck
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles?: string[]
  group?: string
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Claims", href: "/claims", icon: FileText },
  { name: "Communication", href: "/chat", icon: MessageSquare },
  { name: "Call Logs", href: "/calls", icon: Phone },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Bills & Billing", href: "/bills", icon: Receipt },
  { name: "Feedback", href: "/feedback", icon: Star },
  { name: "Users", href: "/users", icon: Users, roles: ["admin", "tpa", "insurer"] },
  { name: "E-Cards", href: "/ecards", icon: CreditCard, roles: ["tpa", "admin", "insurer"], group: "TPA Tools" },
  { name: "Network Providers", href: "/network", icon: MapPin, roles: ["tpa", "admin", "insurer"], group: "TPA Tools" },
  { name: "Scrutiny", href: "/scrutiny", icon: SearchIcon, roles: ["tpa", "admin", "insurer"], group: "TPA Tools" },
  { name: "Portability", href: "/portability", icon: ArrowLeftRight, group: "Policy" },
  { name: "Renewals", href: "/renewals", icon: RefreshCw, group: "Policy" },
  { name: "Members", href: "/members", icon: UserPlus, group: "Policy" },
  { name: "Settlements", href: "/settlements", icon: Banknote },
  { name: "Data Retention", href: "/retention", icon: ShieldCheck, roles: ["admin", "tpa", "insurer"] },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const { data: notifications, refetch: refetchNotifs } = useListNotifications(
    { userId: user?.id ? String(user.id) : undefined, unreadOnly: undefined },
    { query: { refetchInterval: 30000 } }
  )
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0

  const visibleNav = navItems.filter(item => !item.roles || !user || item.roles.includes(user.role))

  const groupedNav: { group?: string; items: NavItem[] }[] = []
  visibleNav.forEach(item => {
    const last = groupedNav[groupedNav.length - 1]
    if (last && last.group === item.group) {
      last.items.push(item)
    } else {
      groupedNav.push({ group: item.group, items: [item] })
    }
  })

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkAllRead = () => {
    if (!user) return
    markAllReadMutation.mutate({ data: { userId: user.id } }, { onSuccess: () => refetchNotifs() })
  }

  const handleMarkOneRead = (id: number) => {
    markReadMutation.mutate({ id }, { onSuccess: () => refetchNotifs() })
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50/50">
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-slate-200 transition-transform duration-300 lg:static lg:flex lg:translate-x-0 shadow-lg shadow-slate-200/50 lg:shadow-none",
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

        <div className="flex-1 overflow-auto py-4 px-3 space-y-4">
          {groupedNav.map(({ group, items }, gi) => (
            <div key={gi}>
              {group && (
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{group}</p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
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
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100" ref={userMenuRef}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/50 cursor-pointer hover:bg-slate-100 transition-colors relative"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name ?? "User"}</p>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", ROLE_COLORS[user?.role ?? "customer"])}>
                {ROLE_LABELS[user?.role ?? "customer"]}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
                <p className="text-xs text-slate-500 px-3 py-1 truncate">{user?.email}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLogout() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-600 p-2 rounded-md hover:bg-slate-100" onClick={() => setIsMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search claims, users, or bills..."
                className="h-9 w-64 lg:w-96 pl-10 pr-4 text-sm rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2" ref={notifRef}>
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {!notifications || notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm">No notifications</div>
                    ) : notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className={cn("flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors", !notif.isRead && "bg-primary/5")}
                        onClick={() => !notif.isRead && handleMarkOneRead(notif.id)}
                      >
                        <div className="mt-0.5 shrink-0">
                          {!notif.isRead
                            ? <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                            : <Check className="w-4 h-4 text-slate-300" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatDate(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
