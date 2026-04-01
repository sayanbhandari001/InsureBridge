import React, { useState } from "react"
import { useListClaims, useCreateClaim, type CreateClaimRequest } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Search, X, ChevronDown, ChevronUp, Building2, ShieldCheck, User, Tag, AlertCircle, TrendingDown, Clock, CreditCard, Banknote, Smartphone, ArrowUpDown, Eye, Info } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"
import { useLocale } from "@/lib/locale-context"
import { useAuth } from "@/lib/auth"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const TAT_DAYS = 30

function tatDays(createdAt: string, status: string) {
  if (status === "approved" || status === "rejected" || status === "settled") return null
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return days
}

const PAYMENT_MODES = [
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "neft", label: "NEFT / RTGS", icon: ArrowUpDown },
]

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

  const derivedCustomer = (claim.deductible ?? 0) + (claim.coPayAmount ?? 0)
  const paidByCustomer = claim.paidByCustomer ?? (derivedCustomer > 0 ? derivedCustomer : null)
  const paidByInsurer = claim.paidByInsurer ?? claim.netPayableAmount
  const hospitalDiscount = claim.hospitalDiscount ?? 0
  const netAfterDiscount = claim.claimedAmount - hospitalDiscount
  const outstanding = netAfterDiscount - (paidByInsurer ?? 0) - (paidByCustomer ?? 0)

  return (
    <div className="bg-muted/20 rounded-xl p-5 space-y-5">
      {/* 1. Itemized Bill */}
      {itemized.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Bill Breakdown</p>
          <div className="space-y-1.5">
            {itemized.map(i => (
              <div key={i.label} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{i.label}</span>
                <span className="font-medium text-foreground tabular-nums">{formatCurrency(i.value!)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm font-semibold border-t border-border/50 pt-2 mt-2">
              <span className="text-foreground">Total Billed</span>
              <span className="text-foreground tabular-nums font-bold">{formatCurrency(claim.claimedAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Bifurcation Ledger */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Payment Bifurcation</p>
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden divide-y divide-border/40">
          {/* Total */}
          <div className="flex justify-between items-center px-4 py-3 text-sm font-semibold">
            <span className="text-foreground">Total Bill Raised</span>
            <span className="text-foreground tabular-nums font-bold">{formatCurrency(claim.claimedAmount)}</span>
          </div>

          {/* Hospital Discount */}
          {hospitalDiscount > 0 && (
            <div className="flex justify-between items-center px-4 py-3 text-sm bg-green-500/5">
              <div className="flex items-center gap-2 text-green-400">
                <Tag className="w-3.5 h-3.5" />
                <span>Hospital Discount</span>
              </div>
              <span className="font-semibold text-green-400 tabular-nums">– {formatCurrency(hospitalDiscount)}</span>
            </div>
          )}

          {/* Net after discount */}
          {hospitalDiscount > 0 && (
            <div className="flex justify-between items-center px-4 py-3 text-sm bg-muted/20">
              <span className="text-muted-foreground">Net Bill after Discount</span>
              <span className="font-semibold text-foreground tabular-nums">{formatCurrency(netAfterDiscount)}</span>
            </div>
          )}

          {/* Insurer */}
          {paidByInsurer != null && paidByInsurer > 0 && (
            <div className="flex justify-between items-center px-4 py-3 text-sm bg-blue-500/5">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Paid by Insurance Company</span>
              </div>
              <span className="font-semibold text-blue-400 tabular-nums">– {formatCurrency(paidByInsurer)}</span>
            </div>
          )}

          {/* Deductible */}
          {claim.deductible != null && claim.deductible > 0 && (
            <div className="flex justify-between items-center px-4 py-3 text-sm bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-400">
                <User className="w-3.5 h-3.5" />
                <span>Patient Deductible</span>
              </div>
              <span className="font-semibold text-amber-400 tabular-nums">– {formatCurrency(claim.deductible)}</span>
            </div>
          )}

          {/* Co-pay */}
          {claim.coPayAmount != null && claim.coPayAmount > 0 && (
            <div className="flex justify-between items-center px-4 py-3 text-sm bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-400">
                <User className="w-3.5 h-3.5" />
                <span>Patient Co-pay</span>
              </div>
              <span className="font-semibold text-amber-400 tabular-nums">– {formatCurrency(claim.coPayAmount)}</span>
            </div>
          )}

          {/* Outstanding / Settled */}
          {(paidByInsurer != null || paidByCustomer != null || hospitalDiscount > 0) && (
            <div className={cn(
              "flex justify-between items-center px-4 py-3 text-sm",
              outstanding > 1 ? "bg-destructive/10" : "bg-green-500/10"
            )}>
              <div className={cn(
                "flex items-center gap-2 font-semibold",
                outstanding > 1 ? "text-destructive" : "text-green-400"
              )}>
                {outstanding > 1
                  ? <><AlertCircle className="w-3.5 h-3.5" /> Outstanding</>
                  : <><TrendingDown className="w-3.5 h-3.5" /> Settled</>
                }
              </div>
              <span className={cn(
                "font-bold tabular-nums",
                outstanding > 1 ? "text-destructive" : "text-green-400"
              )}>
                {outstanding > 1 ? formatCurrency(outstanding) : "₹ 0"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Payment Responsibility Cards */}
      {(paidByCustomer || paidByInsurer || hospitalDiscount > 0) && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Responsibility Split</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {paidByInsurer != null && paidByInsurer > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Insurance Co.</span>
                </div>
                <p className="text-xl font-bold text-blue-300 tabular-nums">{formatCurrency(paidByInsurer)}</p>
                <p className="text-xs text-blue-400/70 mt-1">Net payable</p>
              </div>
            )}
            {paidByCustomer != null && paidByCustomer > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Patient</span>
                </div>
                <p className="text-xl font-bold text-amber-300 tabular-nums">{formatCurrency(paidByCustomer)}</p>
                <div className="text-xs text-amber-400/70 space-y-0.5 mt-1">
                  {claim.deductible != null && claim.deductible > 0 && <p>Deductible: {formatCurrency(claim.deductible)}</p>}
                  {claim.coPayAmount != null && claim.coPayAmount > 0 && <p>Co-pay: {formatCurrency(claim.coPayAmount)}</p>}
                </div>
              </div>
            )}
            {hospitalDiscount > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Hospital Waived</span>
                </div>
                <p className="text-xl font-bold text-green-300 tabular-nums">{formatCurrency(hospitalDiscount)}</p>
                <p className="text-xs text-green-400/70 mt-1">Discount applied</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meta */}
      {(claim.icdCode || claim.treatmentType || claim.admissionDate) && (
        <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground/60 border-t border-border/40">
          {claim.icdCode && <span>ICD: <span className="font-mono text-muted-foreground">{claim.icdCode}</span></span>}
          {claim.treatmentType && <span>Type: <span className="capitalize text-muted-foreground">{claim.treatmentType}</span></span>}
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
  const { formatAmount } = useCurrency()
  const { formatDate: fmtDate } = useLocale()
  const { user } = useAuth()
  const { data: claims, isLoading } = useListClaims()

  const isPatient = user?.role === "customer"
  const isHospital = user?.role === "hospital"
  const canCreate = !isPatient
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"tat" | "date" | "amount" | "status">("tat")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

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

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortBy(col); setSortDir("desc") }
  }

  function SortIcon({ col }: { col: typeof sortBy }) {
    if (sortBy !== col) return <ChevronDown className="w-3 h-3 opacity-30 inline-block ml-0.5" />
    return sortDir === "desc"
      ? <ChevronDown className="w-3 h-3 inline-block ml-0.5 text-primary" />
      : <ChevronUp className="w-3 h-3 inline-block ml-0.5 text-primary" />
  }

  const filteredClaims = (claims as Claim[] | undefined)
    ?.filter(c => {
      const q = search.toLowerCase()
      if (q && !c.patientName.toLowerCase().includes(q) && !c.claimNumber.toLowerCase().includes(q) && !(c.hospitalName ?? "").toLowerCase().includes(q)) return false
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (typeFilter !== "all" && c.claimType !== typeFilter) return false
      return true
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === "tat") {
        const tA = tatDays(a.createdAt, a.status) ?? -1
        const tB = tatDays(b.createdAt, b.status) ?? -1
        cmp = tA - tB
      } else if (sortBy === "date") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === "amount") {
        cmp = a.claimedAmount - b.claimedAmount
      } else if (sortBy === "status") {
        cmp = a.status.localeCompare(b.status)
      }
      return sortDir === "desc" ? -cmp : cmp
    })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {isPatient ? "My Claims" : isHospital ? "Cashless Claims" : "Claims Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPatient
              ? "View the status and details of your submitted insurance claims."
              : isHospital
              ? "Manage cashless claim approvals and track payment status from insurers."
              : "Track and manage insurance claims with full payment bifurcation. Default sort: TAT exceeded (longest first)."}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Claim
          </Button>
        )}
      </div>

      {/* Role-based banners */}
      {isPatient && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm">
          <Eye className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-blue-300">You are viewing your claims in read-only mode. Contact your TPA or insurer for any queries.</p>
        </div>
      )}
      {isHospital && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm">
          <Info className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-green-300">Showing cashless claim requests for your facility. Reimbursement claims are managed by TPA/Insurer.</p>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search by patient, claim ID, hospital..."
            className="pl-9 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg bg-muted/40 border border-border text-foreground outline-none">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="settled">Settled</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg bg-muted/40 border border-border text-foreground outline-none">
          <option value="all">All Types</option>
          <option value="cashless">Cashless</option>
          <option value="reimbursement">Reimbursement</option>
        </select>
        {(search || statusFilter !== "all" || typeFilter !== "all") && (
          <button onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all") }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filteredClaims?.length ?? 0} claim{filteredClaims?.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Claims Table */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/20 uppercase border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Claim ID</th>
                <th className="px-5 py-4 font-medium">Patient</th>
                <th className="px-5 py-4 font-medium">Hospital</th>
                <th className="px-5 py-4 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("amount")}>
                  Total Bill <SortIcon col="amount" />
                </th>
                <th className="px-5 py-4 font-medium text-green-400">– Discount</th>
                <th className="px-5 py-4 font-medium text-blue-400">Insurer Pays</th>
                <th className="px-5 py-4 font-medium text-amber-400">Patient Pays</th>
                <th className="px-5 py-4 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("status")}>
                  Status <SortIcon col="status" />
                </th>
                <th className="px-5 py-4 font-medium cursor-pointer hover:text-foreground text-red-400" onClick={() => toggleSort("tat")}>
                  TAT <SortIcon col="tat" />
                </th>
                <th className="px-5 py-4 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      Loading claims…
                    </div>
                  </td>
                </tr>
              ) : filteredClaims?.map((claim) => {
                const derivedCustomer = (claim.deductible ?? 0) + (claim.coPayAmount ?? 0)
                const paidByCustomer = claim.paidByCustomer ?? (derivedCustomer > 0 ? derivedCustomer : null)
                const paidByInsurer = claim.paidByInsurer ?? claim.netPayableAmount
                const isExpanded = expandedId === claim.id

                return (
                  <React.Fragment key={claim.id}>
                    <tr
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : claim.id)}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{claim.claimNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-foreground">{claim.patientName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{claim.diagnosis || "—"}</div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{claim.hospitalName || "—"}</td>
                      <td className="px-5 py-4 font-bold text-foreground tabular-nums">{formatAmount(claim.claimedAmount)}</td>
                      <td className="px-5 py-4 tabular-nums">
                        {claim.hospitalDiscount
                          ? <span className="text-green-400 font-semibold">– {formatAmount(claim.hospitalDiscount)}</span>
                          : <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="px-5 py-4 tabular-nums">
                        {paidByInsurer
                          ? <span className="text-blue-400 font-bold">{formatAmount(paidByInsurer)}</span>
                          : <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="px-5 py-4 tabular-nums">
                        {paidByCustomer
                          ? <span className="text-amber-400 font-semibold">{formatAmount(paidByCustomer)}</span>
                          : <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={claim.status} /></td>
                      <td className="px-5 py-4">
                        {(() => {
                          const tat = tatDays(claim.createdAt, claim.status)
                          if (tat === null) return <span className="text-muted-foreground/30 text-xs">—</span>
                          const exceeded = tat > TAT_DAYS
                          return (
                            <span className={cn("flex items-center gap-1 text-xs font-semibold",
                              exceeded ? "text-red-500" : tat > TAT_DAYS * 0.8 ? "text-amber-500" : "text-green-500")}>
                              <Clock className="w-3 h-3" />
                              {tat}d{exceeded ? " !" : ""}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground/50">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className="px-5 pb-5 pt-2 bg-muted/10">
                          <div className="border border-border/50 rounded-xl overflow-hidden">
                            <div className="bg-card px-5 py-3 border-b border-border/50 flex items-center gap-3 flex-wrap">
                              <span className="font-semibold text-foreground">{claim.patientName}</span>
                              <span className="text-xs text-muted-foreground/40">·</span>
                              <span className="text-xs text-muted-foreground font-mono">{claim.policyNumber}</span>
                              <span className="text-xs text-muted-foreground/40">·</span>
                              <span className="text-xs capitalize text-muted-foreground">{claim.claimType} claim</span>
                              <span className="text-xs text-muted-foreground/40">·</span>
                              <span className="text-xs text-muted-foreground">Filed: {fmtDate(claim.createdAt)}</span>
                              <span className="ml-auto"><StatusBadge status={claim.status} /></span>
                            </div>
                            <div className="p-5 space-y-5">
                              <BillBreakdown claim={claim} />
                              {/* Payment Mode Section */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Payment Mode Details</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {PAYMENT_MODES.map(mode => (
                                    <div key={mode.value} className="bg-muted/20 border border-border/40 rounded-xl p-3">
                                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <mode.icon className="w-4 h-4" />
                                        <span className="text-xs font-semibold">{mode.label}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground/60">
                                        {mode.value === "upi" && "UPI reference / VPA"}
                                        {mode.value === "card" && "Debit / Credit card"}
                                        {mode.value === "cash" && "Cash payment receipt"}
                                        {mode.value === "neft" && "Bank transfer / RTGS"}
                                      </p>
                                      <p className="mt-1.5 text-[10px] bg-card border border-border/30 rounded px-2 py-1 text-muted-foreground/50 font-mono">
                                        {mode.value === "upi" ? "—" : mode.value === "neft" ? "—" : "—"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {filteredClaims?.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">No claims found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">Create New Claim</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Patient Name</label>
                  <Input name="patientName" required placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Customer ID</label>
                  <Input name="customerId" type="number" required defaultValue="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Policy Number</label>
                  <Input name="policyNumber" required placeholder="POL-12345" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Claim Type</label>
                  <select name="claimType" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="cashless">Cashless</option>
                    <option value="reimbursement">Reimbursement</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Hospital Name</label>
                <Input name="hospitalName" placeholder="City General Hospital" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Diagnosis</label>
                <Input name="diagnosis" placeholder="Viral Fever" />
              </div>

              <div className="border-t border-border/50 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Bill Bifurcation</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Total Bill Amount (₹) *</label>
                    <Input name="claimedAmount" type="number" step="0.01" required placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-green-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Hospital Discount (₹)
                    </label>
                    <Input name="hospitalDiscount" type="number" step="0.01" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-blue-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Paid by Insurance (₹)
                    </label>
                    <Input name="paidByInsurer" type="number" step="0.01" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> Paid by Patient (₹)
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
