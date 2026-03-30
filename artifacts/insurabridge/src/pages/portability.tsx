import { useState } from "react"
import { useListPortability, useCreatePortability, useUpdatePortability } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, ArrowLeftRight } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export default function Portability() {
  const qc = useQueryClient()
  const { data: requests, isLoading } = useListPortability()
  const createMutation = useCreatePortability({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/portability"] }); setOpen(false) } } })
  const updateMutation = useUpdatePortability({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/portability"] }) } })
  const [open, setOpen] = useState(false)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      data: {
        customerId: parseInt(fd.get("customerId") as string) || 1,
        customerName: fd.get("customerName") as string,
        fromInsurerName: fd.get("fromInsurerName") as string,
        toInsurerName: fd.get("toInsurerName") as string,
        policyNumber: fd.get("policyNumber") as string,
        sumInsured: parseFloat(fd.get("sumInsured") as string) || 0,
        newSumInsured: fd.get("newSumInsured") ? parseFloat(fd.get("newSumInsured") as string) : null,
        portabilityReason: fd.get("portabilityReason") as string || null,
        requestedAt: new Date().toISOString(),
      }
    })
  }

  const handleApprove = (id: number) => {
    updateMutation.mutate({ id, data: { status: "approved", effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), notes: "Approved by insurer" } })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Policy Portability</h1>
          <p className="text-slate-500 mt-1">Manage customer requests to switch insurance providers.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25">
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["initiated", "under_review", "approved", "completed"].map(status => (
          <Card key={status} className="border-none shadow-md bg-white">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold text-slate-900">{requests?.filter(r => r.status === status).length ?? 0}</p>
              <StatusBadge status={status} className="mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Loading portability requests...</div>
        ) : requests?.map(req => (
          <Card key={req.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span>{req.fromInsurerName}</span>
                      <ArrowLeftRight className="w-4 h-4 text-primary" />
                      <span>{req.toInsurerName}</span>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="font-medium text-slate-800">{req.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Policy</p>
                      <p className="font-mono text-slate-700">{req.policyNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Current Sum</p>
                      <p className="font-medium text-slate-800">{formatCurrency(req.sumInsured)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">New Sum</p>
                      <p className="font-medium text-slate-800">{req.newSumInsured ? formatCurrency(req.newSumInsured) : "Same"}</p>
                    </div>
                  </div>
                  {req.portabilityReason && (
                    <p className="text-sm text-slate-500 mt-2 italic">Reason: {req.portabilityReason}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">Requested: {formatDate(req.requestedAt)}</p>
                </div>
                <div className="flex sm:flex-col gap-2">
                  {req.status === "initiated" && (
                    <button onClick={() => updateMutation.mutate({ id: req.id, data: { status: "under_review" } })} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors">
                      Start Review
                    </button>
                  )}
                  {req.status === "under_review" && (
                    <button onClick={() => handleApprove(req.id)} className="px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                      Approve
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-5">New Portability Request</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Customer Name</label>
                  <input name="customerName" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Customer ID</label>
                  <input name="customerId" type="number" required placeholder="User ID" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">From Insurer</label>
                  <input name="fromInsurerName" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">To Insurer</label>
                  <input name="toInsurerName" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Policy Number</label>
                <input name="policyNumber" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Current Sum Insured</label>
                  <input name="sumInsured" type="number" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">New Sum Insured</label>
                  <input name="newSumInsured" type="number" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Reason for Portability</label>
                <textarea name="portabilityReason" rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
