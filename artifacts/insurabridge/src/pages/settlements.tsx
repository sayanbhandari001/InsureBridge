import { useState, useMemo } from "react"
import { useListReimbursementSettlements, useCreateReimbursementSettlement, useUpdateReimbursementSettlement } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Banknote, CheckCircle, Clock, Search, X, ChevronDown, ChevronUp, ArrowUpDown, CreditCard, Landmark, Smartphone, Wallet } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"
import { useAuth } from "@/lib/auth"

type SortCol = "date" | "amount" | "status" | "patient"
type SortDir = "asc" | "desc"
type FilterStatus = "all" | "pending" | "processing" | "approved" | "paid" | "rejected"

const FILTER_TABS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
]

const PAYMENT_MODES = [
  { value: "neft", label: "NEFT / RTGS", icon: Landmark },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "cheque", label: "Cheque", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Wallet },
]

export default function Settlements() {
  const { formatAmount } = useCurrency()
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data: settlements, isLoading } = useListReimbursementSettlements()
  const createMutation = useCreateReimbursementSettlement({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/reimbursement-settlements"] }); setOpen(false) } } })
  const updateMutation = useUpdateReimbursementSettlement({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/reimbursement-settlements"] }) } })

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [sortCol, setSortCol] = useState<SortCol>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const selected = settlements?.find(s => s.id === selectedId)

  const isPatient = user?.role === "customer"
  const isHospital = user?.role === "hospital"

  const filtered = useMemo(() => {
    if (!settlements) return []
    let list = [...settlements]

    if (filterStatus !== "all") list = list.filter(s => s.status === filterStatus)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.patientName.toLowerCase().includes(q) ||
        s.policyNumber.toLowerCase().includes(q) ||
        (s.claimNumber ?? "").toLowerCase().includes(q) ||
        s.hospitalName.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let cmp = 0
      if (sortCol === "date") cmp = new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
      else if (sortCol === "amount") cmp = (a.totalBillAmount ?? 0) - (b.totalBillAmount ?? 0)
      else if (sortCol === "patient") cmp = a.patientName.localeCompare(b.patientName)
      else if (sortCol === "status") cmp = a.status.localeCompare(b.status)
      return sortDir === "asc" ? cmp : -cmp
    })
    return list
  }, [settlements, filterStatus, search, sortCol, sortDir])

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortCol(col); setSortDir("desc") }
  }

  const SortIcon = ({ col }: { col: SortCol }) => (
    sortCol === col
      ? (sortDir === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5" /> : <ChevronDown className="inline w-3 h-3 ml-0.5" />)
      : <ArrowUpDown className="inline w-3 h-3 ml-0.5 opacity-30" />
  )

  const stats = useMemo(() => ({
    total: settlements?.length ?? 0,
    pending: settlements?.filter(s => s.status === "pending").length ?? 0,
    processing: settlements?.filter(s => s.status === "processing").length ?? 0,
    approved: settlements?.filter(s => s.status === "approved").length ?? 0,
    paid: settlements?.filter(s => s.status === "paid").length ?? 0,
    totalPaid: settlements?.filter(s => s.status === "paid").reduce((acc, s) => acc + (s.netPayableAmount ?? s.totalBillAmount ?? 0), 0) ?? 0,
  }), [settlements])

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
          <h1 className="text-3xl font-display font-bold text-foreground">Reimbursement Settlements</h1>
          <p className="text-muted-foreground mt-1">
            {isPatient
              ? "View your reimbursement claim status and payout details."
              : "Process and track reimbursement claim settlements with full billing breakdown."}
          </p>
        </div>
        {!isPatient && !isHospital && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25">
            <Plus className="w-4 h-4" />
            New Settlement
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Banknote, color: "text-blue-400 bg-blue-500/15" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-400 bg-amber-500/15" },
          { label: "Processing", value: stats.processing, icon: Clock, color: "text-purple-400 bg-purple-500/15" },
          { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-sky-400 bg-sky-500/15" },
          { label: "Paid", value: stats.paid, icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/15" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-md bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="border-none shadow-md bg-card">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground mb-0.5">Total Paid Out</p>
            <p className="text-lg font-bold text-emerald-400 tabular-nums">{formatAmount(stats.totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, policy, claim, hospital..." className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-muted/30 text-foreground placeholder:text-muted-foreground" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Sort:</span>
          {(["date", "amount", "patient", "status"] as SortCol[]).map(col => (
            <button
              key={col}
              onClick={() => toggleSort(col)}
              className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                sortCol === col ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border hover:bg-muted/40")}
            >
              {col.charAt(0).toUpperCase() + col.slice(1)}
              <SortIcon col={col} />
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} settlement{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit overflow-x-auto">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all",
              filterStatus === tab.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground")}
          >
            {tab.label}
            {tab.value !== "all" && (
              <span className="ml-1 text-[10px] text-muted-foreground/70">
                ({settlements?.filter(s => s.status === tab.value).length ?? 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Settlements List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading settlements...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No settlements match your filters.</div>
        ) : filtered.map(s => {
          const isExpanded = expandedId === s.id
          return (
            <Card key={s.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-card">
              <CardContent className="p-5">
                {/* Header row — click to expand */}
                <div
                  className="flex flex-col lg:flex-row gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{s.patientName}</h3>
                      <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">{s.policyNumber}</span>
                      {s.claimNumber && <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{s.claimNumber}</span>}
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{s.hospitalName}{s.admissionDate && s.dischargeDate && ` · ${formatDate(s.admissionDate)} – ${formatDate(s.dischargeDate)}`}</p>

                    {/* Quick amount summary */}
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Total Bill</p>
                        <p className="font-bold text-foreground tabular-nums">{formatAmount(s.totalBillAmount)}</p>
                      </div>
                      {s.netPayableAmount != null && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Net Payable</p>
                          <p className="font-bold text-primary tabular-nums">{formatAmount(s.netPayableAmount)}</p>
                        </div>
                      )}
                      {s.deductible != null && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Deductible</p>
                          <p className="font-medium text-red-400 tabular-nums">{formatAmount(s.deductible)}</p>
                        </div>
                      )}
                      {s.coPayAmount != null && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Co-pay</p>
                          <p className="font-medium text-amber-400 tabular-nums">{formatAmount(s.coPayAmount)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions + expand toggle */}
                  <div className="flex sm:flex-col gap-2 shrink-0 items-start" onClick={e => e.stopPropagation()}>
                    {(s.status === "pending" || s.status === "processing") && !isPatient && !isHospital && (
                      <button onClick={() => setSelectedId(s.id)} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 whitespace-nowrap">
                        Process
                      </button>
                    )}
                    {s.status === "approved" && !isPatient && !isHospital && (
                      <button
                        onClick={() => updateMutation.mutate({ id: s.id, data: { status: "paid", settlementDate: new Date().toISOString(), utrNumber: `UTR${Date.now().toString().slice(-10)}` } })}
                        className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 whitespace-nowrap"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 text-muted-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-border space-y-4">
                    {/* Billing Breakdown */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Billing Breakdown</p>
                      <div className="bg-muted/20 rounded-xl p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                          {s.roomRentCharges != null && <div><p className="text-xs text-muted-foreground">Room Rent</p><p className="font-medium tabular-nums">{formatAmount(s.roomRentCharges)}</p></div>}
                          {s.surgeryCharges != null && <div><p className="text-xs text-muted-foreground">Surgery</p><p className="font-medium tabular-nums">{formatAmount(s.surgeryCharges)}</p></div>}
                          {s.medicineCharges != null && <div><p className="text-xs text-muted-foreground">Medicines</p><p className="font-medium tabular-nums">{formatAmount(s.medicineCharges)}</p></div>}
                          {s.diagnosticCharges != null && <div><p className="text-xs text-muted-foreground">Diagnostics</p><p className="font-medium tabular-nums">{formatAmount(s.diagnosticCharges)}</p></div>}
                          {s.otherCharges != null && <div><p className="text-xs text-muted-foreground">Others</p><p className="font-medium tabular-nums">{formatAmount(s.otherCharges)}</p></div>}
                        </div>
                        <div className="border-t border-border/50 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div><p className="text-xs text-muted-foreground">Total Bill</p><p className="font-bold text-foreground tabular-nums">{formatAmount(s.totalBillAmount)}</p></div>
                          {s.admissibleAmount != null && <div><p className="text-xs text-muted-foreground">Admissible</p><p className="font-bold text-emerald-400 tabular-nums">{formatAmount(s.admissibleAmount)}</p></div>}
                          {s.deductible != null && <div><p className="text-xs text-muted-foreground">Deductible</p><p className="font-medium text-red-400 tabular-nums">{formatAmount(s.deductible)}</p></div>}
                          {s.coPayAmount != null && <div><p className="text-xs text-muted-foreground">Co-pay</p><p className="font-medium text-amber-400 tabular-nums">{formatAmount(s.coPayAmount)}</p></div>}
                          {s.nonAdmissibleAmount != null && <div><p className="text-xs text-muted-foreground">Non-admissible</p><p className="font-medium text-red-400 tabular-nums">{formatAmount(s.nonAdmissibleAmount)}</p></div>}
                          {s.netPayableAmount != null && <div><p className="text-xs text-muted-foreground">Net Payable</p><p className="font-bold text-primary text-base tabular-nums">{formatAmount(s.netPayableAmount)}</p></div>}
                        </div>
                        {(s.nonAdmissibleReasons as string[]).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">Non-admissible Reasons:</p>
                            <div className="flex flex-wrap gap-1">
                              {(s.nonAdmissibleReasons as string[]).map(r => <span key={r} className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded">{r}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Payment Details</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PAYMENT_MODES.map(mode => (
                          <div key={mode.value} className={cn("bg-muted/20 border border-border/40 rounded-xl p-3", s.paymentMode === mode.value && "border-primary/40 bg-primary/5")}>
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <mode.icon className={cn("w-4 h-4", s.paymentMode === mode.value && "text-primary")} />
                              <span className={cn("text-xs font-semibold", s.paymentMode === mode.value && "text-primary")}>{mode.label}</span>
                              {s.paymentMode === mode.value && <span className="ml-auto text-[9px] bg-primary/20 text-primary px-1.5 rounded font-bold">USED</span>}
                            </div>
                            {s.paymentMode === mode.value && s.utrNumber && (
                              <p className="text-[10px] font-mono text-muted-foreground mt-1 bg-muted/40 rounded px-2 py-1 truncate">{s.utrNumber}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Remarks */}
                    {s.remarks && (
                      <div className="bg-muted/20 rounded-xl p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Remarks</p>
                        <p className="text-sm text-muted-foreground">{s.remarks}</p>
                      </div>
                    )}

                    {/* UTR */}
                    {s.status === "paid" && s.utrNumber && (
                      <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-muted-foreground">Paid via <strong className="text-emerald-400">{s.paymentMode?.toUpperCase()}</strong></span>
                        <span className="text-muted-foreground">· UTR: <span className="font-mono text-emerald-300">{s.utrNumber}</span></span>
                        {s.settlementDate && <span className="ml-auto text-muted-foreground/60">{formatDate(s.settlementDate)}</span>}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-5">New Reimbursement Settlement</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Patient Name <span className="text-destructive">*</span></label>
                  <input name="patientName" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Claim Number</label>
                  <input name="claimNumber" placeholder="CLM-XXXX" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Policy Number <span className="text-destructive">*</span></label>
                  <input name="policyNumber" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Hospital Name <span className="text-destructive">*</span></label>
                  <input name="hospitalName" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Admission Date</label>
                  <input name="admissionDate" type="date" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Discharge Date</label>
                  <input name="dischargeDate" type="date" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billing Breakdown</p>
              <div className="grid grid-cols-2 gap-3">
                {([["totalBillAmount", "Total Bill Amount", true], ["roomRentCharges", "Room Rent"], ["surgeryCharges", "Surgery Charges"], ["medicineCharges", "Medicine Charges"], ["diagnosticCharges", "Diagnostic Charges"], ["otherCharges", "Other Charges"]] as [string, string, boolean?][]).map(([name, label, req]) => (
                  <div key={name}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}{req && <span className="text-destructive ml-1">*</span>}</label>
                    <input name={name} type="number" required={!!req} placeholder="0" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground placeholder:text-muted-foreground" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted/30">Cancel</button>
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
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-1">Process Settlement</h2>
            <p className="text-sm text-muted-foreground mb-5">{selected.patientName} — Total Bill: <strong className="text-foreground">{formatAmount(selected.totalBillAmount)}</strong></p>
            <form onSubmit={e => handleApprove(e, selected.id)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([["admissibleAmount", "Admissible Amount"], ["deductible", "Deductible"], ["coPayAmount", "Co-pay Amount"], ["nonAdmissibleAmount", "Non-admissible Amount"], ["netPayableAmount", "Net Payable Amount"]] as [string, string][]).map(([n, l]) => (
                  <div key={n}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{l}</label>
                    <input name={n} type="number" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Mode</label>
                  <select name="paymentMode" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground">
                    <option value="pending">Pending</option>
                    <option value="neft">NEFT / RTGS</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Non-admissible Reasons (comma-separated)</label>
                <input name="nonAdmissibleReasons" placeholder="Reason 1, Reason 2..." className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card text-foreground placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Remarks</label>
                <textarea name="remarks" rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-card text-foreground" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedId(null)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted/30">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
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
