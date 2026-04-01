import React, { useState, useRef, useEffect, useMemo } from "react"
import { Link, useLocation } from "wouter"
import { useAuth, ROLE_LABELS, ROLE_COLORS } from "@/lib/auth"
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, useListClaims, useListBills, useListReimbursementSettlements } from "@workspace/api-client-react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, FileText, MessageSquare, Phone, FolderOpen,
  Receipt, Star, Users, Bell, Menu, X, CreditCard, MapPin,
  Search as SearchIcon, ArrowLeftRight, RefreshCw, UserPlus,
  Banknote, LogOut, ChevronDown, Check, ShieldCheck, Ticket,
  Globe, DollarSign, ChevronUp
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useTheme } from "@/lib/theme-context"
import { useCurrency, CURRENCIES } from "@/lib/currency-context"
import { useLocale, LOCALES } from "@/lib/locale-context"

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
  { name: "Financials & Bills", href: "/bills", icon: Receipt },
  { name: "Feedback", href: "/feedback", icon: Star },
  { name: "Users", href: "/users", icon: Users, roles: ["admin", "tpa", "insurer"] },
  { name: "E-Cards", href: "/ecards", icon: CreditCard, roles: ["tpa", "admin", "insurer"], group: "TPA Tools" },
  { name: "Network Providers", href: "/network", icon: MapPin, roles: ["tpa", "admin", "insurer"], group: "TPA Tools" },
  { name: "Scrutiny", href: "/scrutiny", icon: SearchIcon, roles: ["tpa", "admin", "insurer"], group: "TPA Tools" },
  { name: "Portability", href: "/portability", icon: ArrowLeftRight, group: "Policy" },
  { name: "Renewals", href: "/renewals", icon: RefreshCw, group: "Policy" },
  { name: "Members", href: "/members", icon: UserPlus, group: "Policy" },
  { name: "Settlements", href: "/settlements", icon: Banknote },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Data Retention", href: "/retention", icon: ShieldCheck, roles: ["admin", "tpa", "insurer"] },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [localeOpen, setLocaleOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const currencyRef = useRef<HTMLDivElement>(null)
  const localeRef = useRef<HTMLDivElement>(null)
  const { currency, setCurrency } = useCurrency()
  const { locale, setLocale } = useLocale()
  const { resetToDark } = useTheme()
  const { user, logout } = useAuth()

  const { data: claims } = useListClaims()
  const { data: bills } = useListBills()
  const { data: settlements } = useListReimbursementSettlements()

  const searchResults = useMemo(() => {
    if (!globalSearch.trim() || globalSearch.length < 2) return []
    const q = globalSearch.toLowerCase()
    const results: { type: string; label: string; sub: string; href: string }[] = []
    claims?.forEach(c => {
      if (c.claimNumber?.toLowerCase().includes(q) || c.patientName?.toLowerCase().includes(q) || c.hospitalName?.toLowerCase().includes(q)) {
        results.push({ type: "Claim", label: c.claimNumber ?? "—", sub: `${c.patientName} · ${c.hospitalName}`, href: "/claims" })
      }
    })
    bills?.forEach(b => {
      if (b.billNumber?.toLowerCase().includes(q) || b.patientName?.toLowerCase().includes(q) || b.hospitalName?.toLowerCase().includes(q)) {
        results.push({ type: "Bill", label: b.billNumber ?? "—", sub: `${b.patientName} · ${b.hospitalName}`, href: "/bills" })
      }
    })
    settlements?.forEach(s => {
      if (s.patientName?.toLowerCase().includes(q) || s.policyNumber?.toLowerCase().includes(q) || (s.claimNumber ?? "").toLowerCase().includes(q)) {
        results.push({ type: "Settlement", label: s.claimNumber ?? s.policyNumber, sub: `${s.patientName} · ${s.hospitalName}`, href: "/settlements" })
      }
    })
    return results.slice(0, 8)
  }, [globalSearch, claims, bills, settlements])

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
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false)
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) setLocaleOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
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
    <div className="flex min-h-screen w-full bg-background">
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] transition-transform duration-300 lg:static lg:flex lg:translate-x-0 shadow-xl shadow-black/30 lg:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-4 border-b border-[hsl(var(--sidebar-border))]">
          <button
            onClick={resetToDark}
            title="Reset to dark mode"
            className="focus:outline-none hover:opacity-80 transition-opacity"
          >
            <InsuraBridgeLogo size={32} textSize="0.9rem" />
          </button>
          <button className="ml-auto lg:hidden text-muted-foreground hover:text-foreground p-1" onClick={() => setIsMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto py-4 px-3 space-y-4">
          {groupedNav.map(({ group, items }, gi) => (
            <div key={gi}>
              {group && (
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">{group}</p>
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
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                          : "text-muted-foreground hover:bg-[hsl(var(--sidebar-accent))] hover:text-foreground"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground/70")} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[hsl(var(--sidebar-border))]" ref={userMenuRef}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--sidebar-accent))] border border-border/40 cursor-pointer hover:bg-muted/60 transition-colors relative"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md shadow-primary/20">
              {user?.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name ?? "User"}</p>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", ROLE_COLORS[user?.role ?? "customer"])}>
                {ROLE_LABELS[user?.role ?? "customer"]}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground/60" />

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 p-2 z-50">
                <p className="text-xs text-muted-foreground px-3 py-1 truncate">{user?.email}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLogout() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-muted-foreground p-2 rounded-md hover:bg-muted/50" onClick={() => setIsMobileOpen(true)}>
              <Menu size={20} />
            </button>
            {/* Global Search */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none z-10" />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { setGlobalSearch(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search claims, bills, settlements..."
                className="h-9 w-64 lg:w-96 pl-10 pr-8 text-sm rounded-full bg-muted/40 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
              {globalSearch && (
                <button onClick={() => { setGlobalSearch(""); setSearchOpen(false) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Results dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1.5 w-full min-w-[320px] bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden py-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-4 pt-2 pb-1">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</p>
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(r.href); setSearchOpen(false); setGlobalSearch("") }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                        r.type === "Claim" ? "bg-primary/15 text-primary" :
                        r.type === "Bill" ? "bg-amber-500/15 text-amber-400" :
                        "bg-emerald-500/15 text-emerald-400"
                      )}>{r.type}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-semibold text-foreground truncate">{r.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{r.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchOpen && globalSearch.length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full left-0 mt-1.5 w-full bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 z-50 px-4 py-5 text-center text-sm text-muted-foreground">
                  No results for "{globalSearch}"
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5" ref={notifRef}>
            {/* Currency selector */}
            <div className="relative hidden sm:block" ref={currencyRef}>
              <button
                onClick={() => { setCurrencyOpen(o => !o); setLocaleOpen(false) }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/40"
              >
                <DollarSign className="w-3.5 h-3.5" />
                {currency.symbol} {currency.code}
                <ChevronDown className="w-3 h-3" />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden py-1">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c); setCurrencyOpen(false) }}
                      className={cn("w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2",
                        c.code === currency.code ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted/40")}
                    >
                      <span className="text-base w-5 text-center">{c.symbol}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language / Locale selector */}
            <div className="relative hidden sm:block" ref={localeRef}>
              <button
                onClick={() => { setLocaleOpen(o => !o); setCurrencyOpen(false) }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/40"
              >
                <Globe className="w-3.5 h-3.5" />
                {locale.shortLabel}
                <ChevronDown className="w-3 h-3" />
              </button>
              {localeOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden py-1">
                  {LOCALES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLocale(l); setLocaleOpen(false) }}
                      className={cn("w-full text-left px-3 py-2 text-xs transition-colors",
                        l.code === locale.code ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted/40")}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle />
            <div className="relative">
              <button
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-card">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                    {!notifications || notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-sm">No notifications</div>
                    ) : notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className={cn("flex gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors", !notif.isRead && "bg-primary/5")}
                        onClick={() => !notif.isRead && handleMarkOneRead(notif.id)}
                      >
                        <div className="mt-0.5 shrink-0">
                          {!notif.isRead
                            ? <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                            : <Check className="w-4 h-4 text-muted-foreground/40" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(notif.createdAt)}</p>
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
          <div key={location} className="max-w-7xl mx-auto w-full page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
