import { useState } from "react"
import { useListPortability, useCreatePortability, useUpdatePortability } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, ArrowLeftRight, ArrowRight, GitBranch, X, RotateCcw, CheckCircle2, Clock } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"

type LineageEvent = {
  type: "portability" | "renewal"
  id: number
  policyNumber: string
  newPolicyNumber: string | null
  fromInsurerName?: string
  toInsurerName?: string
  insurerName?: string
  customerName: string
  status: string
  sumInsured?: number
  currentSumInsured?: number
  newSumInsured?: number | null
  effectiveDate?: string | null
  renewalDate?: string | null
  requestedAt?: string
  expiryDate?: string
  portabilityReason?: string | null
  notes?: string | null
  memberCount?: number
  currentPremium?: number
  newPremium?: number | null
}

function PolicyChainBadge({ oldPolicy, newPolicy, label }: { oldPolicy: string; newPolicy: string | null; label?: string }) {
  if (!newPolicy) return null
  return (
    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label ?? "Policy Chain"}</span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{oldPolicy}</span>
        <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-semibold">{newPolicy}</span>
      </div>
    </div>
  )
}

function LineageModal({ policyNumber, onClose }: { policyNumber: string; onClose: () => void }) {
  const { data, isLoading } = useQuery<{ policyNumber: string; events: LineageEvent[] }>({
    queryKey: ["/api/policy-lineage", policyNumber],
    queryFn: () => fetch(`/api/policy-lineage/${encodeURIComponent(policyNumber)}`).then(r => r.json()),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Policy Lineage</h2>
              <p className="text-xs text-slate-500 font-mono">{policyNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {isLoading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading lineage...</div>
          ) : !data?.events.length ? (
            <div className="py-8 text-center text-slate-400 text-sm">No linked events found for this policy.</div>
          ) : (
            <div className="space-y-0">
              {data.events.map((ev, idx) => (
                <div key={`${ev.type}-${ev.id}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ev.type === "portability" ? "bg-blue-100" : "bg-green-100"}`}>
                      {ev.type === "portability"
                        ? <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                        : <RotateCcw className="w-3.5 h-3.5 text-green-600" />
                      }
                    </div>
                    {idx < data.events.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200 my-1" style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ev.type === "portability" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {ev.type === "portability" ? "Portability" : "Renewal"}
                      </span>
                      <StatusBadge status={ev.status} />
                      <span className="text-xs text-slate-500">{ev.customerName}</span>
                    </div>

                    {ev.type === "portability" ? (
                      <div className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                        <span className="font-medium">{ev.fromInsurerName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium">{ev.toInsurerName}</span>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-700 mb-1">{ev.insurerName}</p>
                    )}

                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{ev.policyNumber}</span>
                      {ev.newPolicyNumber && (
                        <>
                          <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                          <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-semibold">{ev.newPolicyNumber}</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
                      {ev.type === "portability" && ev.sumInsured && (
                        <span>Sum: {formatCurrency(ev.sumInsured)}{ev.newSumInsured ? ` → ${formatCurrency(ev.newSumInsured)}` : ""}</span>
                      )}
                      {ev.type === "renewal" && ev.currentSumInsured && (
                        <span>Sum: {formatCurrency(ev.currentSumInsured)}{ev.newSumInsured ? ` → ${formatCurrency(ev.newSumInsured)}` : ""}</span>
                      )}
                      {ev.type === "renewal" && ev.currentPremium && (
                        <span>Premium: {formatCurrency(ev.currentPremium)}{ev.newPremium ? ` → ${formatCurrency(ev.newPremium)}` : ""}</span>
                      )}
                      {ev.effectiveDate && <span>Effective: {formatDate(ev.effectiveDate)}</span>}
                      {ev.renewalDate && <span>Renewed: {formatDate(ev.renewalDate)}</span>}
                      {ev.requestedAt && <span>Requested: {formatDate(ev.requestedAt)}</span>}
                      {ev.expiryDate && <span>Expiry: {formatDate(ev.expiryDate)}</span>}
                      {ev.memberCount && ev.memberCount > 1 && <span>Members: {ev.memberCount}</span>}
                    </div>

                    {ev.portabilityReason && <p className="text-xs text-slate-500 mt-1 italic">Reason: {ev.portabilityReason}</p>}
                    {ev.notes && <p className="text-xs text-slate-500 mt-1 italic">{ev.notes}</p>}
                  </div>
                </div>
              ))}

              {data.events.length > 0 && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                  <div className="pb-2 flex-1">
                    <p className="text-xs text-slate-400 pt-1.5">
                      {data.events[data.events.length - 1].newPolicyNumber
                        ? `Current active policy: ${data.events[data.events.length - 1].newPolicyNumber}`
                        : "Policy lineage up to date"
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Portability() {
  const qc = useQueryClient()
  const { data: requests, isLoading } = useListPortability()
  const createMutation = useCreatePortability({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/portability"] }); setOpen(false) } } })
  const updateMutation = useUpdatePortability({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/portability"] }) } })
  const [open, setOpen] = useState(false)
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [newPolicyNum, setNewPolicyNum] = useState("")
  const [lineagePolicyNumber, setLineagePolicyNumber] = useState<string | null>(null)

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

  const handleComplete = (id: number) => {
    updateMutation.mutate({
      id,
      data: {
        status: "completed",
        effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Portability completed",
        newPolicyNumber: newPolicyNum || undefined,
      } as any
    }, {
      onSuccess: () => {
        setCompletingId(null)
        setNewPolicyNum("")
      }
    })
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
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
                      <p className="font-mono text-slate-700 text-xs">{req.policyNumber}</p>
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

                  {/* Policy chain badge */}
                  <PolicyChainBadge oldPolicy={req.policyNumber} newPolicy={(req as any).newPolicyNumber} />

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <p className="text-xs text-slate-400">Requested: {formatDate(req.requestedAt)}</p>
                    <button
                      onClick={() => setLineagePolicyNumber(req.policyNumber)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <GitBranch className="w-3 h-3" />
                      View Policy History
                    </button>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  {req.status === "initiated" && (
                    <button onClick={() => updateMutation.mutate({ id: req.id, data: { status: "under_review" } })} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors">
                      Start Review
                    </button>
                  )}
                  {req.status === "under_review" && (
                    <button onClick={() => updateMutation.mutate({ id: req.id, data: { status: "approved", notes: "Approved by insurer" } })} className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors">
                      Approve
                    </button>
                  )}
                  {req.status === "approved" && completingId !== req.id && (
                    <button onClick={() => { setCompletingId(req.id); setNewPolicyNum("") }} className="px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors whitespace-nowrap">
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Complete inline form */}
              {completingId === req.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Enter the new policy number issued by {req.toInsurerName}:</p>
                  <div className="flex gap-2">
                    <input
                      value={newPolicyNum}
                      onChange={e => setNewPolicyNum(e.target.value)}
                      placeholder="e.g. NL-POL-2025-0001"
                      className="flex-1 px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => handleComplete(req.id)}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button onClick={() => setCompletingId(null)} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
                <label className="text-xs font-medium text-slate-700 mb-1 block">Policy Number (existing)</label>
                <input name="policyNumber" required className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
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

      {/* Lineage Modal */}
      {lineagePolicyNumber && (
        <LineageModal policyNumber={lineagePolicyNumber} onClose={() => setLineagePolicyNumber(null)} />
      )}
    </div>
  )
}
