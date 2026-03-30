import { useState } from "react"
import { useListClaims, useCreateClaim, type CreateClaimRequest } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Search, X, ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export default function Claims() {
  const queryClient = useQueryClient()
  const { data: claims, isLoading } = useListClaims()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const createMutation = useCreateClaim({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/claims"] })
        setIsCreateOpen(false)
      }
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: CreateClaimRequest = {
      customerId: parseInt(fd.get("customerId") as string) || 1,
      patientName: fd.get("patientName") as string,
      claimType: fd.get("claimType") as any,
      claimedAmount: parseFloat(fd.get("claimedAmount") as string) || 0,
      policyNumber: fd.get("policyNumber") as string,
      hospitalName: fd.get("hospitalName") as string,
      diagnosis: fd.get("diagnosis") as string,
    }
    createMutation.mutate({ data })
  }

  const filteredClaims = claims?.filter(c =>
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    c.claimNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Claims Management</h1>
          <p className="text-slate-500 mt-1">Track and manage insurance claims across all parties.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Claim
        </Button>
      </div>

      <Card className="border-none shadow-md">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search claims..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Claim ID</th>
                <th className="px-6 py-4 font-medium">Patient Details</th>
                <th className="px-6 py-4 font-medium">Hospital</th>
                <th className="px-6 py-4 font-medium">Claimed</th>
                <th className="px-6 py-4 font-medium">Net Payable</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">Loading claims...</td></tr>
              ) : filteredClaims?.map((claim) => (
                <>
                  <tr
                    key={claim.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === claim.id ? null : claim.id)}
                  >
                    <td className="px-6 py-4 font-medium text-primary font-mono">{claim.claimNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{claim.patientName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{claim.diagnosis || "No diagnosis"}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{claim.hospitalName || "N/A"}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(claim.claimedAmount)}</td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {(claim as any).netPayableAmount ? formatCurrency((claim as any).netPayableAmount) : "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(claim.createdAt)}</td>
                    <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                    <td className="px-6 py-4 text-slate-400">
                      {expandedId === claim.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>

                  {expandedId === claim.id && (
                    <tr key={`expand-${claim.id}`} className="bg-slate-50/50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {/* Billing Breakdown */}
                          <div className="col-span-2 sm:col-span-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Billing Breakdown</p>
                          </div>
                          {[
                            ["Room Rent", (claim as any).roomRentCharges],
                            ["Surgery", (claim as any).surgeryCharges],
                            ["Medicines", (claim as any).medicineCharges],
                            ["Diagnostics", (claim as any).diagnosticCharges],
                            ["Other Charges", (claim as any).otherCharges],
                          ].filter(([, v]) => v).map(([label, value]) => (
                            <div key={label as string} className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-500">{label as string}</p>
                              <p className="font-semibold text-slate-900 mt-0.5">{formatCurrency(value as number)}</p>
                            </div>
                          ))}
                          {/* Settlement Summary */}
                          {((claim as any).deductible || (claim as any).coPayAmount || (claim as any).netPayableAmount) && (
                            <>
                              <div className="col-span-2 sm:col-span-4 pt-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Settlement Summary</p>
                              </div>
                              {[
                                ["Deductible", (claim as any).deductible, "text-red-600"],
                                ["Co-Pay", (claim as any).coPayAmount, "text-amber-600"],
                                ["Net Payable", (claim as any).netPayableAmount, "text-primary font-bold"],
                              ].filter(([, v]) => v).map(([label, value, cls]) => (
                                <div key={label as string} className="bg-white rounded-lg p-3 border border-slate-200">
                                  <p className="text-xs text-slate-500">{label as string}</p>
                                  <p className={`font-semibold mt-0.5 ${cls as string}`}>{formatCurrency(value as number)}</p>
                                </div>
                              ))}
                            </>
                          )}
                          {(claim as any).icdCode && (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-500">ICD Code</p>
                              <p className="font-mono text-slate-800 mt-0.5">{(claim as any).icdCode}</p>
                            </div>
                          )}
                          {(claim as any).treatmentType && (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-500">Treatment</p>
                              <p className="capitalize text-slate-800 mt-0.5">{(claim as any).treatmentType}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filteredClaims?.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500 bg-slate-50/30">No claims found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Create New Claim</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Patient Name</label>
                  <Input name="patientName" required placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Customer ID</label>
                  <Input name="customerId" type="number" required defaultValue="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Policy Number</label>
                  <Input name="policyNumber" required placeholder="POL-12345" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Claim Type</label>
                  <select name="claimType" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="cashless">Cashless</option>
                    <option value="reimbursement">Reimbursement</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Hospital Name</label>
                <Input name="hospitalName" placeholder="City General Hospital" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Diagnosis</label>
                <Input name="diagnosis" placeholder="Viral Fever" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Claim Amount (₹)</label>
                <Input name="claimedAmount" type="number" step="0.01" required placeholder="1500.00" />
              </div>
              <div className="pt-2 flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Submit Claim"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
