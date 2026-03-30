import { useState } from "react"
import { useListRenewals, useCreateRenewal, useUpdateRenewal } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Calendar, Users, TrendingUp, AlertCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export default function Renewals() {
  const qc = useQueryClient()
  const { data: renewals, isLoading } = useListRenewals()
  const createMutation = useCreateRenewal({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/renewals"] }); setOpen(false) } } })
  const updateMutation = useUpdateRenewal({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/renewals"] }) } })
  const [open, setOpen] = useState(false)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      data: {
        customerId: parseInt(fd.get("customerId") as string) || 1,
        customerName: fd.get("customerName") as string,
        policyNumber: fd.get("policyNumber") as string,
        insurerName: fd.get("insurerName") as string,
        expiryDate: fd.get("expiryDate") as string,
        currentSumInsured: parseFloat(fd.get("currentSumInsured") as string) || 0,
        newSumInsured: fd.get("newSumInsured") ? parseFloat(fd.get("newSumInsured") as string) : null,
        currentPremium: parseFloat(fd.get("currentPremium") as string) || 0,
        newPremium: fd.get("newPremium") ? parseFloat(fd.get("newPremium") as string) : null,
        memberCount: parseInt(fd.get("memberCount") as string) || 1,
        notes: fd.get("notes") as string || null,
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Policy Renewals</h1>
          <p className="text-slate-500 mt-1">Track and manage upcoming policy renewals.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25">
          <Plus className="w-4 h-4" />
          New Renewal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: renewals?.length ?? 0, icon: Calendar, color: "text-blue-600 bg-blue-50" },
          { label: "Pending", value: renewals?.filter(r => r.status === "pending").length ?? 0, icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
          { label: "Completed", value: renewals?.filter(r => r.status === "completed").length ?? 0, icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "Total Members", value: renewals?.reduce((acc, r) => acc + r.memberCount, 0) ?? 0, icon: Users, color: "text-purple-600 bg-purple-50" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-md bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Renewals List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Loading renewals...</div>
        ) : renewals?.map(renewal => (
          <Card key={renewal.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{renewal.customerName}</h3>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{renewal.policyNumber}</span>
                    <StatusBadge status={renewal.status} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Insurer</p>
                      <p className="font-medium text-slate-800">{renewal.insurerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Expiry</p>
                      <p className="font-medium text-slate-800">{formatDate(renewal.expiryDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sum Insured</p>
                      <p className="font-medium">{formatCurrency(renewal.currentSumInsured)}</p>
                      {renewal.newSumInsured && <p className="text-xs text-primary">→ {formatCurrency(renewal.newSumInsured)}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Premium</p>
                      <p className="font-medium">{formatCurrency(renewal.currentPremium)}</p>
                      {renewal.newPremium && <p className="text-xs text-primary">→ {formatCurrency(renewal.newPremium)}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Members</p>
                      <p className="font-medium">{renewal.memberCount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {renewal.status === "pending" && (
                    <button onClick={() => updateMutation.mutate({ id: renewal.id, data: { status: "initiated" } })} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 whitespace-nowrap">
                      Initiate
                    </button>
                  )}
                  {renewal.status === "initiated" && (
                    <button onClick={() => updateMutation.mutate({ id: renewal.id, data: { status: "payment_due" } })} className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 whitespace-nowrap">
                      Mark Payment Due
                    </button>
                  )}
                  {renewal.status === "payment_due" && (
                    <button onClick={() => updateMutation.mutate({ id: renewal.id, data: { status: "completed", renewalDate: new Date().toISOString() } })} className="px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 whitespace-nowrap">
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-5">New Renewal</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Customer Name</label>
                  <input name="customerName" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Customer ID</label>
                  <input name="customerId" type="number" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Policy Number</label>
                <input name="policyNumber" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Insurer Name</label>
                <input name="insurerName" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Expiry Date</label>
                <input name="expiryDate" type="date" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Current Sum Insured</label>
                  <input name="currentSumInsured" type="number" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">New Sum Insured</label>
                  <input name="newSumInsured" type="number" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Current Premium</label>
                  <input name="currentPremium" type="number" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Members</label>
                  <input name="memberCount" type="number" defaultValue={1} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
