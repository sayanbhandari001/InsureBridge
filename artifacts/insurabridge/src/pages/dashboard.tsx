import { useGetDashboardStats, useListClaims } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import {
  FileText, Clock, CheckCircle2, DollarSign, Bell, Users,
  Banknote, MessageSquare, Star, ArrowRight,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"
import { useLocation } from "wouter"

const STAT_CARDS = (s: any) => [
  { title: "Total Claims",          value: s?.totalClaims,           icon: FileText,     color: "#60a5fa", bg: "rgba(96,165,250,0.12)",   href: "/claims",      action: "View all claims"   },
  { title: "Pending Claims",        value: s?.pendingClaims,         icon: Clock,        color: "#fbbf24", bg: "rgba(251,191,36,0.12)",   href: "/claims",      action: "Review pending"    },
  { title: "Approved Claims",       value: s?.approvedClaims,        icon: CheckCircle2, color: "#34d399", bg: "rgba(52,211,153,0.12)",   href: "/claims",      action: "View approved"     },
  { title: "Total Billed",          value: formatCurrency(s?.totalBillAmount || 0), icon: DollarSign, color: "#a78bfa", bg: "rgba(167,139,250,0.12)", href: "/bills", action: "View bills" },
  { title: "Unread Notifications",  value: s?.unreadNotifications ?? 0, icon: Bell,     color: "#c084fc", bg: "rgba(192,132,252,0.12)",  href: "/chat",        action: "View messages"     },
  { title: "Active Members",        value: s?.activeMembers ?? 0,    icon: Users,        color: "#f472b6", bg: "rgba(244,114,182,0.12)",  href: "/members",     action: "Manage members"    },
  { title: "Pending Settlements",   value: s?.pendingSettlements ?? 0, icon: Banknote,  color: "#2dd4bf", bg: "rgba(45,212,191,0.12)",   href: "/settlements", action: "View settlements"  },
  { title: "Open Threads",          value: s?.openThreads ?? 0,      icon: MessageSquare,color: "#fb923c", bg: "rgba(251,146,60,0.12)",   href: "/chat",        action: "View threads"      },
]

const PIE_COLORS = { Pending: "#fbbf24", Approved: "#34d399", Rejected: "#f87171" }

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-semibold shadow-xl bg-card text-foreground border border-border/60"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
      {payload[0].name}: <span style={{ color: payload[0].payload.color }}>{payload[0].value}</span>
    </div>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats()
  const { data: claims, isLoading: claimsLoading } = useListClaims()
  const [, navigate] = useLocation()

  if (statsLoading || claimsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pieData = [
    { name: "Pending",  value: stats?.pendingClaims  || 0, color: PIE_COLORS.Pending  },
    { name: "Approved", value: stats?.approvedClaims || 0, color: PIE_COLORS.Approved },
    { name: "Rejected", value: stats?.rejectedClaims || 0, color: PIE_COLORS.Rejected },
  ]

  const statCards = STAT_CARDS(stats)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your platform activities and metrics.</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <button
            key={i}
            onClick={() => navigate(stat.href)}
            className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
          >
            <Card className="h-full cursor-pointer border border-border/60 shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-200 bg-card">
              <CardContent className="p-5 flex items-start gap-3">
                <div
                  className="p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-200 shrink-0"
                  style={{ background: stat.bg }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-foreground mt-0.5 tabular-nums">{stat.value}</h3>
                  <p className="text-xs mt-1.5 flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ color: stat.color }}>
                    {stat.action} <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pie */}
        <Card className="col-span-1 border border-border/60 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-foreground text-base">Claims Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-5 mt-3">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground font-medium">{d.name}</span>
                  <span className="text-xs font-bold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity + Recent Claims */}
        <Card className="col-span-1 lg:col-span-2 border border-border/60 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-foreground text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {[
                { label: "Open Threads",   val: stats?.openThreads || 0,                             icon: MessageSquare, color: "#fb923c", href: "/chat"     },
                { label: "Approved Total", val: formatCurrency(stats?.approvedBillAmount || 0),       icon: DollarSign,    color: "#34d399", href: "/claims"   },
                { label: "Avg Rating",     val: `${(stats?.averageRating ?? 0).toFixed(1)} / 5`,     icon: Star,          color: "#fbbf24", href: "/feedback" },
              ].map(item => (
                <button key={item.label} onClick={() => navigate(item.href)}
                  className="text-left group rounded-xl p-3.5 transition-all duration-150 border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: item.color }} />
                  </div>
                  <p className="text-xl font-bold text-foreground tabular-nums">{item.val}</p>
                </button>
              ))}
            </div>

            {/* Recent claims table */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">Recent Claims</p>
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Claim ID</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Patient</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Amount</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {claims?.slice(0, 5).map((claim) => (
                    <tr key={claim.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => navigate("/claims")}
                    >
                      <td className="px-4 py-2.5 font-medium text-primary group-hover:underline text-xs">{claim.claimNumber}</td>
                      <td className="px-4 py-2.5 text-foreground text-xs">{claim.patientName}</td>
                      <td className="px-4 py-2.5 text-foreground text-xs tabular-nums">{formatCurrency(claim.claimedAmount)}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={claim.status} /></td>
                    </tr>
                  ))}
                  {(!claims || claims.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No recent claims found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
