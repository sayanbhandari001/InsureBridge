import { useState } from "react"
import { useListScrutiny, useCreateScrutiny, useUpdateScrutiny } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Search, ClipboardList, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export default function Scrutiny() {
  const qc = useQueryClient()
  const { data: cases, isLoading } = useListScrutiny()
  const createMutation = useCreateScrutiny({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/scrutiny"] }); setCreateOpen(false) } } })
  const updateMutation = useUpdateScrutiny({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/scrutiny"] }) } })
  const [createOpen, setCreateOpen] = useState(false)
  const [reviewId, setReviewId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const filtered = cases?.filter(c => !search || c.patientName.toLowerCase().includes(search.toLowerCase()) || (c.claimNumber ?? "").includes(search))

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      data: {
        claimId: fd.get("claimId") ? parseInt(fd.get("claimId") as string) : null,
        claimNumber: fd.get("claimNumber") as string || null,
        patientName: fd.get("patientName") as string,
        billAmount: parseFloat(fd.get("billAmount") as string) || 0,
        assignedTo: fd.get("assignedTo") as string || null,
        remarks: fd.get("remarks") as string || null,
      }
    })
  }

  const handleComplete = (e: React.FormEvent<HTMLFormElement>, id: number) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    updateMutation.mutate({
      id,
      data: {
        status: "completed",
        scrutinizedAmount: parseFloat(fd.get("scrutinizedAmount") as string) || undefined,
        deductions: parseFloat(fd.get("deductions") as string) || undefined,
        deductionReasons: (fd.get("deductionReasons") as string || "").split(",").map(r => r.trim()).filter(Boolean),
        remarks: fd.get("remarks") as string || undefined,
        completedAt: new Date().toISOString(),
      }
    }, { onSuccess: () => setReviewId(null) })
  }

  const reviewCase = cases?.find(c => c.id === reviewId)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Scrutiny & Settlements</h1>
          <p className="text-muted-foreground mt-1">Review and settle medical bills with deduction analysis.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Cases", value: cases?.length ?? 0, icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
          { label: "Pending", value: cases?.filter(c => c.status === "pending").length ?? 0, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "In Review", value: cases?.filter(c => c.status === "in_review").length ?? 0, icon: AlertTriangle, color: "text-purple-600 bg-purple-50" },
          { label: "Completed", value: cases?.filter(c => c.status === "completed").length ?? 0, icon: CheckCircle, color: "text-green-600 bg-green-50" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-md bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient or claim..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Cases Table */}
      <Card className="border-none shadow-md bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Patient", "Claim #", "Bill Amount", "Scrutinized", "Deductions", "Status", "Assigned To", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered?.map(sc => (
                <tr key={sc.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{sc.patientName}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{sc.claimNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(sc.billAmount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sc.scrutinizedAmount ? formatCurrency(sc.scrutinizedAmount) : "—"}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{sc.deductions ? formatCurrency(sc.deductions) : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={sc.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{sc.assignedTo ?? "—"}</td>
                  <td className="px-4 py-3">
                    {sc.status !== "completed" && (
                      <button onClick={() => setReviewId(sc.id)} className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-5">New Scrutiny Case</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Patient Name</label>
                  <input name="patientName" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Bill Amount (₹)</label>
                  <input name="billAmount" type="number" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Claim Number</label>
                  <input name="claimNumber" placeholder="CLM-XXXX" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Assigned To</label>
                  <input name="assignedTo" placeholder="Dr. Name" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Remarks</label>
                <textarea name="remarks" rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setCreateOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted/30">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Creating..." : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">Review Case</h2>
            <p className="text-sm text-muted-foreground mb-5">{reviewCase.patientName} — Bill: {formatCurrency(reviewCase.billAmount)}</p>
            <form onSubmit={e => handleComplete(e, reviewCase.id)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Scrutinized Amount (₹)</label>
                  <input name="scrutinizedAmount" type="number" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Deductions (₹)</label>
                  <input name="deductions" type="number" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Deduction Reasons (comma-separated)</label>
                <input name="deductionReasons" placeholder="Reason 1, Reason 2..." className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Remarks</label>
                <textarea name="remarks" rows={2} defaultValue={reviewCase.remarks ?? ""} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setReviewId(null)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted/30">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {updateMutation.isPending ? "Completing..." : "Mark Completed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
