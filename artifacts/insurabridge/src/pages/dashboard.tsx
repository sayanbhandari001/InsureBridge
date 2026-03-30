import { useGetDashboardStats, useListClaims } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { FileText, Clock, CheckCircle2, DollarSign, Bell, Users, Banknote, MessageSquare, Star, ArrowRight } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"
import { useLocation } from "wouter"

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats()
  const { data: claims, isLoading: claimsLoading } = useListClaims()
  const [, navigate] = useLocation()

  if (statsLoading || claimsLoading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  const pieData = [
    { name: 'Pending', value: stats?.pendingClaims || 0, color: '#f59e0b' },
    { name: 'Approved', value: stats?.approvedClaims || 0, color: '#10b981' },
    { name: 'Rejected', value: stats?.rejectedClaims || 0, color: '#ef4444' },
  ]

  const statCards = [
    { title: "Total Claims", value: stats?.totalClaims, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", href: "/claims", action: "View all claims" },
    { title: "Pending Claims", value: stats?.pendingClaims, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", href: "/claims", action: "Review pending" },
    { title: "Approved Claims", value: stats?.approvedClaims, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", href: "/claims", action: "View approved" },
    { title: "Total Billed", value: formatCurrency(stats?.totalBillAmount || 0), icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50", href: "/bills", action: "View bills" },
    { title: "Unread Notifications", value: stats?.unreadNotifications ?? 0, icon: Bell, color: "text-purple-600", bg: "bg-purple-50", href: "/chat", action: "View messages" },
    { title: "Active Members", value: stats?.activeMembers ?? 0, icon: Users, color: "text-pink-600", bg: "bg-pink-50", href: "/members", action: "Manage members" },
    { title: "Pending Settlements", value: stats?.pendingSettlements ?? 0, icon: Banknote, color: "text-teal-600", bg: "bg-teal-50", href: "/settlements", action: "View settlements" },
    { title: "Open Threads", value: stats?.openThreads ?? 0, icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50", href: "/chat", action: "View threads" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your platform activities and metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <button
            key={i}
            onClick={() => navigate(stat.href)}
            className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
          >
            <Card className="border-none shadow-md group-hover:shadow-xl group-hover:-translate-y-0.5 transition-all duration-200 h-full cursor-pointer">
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-150`}>
                    {stat.action} <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 border-none shadow-md">
          <CardHeader>
            <CardTitle>Claims Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-slate-600">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
               <button onClick={() => navigate("/chat")} className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-150">
                   <div className="flex items-center gap-2 mb-2">
                     <MessageSquare className="w-4 h-4 text-primary" />
                     <span className="font-medium text-slate-700">Open Threads</span>
                     <ArrowRight className="w-3 h-3 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <p className="text-2xl font-bold text-slate-900">{stats?.openThreads || 0}</p>
                 </div>
               </button>
               <button onClick={() => navigate("/claims")} className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:border-emerald-300 group-hover:bg-emerald-50 transition-all duration-150">
                   <div className="flex items-center gap-2 mb-2">
                     <DollarSign className="w-4 h-4 text-emerald-600" />
                     <span className="font-medium text-slate-700">Approved Total</span>
                     <ArrowRight className="w-3 h-3 text-emerald-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.approvedBillAmount || 0)}</p>
                 </div>
               </button>
               <button onClick={() => navigate("/feedback")} className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:border-amber-300 group-hover:bg-amber-50 transition-all duration-150">
                   <div className="flex items-center gap-2 mb-2">
                     <Star className="w-4 h-4 text-amber-500" />
                     <span className="font-medium text-slate-700">Avg Rating</span>
                     <ArrowRight className="w-3 h-3 text-amber-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <p className="text-2xl font-bold text-slate-900">{stats?.averageRating?.toFixed(1) || 0} / 5</p>
                 </div>
               </button>
            </div>
            
            <h4 className="font-semibold text-slate-900 mb-3">Recent Claims</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-y border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">Claim ID</th>
                    <th className="px-4 py-3 font-medium">Patient</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims?.slice(0, 4).map((claim) => (
                    <tr
                      key={claim.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => navigate("/claims")}
                    >
                      <td className="px-4 py-3 font-medium text-primary group-hover:underline">
                        {claim.claimNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{claim.patientName}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(claim.claimedAmount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={claim.status} /></td>
                    </tr>
                  ))}
                  {(!claims || claims.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No recent claims found.</td>
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
