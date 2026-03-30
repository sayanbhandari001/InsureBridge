import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck, Database, AlertTriangle, Clock, Trash2,
  CheckCircle2, CalendarClock, BarChart3, RefreshCw
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

interface TableStat {
  table: string
  label: string
  total: number
  expired: number
  expiring30d: number
  expiring90d: number
  soonestExpiry: string | null
  latestExpiry: string | null
}

interface RetentionData {
  tables: TableStat[]
  totals: { total: number; expired: number; expiring30d: number; expiring90d: number }
  retentionPeriodDays: number
}

interface PurgeResult {
  success: boolean
  totalPurged: number
  details: Record<string, number>
  purgedAt: string
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-slate-400 text-xs">—</span>
  if (days < 0) return <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Expired {Math.abs(days)}d ago</span>
  if (days <= 30) return <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">In {days}d</span>
  if (days <= 90) return <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">In {days}d</span>
  return <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">In {days}d</span>
}

export default function Retention() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [purgeResult, setPurgeResult] = useState<PurgeResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const { data, isLoading, refetch, isFetching } = useQuery<RetentionData>({
    queryKey: ["/api/retention"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/retention`, { credentials: "include" })
      if (!r.ok) throw new Error("Failed to load retention data")
      return r.json()
    }
  })

  const purgeMutation = useMutation<PurgeResult>({
    mutationFn: async () => {
      const r = await fetch(`${BASE}/api/retention/purge`, {
        method: "DELETE",
        credentials: "include"
      })
      if (!r.ok) throw new Error("Purge failed")
      return r.json()
    },
    onSuccess: (result) => {
      setPurgeResult(result)
      setShowConfirm(false)
      queryClient.invalidateQueries({ queryKey: ["/api/retention"] })
    }
  })

  const isAdmin = user?.role === "admin" || user?.role === "tpa"

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Data Retention</h1>
          <p className="text-slate-500 mt-1">All records are retained for 1 year per person, then eligible for archival.</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 border border-slate-200"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Policy banner */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-primary/5 to-blue-50 p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">1-Year Retention Policy</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Every record — claims, call logs, messages, documents, e-cards, and more — is stored for exactly
            <strong> 365 days</strong> from the date it was created. After expiry, records are eligible for permanent
            deletion via the purge process. This policy applies to all users and roles across the platform.
          </p>
        </div>
      </Card>

      {/* Overview stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-none shadow-sm p-5 animate-pulse bg-slate-100 h-24" />
          ))}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Database, label: "Total Records", value: data.totals.total.toLocaleString(), color: "text-slate-700", bg: "bg-slate-100" },
            { icon: AlertTriangle, label: "Expired", value: data.totals.expired.toLocaleString(), color: "text-red-600", bg: "bg-red-50" },
            { icon: Clock, label: "Expiring in 30 days", value: data.totals.expiring30d.toLocaleString(), color: "text-orange-600", bg: "bg-orange-50" },
            { icon: CalendarClock, label: "Expiring in 90 days", value: data.totals.expiring90d.toLocaleString(), color: "text-amber-600", bg: "bg-amber-50" },
          ].map(stat => (
            <Card key={stat.label} className="border-none shadow-sm p-5 bg-white">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Per-table breakdown */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-800">Record Breakdown by Data Type</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-medium">Data Type</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
                <th className="px-6 py-3 font-medium text-right">Expired</th>
                <th className="px-6 py-3 font-medium text-right">Expiring ≤30d</th>
                <th className="px-6 py-3 font-medium text-right">Expiring ≤90d</th>
                <th className="px-6 py-3 font-medium">Soonest Expiry</th>
                <th className="px-6 py-3 font-medium">Latest Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : data?.tables.map(row => {
                const days = daysUntil(row.soonestExpiry)
                return (
                  <tr key={row.table} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-medium text-slate-800">{row.label}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{row.table}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-700">{row.total.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right">
                      {row.expired > 0
                        ? <span className="font-semibold text-red-600">{row.expired}</span>
                        : <span className="text-slate-400">0</span>
                      }
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {row.expiring30d > 0
                        ? <span className="font-semibold text-orange-600">{row.expiring30d}</span>
                        : <span className="text-slate-400">0</span>
                      }
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {row.expiring90d > 0
                        ? <span className="font-semibold text-amber-600">{row.expiring90d}</span>
                        : <span className="text-slate-400">0</span>
                      }
                    </td>
                    <td className="px-6 py-3.5">
                      <ExpiryBadge days={days} />
                      {row.soonestExpiry && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">{formatDate(row.soonestExpiry)}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {row.latestExpiry ? formatDate(row.latestExpiry) : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Purge section (admin only) */}
      {isAdmin && (
        <Card className="border-none shadow-md p-6">
          <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Purge Expired Records</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Permanently delete all records that have passed their 1-year retention date.
                  This action cannot be undone.
                </p>
                {data?.totals.expired === 0 && (
                  <p className="text-sm text-emerald-600 font-medium mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> No expired records — database is clean.
                  </p>
                )}
              </div>
            </div>
            {!showConfirm ? (
              <Button
                variant="destructive"
                disabled={!data || data.totals.expired === 0 || purgeMutation.isPending}
                onClick={() => setShowConfirm(true)}
                className="gap-2 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Purge {data?.totals.expired ?? 0} Expired Records
              </Button>
            ) : (
              <div className="flex gap-2 items-center shrink-0">
                <p className="text-sm text-red-600 font-medium">Are you sure?</p>
                <Button
                  variant="destructive"
                  onClick={() => purgeMutation.mutate()}
                  disabled={purgeMutation.isPending}
                  className="gap-2"
                >
                  {purgeMutation.isPending ? "Purging..." : "Yes, Delete Permanently"}
                </Button>
                <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Purge result */}
      {purgeResult && (
        <Card className="border-none shadow-sm bg-emerald-50 border-emerald-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-900">Purge Completed</h4>
              <p className="text-sm text-emerald-700">
                {purgeResult.totalPurged} records permanently deleted on {new Date(purgeResult.purgedAt).toLocaleString()}
              </p>
            </div>
          </div>
          {purgeResult.totalPurged > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(purgeResult.details).filter(([, count]) => count > 0).map(([label, count]) => (
                <div key={label} className="text-sm bg-white rounded-lg px-3 py-2 border border-emerald-100">
                  <span className="font-semibold text-emerald-700">{count}</span>
                  <span className="text-slate-600"> {label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
