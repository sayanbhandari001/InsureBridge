import React, { useState } from "react"
import { useListClaims, useCreateClaim, type CreateClaimRequest } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Search, X, ChevronDown, ChevronUp, Building2, ShieldCheck, User, Tag } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

type Claim = {
  id: number
  claimNumber: string
  patientName: string
  hospitalName?: string | null
  diagnosis?: string | null
  claimedAmount: number
  approvedAmount?: number | null
  deductible?: number | null
  coPayAmount?: number | null
  netPayableAmount?: number | null
  roomRentCharges?: number | null
  surgeryCharges?: number | null
  medicineCharges?: number | null
  diagnosticCharges?: number | null
  otherCharges?: number | null
  hospitalDiscount?: number | null
  paidByCustomer?: number | null
  paidByInsurer?: number | null
  icdCode?: string | null
  treatmentType?: string | null
  status: string
  claimType: string
  policyNumber: string
  admissionDate?: string | null
  dischargeDate?: string | null
  createdAt: string
}

function BillBreakdown({ claim }: { claim: Claim }) {
  const itemized = [
    { label: "Room Rent", value: claim.roomRentCharges },
    { label: "Surgery / Procedures", value: claim.surgeryCharges },
    { label: "Medicines & Pharmacy", value: claim.medicineCharges },
    { label: "Diagnostics & Lab", value: claim.diagnosticCharges },
    { label: "Other Charges", value: claim.otherCharges },
  ].filter(i => i.value)

  const totalItemized = itemized.reduce((sum, i) => sum + (i.value ?? 0), 0)
  const netAfterDiscount = claim.claimedAmount - (claim.hospitalDiscount ?? 0)

  // Derive paid by customer if not explicitly set
  const derivedCustomer = (claim.deductible ?? 0) + (claim.coPayAmount ?? 0)
  const paidByCustomer = claim.paidByCustomer ?? (derivedCustomer > 0 ? derivedCustomer : null)
  const paidByInsurer = claim.paidByInsurer ?? claim.netPayableAmount

  return (
    <div className="bg-slate-50 rounded-xl p-5 space-y-5">
      {/* 1. Itemized Bill */}
      {itemized.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Bill Breakdown</p>
          <div className="space-y-1.5">
            {itemized.map(i => (
              <div key={i.label} className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{i.label}</span>
                <span className="font-medium text-slate-800">{formatCurrency(i.value!)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm font-semibold border-t border-slate-200 pt-2 mt-2">
              <span className="text-slate-700">Total Billed</span>
              <span className="text-slate-900">{formatCurrency(claim.claimedAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Adjustments */}
      {(claim.hospitalDiscount || claim.approvedAmount) && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Adjustments</p>
          <div className="space-y-1.5">
            {claim.hospitalDiscount && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-green-600" />
                    Hospital Discount
                  </span>
                </div>
                <span className="text-green-600 font-semibold">– {formatCurrency(claim.hospitalDiscount)}</span>
              </div>
            )}
            {claim.approvedAmount && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Approved by Insurance</span>
                <span className="font-medium text-slate-800">{formatCurrency(claim.approvedAmount)}</span>
              </div>
            )}
            {claim.hospitalDiscount && (
              <div className="flex justify-between items-center text-sm font-semibold border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-700">Net Bill after Discount</span>
                <span className="text-slate-900">{formatCurrency(netAfterDiscount)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Who Pays What */}
      {(paidByCustomer || paidByInsurer || claim.deductible || claim.coPayAmount) && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Payment Responsibility</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Insurance Company */}
            {paidByInsurer && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Insurance Co.</span>
                </div>
                <p className="text-xl font-bold text-blue-800">{formatCurrency(paidByInsurer)}</p>
                {claim.netPayableAmount && (
                  <p className="text-xs text-blue-600">Net payable after deductions</p>
                )}
              </div>
            )}

            {/* Customer / Patient */}
            {paidByCustomer && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-amber-700 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Patient</span>
                </div>
                <p className="text-xl font-bold text-amber-800">{formatCurrency(paidByCustomer)}</p>
                <div className="text-xs text-amber-600 space-y-0.5">
                  {claim.deductible && <p>Deductible: {formatCurrency(claim.deductible)}</p>}
                  {claim.coPayAmount && <p>Co-pay: {formatCurrency(claim.coPayAmount)}</p>}
                </div>
              </div>
            )}

            {/* Hospital Discount */}
            {claim.hospitalDiscount && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Hospital Discount</span>
                </div>
                <p className="text-xl font-bold text-green-800">{formatCurrency(claim.hospitalDiscount)}</p>
                <p className="text-xs text-green-600">Waived by hospital</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Final Summary Bar */}
      {(paidByInsurer || paidByCustomer || claim.hospitalDiscount) && (
        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Final Bill Summary</p>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid divide-y divide-slate-100">
              <div className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="text-slate-600 font-medium">Total Bill Raised</span>
                <span className="font-bold text-slate-900">{formatCurrency(claim.claimedAmount)}</span>
              </div>
              {claim.hospitalDiscount && (
                <div className="flex justify-between items-center px-4 py-3 text-sm">
                  <span className="text-green-600 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Hospital Discount
                  </span>
                  <span className="font-semibold text-green-600">– {formatCurrency(claim.hospitalDiscount)}</span>
                </div>
              )}
              {claim.deductible && (
                <div className="flex justify-between items-center px-4 py-3 text-sm">
                  <span className="text-amber-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Patient Deductible
                  </span>
                  <span className="font-semibold text-amber-600">{formatCurrency(claim.deductible)}</span>
                </div>
              )}
              {claim.coPayAmount && (
                <div className="flex justify-between items-center px-4 py-3 text-sm">
                  <span className="text-amber-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Patient Co-pay
                  </span>
                  <span className="font-semibold text-amber-600">{formatCurrency(claim.coPayAmount)}</span>
                </div>
              )}
              {paidByInsurer && (
                <div className="flex justify-between items-center px-4 py-3 text-sm bg-blue-50">
                  <span className="text-blue-700 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Paid by Insurance
                  </span>
                  <span className="font-bold text-blue-700">{formatCurrency(paidByInsurer)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meta */}
      {(claim.icdCode || claim.treatmentType || claim.admissionDate) && (
        <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-500 border-t border-slate-200">
          {claim.icdCode && <span>ICD: <span className="font-mono text-slate-700">{claim.icdCode}</span></span>}
          {claim.treatmentType && <span>Type: <span className="capitalize text-slate-700">{claim.treatmentType}</span></span>}
          {claim.admissionDate && claim.dischargeDate && (
            <span>Stay: {formatDate(claim.admissionDate)} → {formatDate(claim.dischargeDate)}</span>
          )}
        </div>
      )}
    </div>
  )
}

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
      hospitalDiscount: fd.get("hospitalDiscount") ? parseFloat(fd.get("hospitalDiscount") as string) : undefined,
      paidByCustomer: fd.get("paidByCustomer") ? parseFloat(fd.get("paidByCustomer") as string) : undefined,
      paidByInsurer: fd.get("paidByInsurer") ? parseFloat(fd.get("paidByInsurer") as string) : undefined,
    }
    createMutation.mutate({ data })
  }

  const filteredClaims = (claims as Claim[] | undefined)?.filter(c =>
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    c.claimNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Claims Management</h1>
          <p className="text-slate-500 mt-1">Track and manage insurance claims with full payment breakdown.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Claim
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by patient or claim ID..."
          className="pl-9 bg-white border-slate-200"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Claims Table */}
      <Card className="border-none shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 font-medium">Claim ID</th>
                <th className="px-5 py-4 font-medium">Patient</th>
                <th className="px-5 py-4 font-medium">Hospital</th>
                <th className="px-5 py-4 font-medium">Total Bill</th>
                <th className="px-5 py-4 font-medium text-green-700">Hospital Discount</th>
                <th className="px-5 py-4 font-medium text-blue-700">Ins. Pays</th>
                <th className="px-5 py-4 font-medium text-amber-700">Patient Pays</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-500">Loading claims...</td></tr>
              ) : filteredClaims?.map((claim) => {
                const derivedCustomer = (claim.deductible ?? 0) + (claim.coPayAmount ?? 0)
                const paidByCustomer = claim.paidByCustomer ?? (derivedCustomer > 0 ? derivedCustomer : null)
                const paidByInsurer = claim.paidByInsurer ?? claim.netPayableAmount
                const isExpanded = expandedId === claim.id

                return (
                  <React.Fragment key={claim.id}>
                    <tr
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : claim.id)}
                    >
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{claim.claimNumber}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">{claim.patientName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{claim.diagnosis || "—"}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">{claim.hospitalName || "—"}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(claim.claimedAmount)}</td>
                        <td className="px-5 py-4">
                          {claim.hospitalDiscount
                            ? <span className="text-green-700 font-semibold">– {formatCurrency(claim.hospitalDiscount)}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          {paidByInsurer
                            ? <span className="text-blue-700 font-bold">{formatCurrency(paidByInsurer)}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          {paidByCustomer
                            ? <span className="text-amber-700 font-semibold">{formatCurrency(paidByCustomer)}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={claim.status} /></td>
                        <td className="px-5 py-4 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="px-5 pb-5 pt-2 bg-slate-50/40">
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                              <div className="bg-white px-5 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
                                <span className="font-semibold text-slate-800">{claim.patientName}</span>
                                <span className="text-xs text-slate-500">·</span>
                                <span className="text-xs text-slate-500 font-mono">{claim.policyNumber}</span>
                                <span className="text-xs text-slate-500">·</span>
                                <span className="text-xs capitalize text-slate-500">{claim.claimType} claim</span>
                                <span className="ml-auto"><StatusBadge status={claim.status} /></span>
                              </div>
                              <div className="p-5">
                                <BillBreakdown claim={claim} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                )
              })}
              {filteredClaims?.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-500">No claims found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
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

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Bill & Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Total Bill Amount (₹) *</label>
                    <Input name="claimedAmount" type="number" step="0.01" required placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-green-600" /> Hospital Discount (₹)
                    </label>
                    <Input name="hospitalDiscount" type="number" step="0.01" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600" /> Paid by Insurance (₹)
                    </label>
                    <Input name="paidByInsurer" type="number" step="0.01" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-600" /> Paid by Patient (₹)
                    </label>
                    <Input name="paidByCustomer" type="number" step="0.01" placeholder="0" />
                  </div>
                </div>
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
