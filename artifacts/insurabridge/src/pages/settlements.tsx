import { useState } from "react"
import { useListReimbursementSettlements, useCreateReimbursementSettlement, useUpdateReimbursementSettlement } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Banknote, CheckCircle, Clock, Search } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export default function Settlements() {
  const qc = useQueryClient()
  const { data: settlements, isLoading } = useListReimbursementSettlements()
  const createMutation = useCreateReimbursementSettlement({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/reimbursement-settlements"] }); setOpen(false) } } })
  const updateMutation = useUpdateReimbursementSettlement({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/reimbursement-settlements"] }) } })
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const filtered = settlements?.filter(s =>
    !search || s.patientName.toLowerCase().includes(search.toLowerCase()) || s.policyNumber.includes(search) || (s.claimNumber ?? "").includes(search)
  )

  const selected = settlements?.find(s => s.id === selectedId)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      data: {
        claimNumber: fd.get("claimNumber") as string || null,
        patientName: fd.get("patientName") as string,
        policyNumber: fd.get("policyNumber") as string,
        hospitalName: fd.get("hospitalName") as string,
        admissionDate: fd.get("admissionDate") as string || null,
        dischargeDate: fd.get("dischargeDate") as string || null,
        totalBillAmount: parseFloat(fd.get("totalBillAmount") as string) || 0,
        roomRentCharges: fd.get("roomRentCharges") ? parseFloat(fd.get("roomRentCharges") as string) : null,
        surgeryCharges: fd.get("surgeryCharges") ? parseFloat(fd.get("surgeryCharges") as string) : null,
        medicineCharges: fd.get("medicineCharges") ? parseFloat(fd.get("medicineCharges") as string) : null,
        diagnosticCharges: fd.get("diagnosticCharges") ? parseFloat(fd.get("diagnosticCharges") as string) : null,
        otherCharges: fd.get("otherCharges") ? parseFloat(fd.get("otherCharges") as string) : null,
      }
    })
  }

  const handleApprove = (e: React.FormEvent<HTMLFormElement>, id: number) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    updateMutation.mutate({
      id,
      data: {
        status: "approved",
        admissibleAmount: fd.get("admissibleAmount") ? parseFloat(fd.get("admissibleAmount") as string) : null,
        deductible: fd.get("deductible") ? parseFloat(fd.get("deductible") as string) : null,
        coPayAmount: fd.get("coPayAmount") ? parseFloat(fd.get("coPayAmount") as string) : null,
        nonAdmissibleAmount: fd.get("nonAdmissibleAmount") ? parseFloat(fd.get("nonAdmissibleAmount") as string) : null,
        netPayableAmount: fd.get("netPayableAmount") ? parseFloat(fd.get("netPayableAmount") as string) : null,
        nonAdmissibleReasons: (fd.get("nonAdmissibleReasons") as string || "").split(",").map(r => r.trim()).filter(Boolean),
        paymentMode: fd.get("paymentMode") as any,
        remarks: fd.get("remarks") as string || null,
      }
    }, { onSuccess: () => setSelectedId(null) })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Reimbursement Settlements</h1>
          <p className="text-slate-500 mt-1">Process and track reimbursement claim settlements with full billing breakdown.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25">
          <Plus className="w-4 h-4" />
          New Settlement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: settlements?.length ?? 0, icon: Banknote, color: "text-blue-600 bg-blue-50" },
          { label: "Pending", value: settlements?.filter(s => s.status === "pending").length ?? 0, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Processing", value: settlements?.filter(s => s.status === "processing").length ?? 0, icon: Clock, color: "text-purple-600 bg-purple-50" },
          { label: "Paid", value: settlements?.filter(s => s.status === "paid").length ?? 0, icon: CheckCircle, color: "text-green-600 bg-green-50" },
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, policy, claim..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Settlements List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Loading settlements...</div>
        ) : filtered?.map(s => (
          <Card key={s.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row gap-5">
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{s.patientName}</h3>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{s.policyNumber}</span>
                    {s.claimNumber && <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{s.claimNumber}</span>}
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{s.hospitalName} {s.admissionDate && s.dischargeDate && `· ${formatDate(s.admissionDate)} – ${formatDate(s.dischargeDate)}`}</p>

                  {/* Billing Breakdown */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Billing Breakdown</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
                      {s.roomRentCharges && <div><p className="text-xs text-slate-500">Room Rent</p><p className="font-medium">{formatCurrency(s.roomRentCharges)}</p></div>}
                      {s.surgeryCharges && <div><p className="text-xs text-slate-500">Surgery</p><p className="font-medium">{formatCurrency(s.surgeryCharges)}</p></div>}
                      {s.medicineCharges && <div><p className="text-xs text-slate-500">Medicines</p><p className="font-medium">{formatCurrency(s.medicineCharges)}</p></div>}
                      {s.diagnosticCharges && <div><p className="text-xs text-slate-500">Diagnostics</p><p className="font-medium">{formatCurrency(s.diagnosticCharges)}</p></div>}
                      {s.otherCharges && <div><p className="text-xs text-slate-500">Others</p><p className="font-medium">{formatCurrency(s.otherCharges)}</p></div>}
                    </div>
                    <div className="border-t border-slate-200 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div><p className="text-xs text-slate-500">Total Bill</p><p className="font-bold text-slate-900">{formatCurrency(s.totalBillAmount)}</p></div>
                      {s.admissibleAmount && <div><p className="text-xs text-slate-500">Admissible</p><p className="font-bold text-green-700">{formatCurrency(s.admissibleAmount)}</p></div>}
                      {s.deductible && <div><p className="text-xs text-slate-500">Deductible</p><p className="font-medium text-red-600">{formatCurrency(s.deductible)}</p></div>}
                      {s.coPayAmount && <div><p className="text-xs text-slate-500">Co-pay</p><p className="font-medium text-amber-600">{formatCurrency(s.coPayAmount)}</p></div>}
                      {s.nonAdmissibleAmount && <div><p className="text-xs text-slate-500">Non-admissible</p><p className="font-medium text-red-600">{formatCurrency(s.nonAdmissibleAmount)}</p></div>}
                      {s.netPayableAmount && <div><p className="text-xs text-slate-500">Net Payable</p><p className="font-bold text-primary text-base">{formatCurrency(s.netPayableAmount)}</p></div>}
                    </div>
                    {(s.nonAdmissibleReasons as string[]).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Non-admissible Reasons:</p>
                        <div className="flex flex-wrap gap-1">
                          {(s.nonAdmissibleReasons as string[]).map(r => <span key={r} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">{r}</span>)}
                        </div>
                      </div>
                    )}
                    {s.status === "paid" && s.utrNumber && (
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-slate-500">Payment via {s.paymentMode?.toUpperCase()} · UTR: <span className="font-mono text-slate-700">{s.utrNumber}</span></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {(s.status === "pending" || s.status === "processing") && (
                    <button onClick={() => setSelectedId(s.id)} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 whitespace-nowrap">
                      Process Settlement
                    </button>
                  )}
                  {s.status === "approved" && (
                    <button onClick={() => updateMutation.mutate({ id: s.id, data: { status: "paid", settlementDate: new Date().toISOString(), utrNumber: `UTR${Date.now().toString().slice(-10)}` } })} className="px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 whitespace-nowrap">
                      Mark as Paid
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-5">New Reimbursement Settlement</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Patient Name</label>
                  <input name="patientName" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Claim Number</label>
                  <input name="claimNumber" placeholder="CLM-XXXX" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Policy Number</label>
                  <input name="policyNumber" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Hospital Name</label>
                  <input name="hospitalName" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Admission Date</label>
                  <input name="admissionDate" type="date" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Discharge Date</label>
                  <input name="dischargeDate" type="date" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing Breakdown</p>
              <div className="grid grid-cols-2 gap-3">
                {[["totalBillAmount", "Total Bill Amount *", true], ["roomRentCharges", "Room Rent"], ["surgeryCharges", "Surgery Charges"], ["medicineCharges", "Medicine Charges"], ["diagnosticCharges", "Diagnostic Charges"], ["otherCharges", "Other Charges"]].map(([name, label, required]) => (
                  <div key={name as string}>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">{label}</label>
                    <input name={name as string} type="number" required={!!required} placeholder="₹0" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Creating..." : "Create Settlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Settlement Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Process Settlement</h2>
            <p className="text-sm text-slate-500 mb-5">{selected.patientName} — Total Bill: {formatCurrency(selected.totalBillAmount)}</p>
            <form onSubmit={e => handleApprove(e, selected.id)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[["admissibleAmount", "Admissible Amount"], ["deductible", "Deductible"], ["coPayAmount", "Co-pay Amount"], ["nonAdmissibleAmount", "Non-admissible Amount"], ["netPayableAmount", "Net Payable Amount"]].map(([n, l]) => (
                  <div key={n}>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">{l}</label>
                    <input name={n} type="number" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Payment Mode</label>
                  <select name="paymentMode" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="pending">Pending</option>
                    <option value="neft">NEFT</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Non-admissible Reasons (comma-separated)</label>
                <input name="nonAdmissibleReasons" placeholder="Reason 1, Reason 2..." className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Remarks</label>
                <textarea name="remarks" rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedId(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {updateMutation.isPending ? "Approving..." : "Approve Settlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
