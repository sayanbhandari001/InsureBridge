import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useCurrency } from "@/lib/currency-context"
import { useLocale } from "@/lib/locale-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Ticket, Plus, Search, AlertTriangle, CheckCircle2, Clock,
  ChevronDown, ChevronUp, User, Building2, Banknote, MessageSquare,
  Filter, X
} from "lucide-react"
import { cn } from "@/lib/utils"

type TicketPriority = "high" | "medium" | "low"
type TicketStatus = "open" | "in_progress" | "resolved" | "closed"
type PaymentParty = "insurer" | "hospital" | "customer" | "tpa"

interface TicketItem {
  id: number
  ticketNumber: string
  title: string
  description: string
  claimNumber?: string
  policyNumber?: string
  patientName: string
  billAmount: number
  unsettledAmount: number
  partyResponsible: PaymentParty
  priority: TicketPriority
  status: TicketStatus
  raisedBy: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

const SAMPLE_TICKETS: TicketItem[] = [
  {
    id: 1, ticketNumber: "TKT-2026-001",
    title: "Claim balance unpaid by Insurance Company",
    description: "Patient bill of ₹2,40,000 has been partially settled. ₹85,000 remains unpaid by the insurer despite 45 days post-discharge.",
    claimNumber: "CLM-2026-0011", policyNumber: "NL-POL-2024-0011",
    patientName: "Rahul Sharma",
    billAmount: 240000, unsettledAmount: 85000,
    partyResponsible: "insurer", priority: "high", status: "open",
    raisedBy: "City General Hospital", assignedTo: "MediTPA Services",
    createdAt: "2026-03-15T10:00:00Z", updatedAt: "2026-03-28T14:00:00Z",
    notes: "Hospital has sent 3 reminders. No response from insurer."
  },
  {
    id: 2, ticketNumber: "TKT-2026-002",
    title: "Co-payment not collected from patient",
    description: "Patient co-pay of ₹12,000 was not collected at discharge. Hospital is seeking InsuraBridge intervention.",
    claimNumber: "CLM-2026-0022", policyNumber: "NL-POL-2025-0088",
    patientName: "Priya Mehta",
    billAmount: 120000, unsettledAmount: 12000,
    partyResponsible: "customer", priority: "medium", status: "in_progress",
    raisedBy: "MediTPA Services", assignedTo: "InsuraBridge Admin",
    createdAt: "2026-03-20T09:00:00Z", updatedAt: "2026-03-30T11:00:00Z",
    notes: "Patient confirmed availability for payment. Scheduled for April 5."
  },
  {
    id: 3, ticketNumber: "TKT-2026-003",
    title: "TPA processing fee dispute",
    description: "Insurance company disputes TPA service fee invoiced for claim CLM-2026-0033. Excess of ₹8,500 charged beyond agreed rate.",
    claimNumber: "CLM-2026-0033",
    patientName: "Arun Kumar",
    billAmount: 45000, unsettledAmount: 8500,
    partyResponsible: "tpa", priority: "low", status: "resolved",
    raisedBy: "NationalLife Insurance", assignedTo: "InsuraBridge Admin",
    createdAt: "2026-02-10T08:00:00Z", updatedAt: "2026-03-05T16:00:00Z",
    notes: "TPA agreed to credit excess amount. Resolved."
  },
]

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
}

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-muted text-muted-foreground",
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
}

const PARTY_LABELS: Record<PaymentParty, string> = {
  insurer: "Insurance Company",
  hospital: "Hospital",
  customer: "Patient Party",
  tpa: "TPA",
}

export default function Tickets() {
  const { user } = useAuth()
  const { formatAmount } = useCurrency()
  const { formatDate } = useLocale()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"priority" | "date" | "amount">("priority")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const priorityWeight = { high: 3, medium: 2, low: 1 }

  const filtered = SAMPLE_TICKETS
    .filter(t => {
      const q = search.toLowerCase()
      if (q && !t.title.toLowerCase().includes(q) && !t.ticketNumber.toLowerCase().includes(q) && !t.patientName.toLowerCase().includes(q)) return false
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false
      return true
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === "priority") cmp = priorityWeight[a.priority] - priorityWeight[b.priority]
      else if (sortBy === "date") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      else if (sortBy === "amount") cmp = a.unsettledAmount - b.unsettledAmount
      return sortDir === "desc" ? -cmp : cmp
    })

  const stats = {
    open: SAMPLE_TICKETS.filter(t => t.status === "open").length,
    in_progress: SAMPLE_TICKETS.filter(t => t.status === "in_progress").length,
    resolved: SAMPLE_TICKETS.filter(t => t.status === "resolved").length,
    totalUnsettled: SAMPLE_TICKETS.filter(t => t.status !== "resolved" && t.status !== "closed").reduce((s, t) => s + t.unsettledAmount, 0),
  }

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortBy(col); setSortDir("desc") }
  }

  function SortIcon({ col }: { col: typeof sortBy }) {
    if (sortBy !== col) return <ChevronDown className="w-3 h-3 opacity-30" />
    return sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Ticket className="w-7 h-7 text-primary" /> Dispute Tickets
          </h1>
          <p className="text-muted-foreground mt-1">
            InsuraBridge resolution centre for unsettled bills and payment disputes between parties.
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "tpa") && (
          <Button onClick={() => setNewTicketOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Raise Ticket
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Open Tickets",    value: stats.open,        color: "#f87171", icon: AlertTriangle },
          { label: "In Progress",     value: stats.in_progress, color: "#fbbf24", icon: Clock },
          { label: "Resolved",        value: stats.resolved,    color: "#34d399", icon: CheckCircle2 },
          { label: "Unsettled Amount",value: formatAmount(stats.totalUnsettled), color: "#a78bfa", icon: Banknote },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-md bg-card">
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: s.color + "22" }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md bg-card">
        <div className="p-4 border-b border-border/50 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input placeholder="Search tickets, patient name..." className="pl-9 bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg bg-muted/40 border border-border text-foreground outline-none"
          >
            <option value="all">All Status</option>
            {(["open","in_progress","resolved","closed"] as TicketStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg bg-muted/40 border border-border text-foreground outline-none"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {(search || statusFilter !== "all" || priorityFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); setPriorityFilter("all") }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Sort bar */}
        <div className="px-4 py-2 border-b border-border/30 flex items-center gap-1 text-xs text-muted-foreground">
          <span className="mr-2">Sort by:</span>
          {[["priority","Priority"],["date","Date"],["amount","Amount"]] .map(([col, label]) => (
            <button key={col} onClick={() => toggleSort(col as typeof sortBy)}
              className={cn("flex items-center gap-1 px-2 py-1 rounded transition-colors",
                sortBy === col ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/40")}
            >
              {label} <SortIcon col={col as typeof sortBy} />
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div className="divide-y divide-border/40">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No tickets found matching your filters.</p>
            </div>
          ) : filtered.map(ticket => {
            const expanded = expandedId === ticket.id
            return (
              <div key={ticket.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : ticket.id)}>
                  <div className="shrink-0 mt-0.5">
                    <div className={cn("w-2.5 h-2.5 rounded-full mt-1", {
                      "bg-red-500": ticket.priority === "high",
                      "bg-amber-500": ticket.priority === "medium",
                      "bg-blue-400": ticket.priority === "low",
                    })} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground/70">{ticket.ticketNumber}</span>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", PRIORITY_COLORS[ticket.priority])}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", STATUS_COLORS[ticket.status])}>
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{ticket.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.patientName}</span>
                      {ticket.claimNumber && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{ticket.claimNumber}</span>}
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        Unsettled: {formatAmount(ticket.unsettledAmount)}
                      </span>
                      <span>Responsible: <span className="font-medium text-foreground">{PARTY_LABELS[ticket.partyResponsible]}</span></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                    {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground mt-2 ml-auto" /> : <ChevronDown className="w-4 h-4 text-muted-foreground mt-2 ml-auto" />}
                  </div>
                </div>

                {expanded && (
                  <div className="mt-4 ml-6 space-y-3">
                    <div className="bg-muted/30 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
                      {ticket.description}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-muted-foreground/70 mb-1">Total Bill</p>
                        <p className="font-bold text-foreground">{formatAmount(ticket.billAmount)}</p>
                      </div>
                      <div className="bg-amber-500/10 rounded-lg p-3">
                        <p className="text-muted-foreground/70 mb-1">Unsettled</p>
                        <p className="font-bold text-amber-600">{formatAmount(ticket.unsettledAmount)}</p>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-muted-foreground/70 mb-1">Raised By</p>
                        <p className="font-semibold text-foreground">{ticket.raisedBy}</p>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-muted-foreground/70 mb-1">Assigned To</p>
                        <p className="font-semibold text-foreground">{ticket.assignedTo ?? "Unassigned"}</p>
                      </div>
                    </div>

                    {ticket.notes && (
                      <div className="flex items-start gap-2 text-xs bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <MessageSquare className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-muted-foreground">{ticket.notes}</p>
                      </div>
                    )}

                    {user?.role === "admin" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Add Note
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Raise Ticket Dialog */}
      <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
        <DialogContent onClose={() => setNewTicketOpen(false)}>
          <DialogHeader>
            <DialogTitle>Raise Dispute Ticket</DialogTitle>
            <DialogDescription>Document an unsettled bill or payment dispute for InsuraBridge resolution.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={e => { e.preventDefault(); setNewTicketOpen(false) }}>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title <span className="text-red-500">*</span></label>
              <Input required placeholder="Brief description of the dispute..." className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Claim Number</label>
                <Input placeholder="CLM-2026-XXXX" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Policy Number</label>
                <Input placeholder="NL-POL-XXXX" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Patient Name <span className="text-red-500">*</span></label>
                <Input required placeholder="Patient full name" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Unsettled Amount (₹) <span className="text-red-500">*</span></label>
                <Input required type="number" placeholder="0.00" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Responsible Party <span className="text-red-500">*</span></label>
                <select required className="w-full mt-1 px-3 py-2 text-sm rounded-lg bg-muted/40 border border-border text-foreground outline-none">
                  <option value="">Select party...</option>
                  {Object.entries(PARTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Priority <span className="text-red-500">*</span></label>
                <select required className="w-full mt-1 px-3 py-2 text-sm rounded-lg bg-muted/40 border border-border text-foreground outline-none">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description <span className="text-red-500">*</span></label>
              <textarea required rows={3} placeholder="Describe the dispute in detail..." className="w-full mt-1 px-3 py-2 text-sm rounded-lg bg-muted/40 border border-border text-foreground outline-none resize-none focus:border-primary" />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button type="button" variant="ghost" onClick={() => setNewTicketOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Ticket</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FileText({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
}
