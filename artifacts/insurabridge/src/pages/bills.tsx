import React, { useState } from "react"
import { useListBills, useListClaims } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ShieldCheck, User, Tag, TrendingDown, TrendingUp, Wallet, AlertCircle, ChevronDown, ChevronUp, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Claim = {
  id: number
  claimNumber: string
  patientName: string
  hospitalName?: string | null
  diagnosis?: string | null
  claimedAmount: number
  approvedAmount?: number | null
  hospitalDiscount?: number | null
  paidByCustomer?: number | null
  paidByInsurer?: number | null
  deductible?: number | null
  coPayAmount?: number | null
  netPayableAmount?: number | null
  status: string
  policyNumber: string
  createdAt: string
}

type Bill = {
  id: number
  claimId?: number | null
  billNumber: string
  hospitalName: string
  patientName: string
  totalAmount: number
  approvedAmount?: number | null
  deductible?: number | null
  status: string
  createdAt: string
  notes?: string | null
}

type EnrichedBill = Bill & { claim?: Claim }

function BillDetailPanel({ bill }: { bill: EnrichedBill }) {
  const claim = bill.claim
  const totalBill = bill.totalAmount
  const hospitalDiscount = claim?.hospitalDiscount ?? 0
  const paidByInsurer = claim?.paidByInsurer ?? claim?.netPayableAmount ?? bill.approvedAmount ?? 0
  const paidByCustomer = claim?.paidByCustomer ?? ((claim?.deductible ?? 0) + (claim?.coPayAmount ?? 0)) ?? bill.deductible ?? 0
  const netAfterDiscount = totalBill - hospitalDiscount
  const reconciled = hospitalDiscount + paidByInsurer + paidByCustomer
  const outstanding = netAfterDiscount - paidByInsurer - paidByCustomer

  return (
    <div className="bg-muted/20 border border-border/50 rounded-xl p-5 space-y-5">
      {/* Bill Header */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground border-b border-border/40 pb-3">
        {claim && <span>Claim: <span className="font-mono text-primary">{claim.claimNumber}</span></span>}
        {claim?.diagnosis && <span>Diagnosis: <span className="text-foreground">{claim.diagnosis}</span></span>}
        {claim?.policyNumber && <span>Policy: <span className="font-mono text-foreground">{claim.policyNumber}</span></span>}
        {bill.notes && <span>Note: <span className="text-foreground">{bill.notes}</span></span>}
      </div>

      {/* Bifurcation Ledger */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Bill Bifurcation & Adjustments</p>
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden divide-y divide-border/40">
          {/* Total Bill */}
          <div className="flex justify-between items-center px-4 py-3 text-sm font-semibold">
            <span className="text-foreground">Total Bill Raised</span>
            <span className="text-foreground tabular-nums font-bold">{formatCurrency(totalBill)}</span>
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

          {/* Insurer payment */}
          {paidByInsurer > 0 && (
            <div className="flex justify-between items-center px-4 py-3 text-sm bg-blue-500/5">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Paid by Insurance Company</span>
              </div>
              <span className="font-semibold text-blue-400 tabular-nums">– {formatCurrency(paidByInsurer)}</span>
            </div>
          )}

          {/* Customer payment */}
          {paidByCustomer > 0 && (
            <div className="flex justify-between items-center px-4 py-3 text-sm bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-400">
                <User className="w-3.5 h-3.5" />
                <div>
                  <span>Paid by Patient</span>
                  {(claim?.deductible || claim?.coPayAmount) && (
                    <span className="text-[10px] text-muted-foreground ml-2">
                      {claim?.deductible ? `Deductible ${formatCurrency(claim.deductible)}` : ""}
                      {claim?.deductible && claim?.coPayAmount ? " + " : ""}
                      {claim?.coPayAmount ? `Co-pay ${formatCurrency(claim.coPayAmount)}` : ""}
                    </span>
                  )}
                </div>
              </div>
              <span className="font-semibold text-amber-400 tabular-nums">– {formatCurrency(paidByCustomer)}</span>
            </div>
          )}

          {/* Outstanding */}
          <div className={cn(
            "flex justify-between items-center px-4 py-3 text-sm",
            outstanding > 0 ? "bg-destructive/10" : "bg-green-500/10"
          )}>
            <div className={cn("flex items-center gap-2 font-semibold", outstanding > 0 ? "text-destructive" : "text-green-400")}>
              {outstanding > 0
                ? <><AlertCircle className="w-3.5 h-3.5" /> Outstanding Balance</>
                : <><TrendingDown className="w-3.5 h-3.5" /> Fully Settled</>
              }
            </div>
            <span className={cn("font-bold tabular-nums", outstanding > 0 ? "text-destructive" : "text-green-400")}>
              {outstanding > 0 ? formatCurrency(outstanding) : "₹ 0"}
            </span>
          </div>
        </div>
      </div>

      {/* Payment responsibility cards */}
      {(paidByInsurer > 0 || paidByCustomer > 0 || hospitalDiscount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {paidByInsurer > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Insurance Co.</span>
              </div>
              <p className="text-xl font-bold text-blue-300">{formatCurrency(paidByInsurer)}</p>
              <p className="text-xs text-blue-400/70 mt-1">Net payable amount</p>
            </div>
          )}
          {paidByCustomer > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <User className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Patient</span>
              </div>
              <p className="text-xl font-bold text-amber-300">{formatCurrency(paidByCustomer)}</p>
              <p className="text-xs text-amber-400/70 mt-1">Deductibles + co-pay</p>
            </div>
          )}
          {hospitalDiscount > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Hospital Waived</span>
              </div>
              <p className="text-xl font-bold text-green-300">{formatCurrency(hospitalDiscount)}</p>
              <p className="text-xs text-green-400/70 mt-1">Discount applied</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const FILTER_TABS = ["All", "Approved", "Pending", "Rejected"] as const
type FilterTab = typeof FILTER_TABS[number]

export default function Bills() {
  const { data: bills, isLoading: billsLoading } = useListBills()
  const { data: claims, isLoading: claimsLoading } = useListClaims()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<FilterTab>("All")

  const isLoading = billsLoading || claimsLoading

  const enrichedBills: EnrichedBill[] = (bills as Bill[] | undefined)?.map(bill => {
    const claim = (claims as Claim[] | undefined)?.find(c => c.id === bill.claimId)
    return { ...bill, claim }
  }) ?? []

  const filtered = enrichedBills.filter(b => {
    if (activeTab === "All") return true
    if (activeTab === "Approved") return b.status === "approved" || b.claim?.status === "approved" || b.claim?.status === "settled"
    if (activeTab === "Pending") return b.status === "pending" || b.status === "under_review"
    if (activeTab === "Rejected") return b.status === "rejected"
    return true
  })

  const totalBilled = enrichedBills.reduce((s, b) => s + b.totalAmount, 0)
  const totalDiscounts = enrichedBills.reduce((s, b) => s + (b.claim?.hospitalDiscount ?? 0), 0)
  const totalInsurerPays = enrichedBills.reduce((s, b) => s + (b.claim?.paidByInsurer ?? b.claim?.netPayableAmount ?? b.approvedAmount ?? 0), 0)
  const totalPatientPays = enrichedBills.reduce((s, b) => s + (b.claim?.paidByCustomer ?? (((b.claim?.deductible ?? 0) + (b.claim?.coPayAmount ?? 0)) || (b.deductible ?? 0))), 0)
  const totalOutstanding = totalBilled - totalDiscounts - totalInsurerPays - totalPatientPays

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Financials & Bills</h1>
        <p className="text-muted-foreground mt-1">Settlement breakdown linked to approved claims — full bifurcation view.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Billed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBilled)}</p>
        </Card>

        <Card className="p-4 border-blue-500/20 bg-blue-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">Insurer Pays</span>
          </div>
          <p className="text-2xl font-bold text-blue-300">{formatCurrency(totalInsurerPays)}</p>
        </Card>

        <Card className="p-4 border-amber-500/20 bg-amber-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">Patient Pays</span>
          </div>
          <p className="text-2xl font-bold text-amber-300">{formatCurrency(totalPatientPays)}</p>
        </Card>

        <Card className={cn(
          "p-4",
          totalOutstanding > 0
            ? "border-destructive/20 bg-destructive/10"
            : "border-green-500/20 bg-green-500/10"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center",
              totalOutstanding > 0 ? "bg-destructive/20" : "bg-green-500/20"
            )}>
              {totalOutstanding > 0
                ? <TrendingUp className="w-4 h-4 text-destructive" />
                : <TrendingDown className="w-4 h-4 text-green-400" />}
            </div>
            <span className={cn("text-xs font-medium uppercase tracking-wide",
              totalOutstanding > 0 ? "text-destructive" : "text-green-400"
            )}>Outstanding</span>
          </div>
          <p className={cn("text-2xl font-bold",
            totalOutstanding > 0 ? "text-red-300" : "text-green-300"
          )}>{totalOutstanding > 0 ? formatCurrency(totalOutstanding) : "Settled"}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === tab
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
            {tab !== "All" && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 tabular-nums">
                {enrichedBills.filter(b => {
                  if (tab === "Approved") return b.status === "approved" || b.claim?.status === "approved" || b.claim?.status === "settled"
                  if (tab === "Pending") return b.status === "pending" || b.status === "under_review"
                  if (tab === "Rejected") return b.status === "rejected"
                  return false
                }).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bills Table */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/20 uppercase border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Bill #</th>
                <th className="px-5 py-4 font-medium">Hospital / Patient</th>
                <th className="px-5 py-4 font-medium">Linked Claim</th>
                <th className="px-5 py-4 font-medium text-right">Total Billed</th>
                <th className="px-5 py-4 font-medium text-right text-green-400">– Discount</th>
                <th className="px-5 py-4 font-medium text-right text-blue-400">Insurer Pays</th>
                <th className="px-5 py-4 font-medium text-right text-amber-400">Patient Pays</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      Loading bills…
                    </div>
                  </td>
                </tr>
              ) : filtered.map((bill) => {
                const claim = bill.claim
                const discount = claim?.hospitalDiscount ?? 0
                const insurerPays = claim?.paidByInsurer ?? claim?.netPayableAmount ?? bill.approvedAmount ?? 0
                const patientPays = claim?.paidByCustomer ?? (((claim?.deductible ?? 0) + (claim?.coPayAmount ?? 0)) || (bill.deductible ?? 0))
                const isExpanded = expandedId === bill.id

                return (
                  <React.Fragment key={bill.id}>
                    <tr
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : bill.id)}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                          {bill.billNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{bill.hospitalName}</p>
                        <p className="text-xs text-muted-foreground">{bill.patientName}</p>
                      </td>
                      <td className="px-5 py-4">
                        {claim ? (
                          <div>
                            <span className="font-mono text-xs font-semibold text-primary/80 bg-primary/10 px-2 py-1 rounded">
                              {claim.claimNumber}
                            </span>
                            <div className="mt-1"><StatusBadge status={claim.status} /></div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">No linked claim</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-foreground tabular-nums">
                        {formatCurrency(bill.totalAmount)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        {discount > 0
                          ? <span className="text-green-400 font-semibold">– {formatCurrency(discount)}</span>
                          : <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        {insurerPays > 0
                          ? <span className="text-blue-400 font-bold">{formatCurrency(insurerPays)}</span>
                          : <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        {patientPays > 0
                          ? <span className="text-amber-400 font-semibold">{formatCurrency(patientPays)}</span>
                          : <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={bill.status} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground/50">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${bill.id}-detail`}>
                        <td colSpan={9} className="px-5 pb-5 pt-2 bg-muted/10">
                          <BillDetailPanel bill={bill} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    No bills found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
