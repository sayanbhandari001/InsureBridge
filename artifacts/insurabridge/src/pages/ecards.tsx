import { useState } from "react"
import { useListEcards, useCreateEcard, useUpdateEcard } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, CreditCard, Calendar, Users, ShieldCheck } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export default function Ecards() {
  const qc = useQueryClient()
  const { data: ecards, isLoading } = useListEcards()
  const createMutation = useCreateEcard({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/ecards"] }); setOpen(false) } } })
  const updateMutation = useUpdateEcard({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/ecards"] }) } })
  const [open, setOpen] = useState(false)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      data: {
        memberId: parseInt(fd.get("memberId") as string) || 1,
        memberName: fd.get("memberName") as string,
        policyNumber: fd.get("policyNumber") as string,
        insurerName: fd.get("insurerName") as string,
        tpaName: fd.get("tpaName") as string,
        sumInsured: parseFloat(fd.get("sumInsured") as string) || 0,
        validFrom: fd.get("validFrom") as string,
        validTo: fd.get("validTo") as string,
        dependents: [],
      }
    })
  }

  const handleSuspend = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active"
    updateMutation.mutate({ id, data: { status: newStatus as any } })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">E-Cards</h1>
          <p className="text-muted-foreground mt-1">Manage digital insurance cards for members.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          Issue E-Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Cards", value: ecards?.length ?? 0, icon: CreditCard, color: "text-blue-400 bg-blue-500/15" },
          { label: "Active", value: ecards?.filter(e => e.status === "active").length ?? 0, icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/15" },
          { label: "Expired", value: ecards?.filter(e => e.status === "expired").length ?? 0, icon: Calendar, color: "text-amber-400 bg-amber-500/15" },
          { label: "Suspended", value: ecards?.filter(e => e.status === "suspended").length ?? 0, icon: Users, color: "text-red-400 bg-red-500/15" },
        ].map(stat => (
          <Card key={stat.label} className="border-none shadow-md bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Loading e-cards...</div>
        ) : ecards?.map(card => (
          <div key={card.id} className="bg-gradient-to-br from-primary to-primary/70 rounded-2xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Insurance E-Card</p>
                  <h3 className="text-lg font-bold mt-1">{card.memberName}</h3>
                  <p className="text-white/70 text-sm">{card.policyNumber}</p>
                </div>
                <StatusBadge status={card.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-white/60 text-xs">Insurer</p>
                  <p className="font-medium text-sm">{card.insurerName}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">TPA</p>
                  <p className="font-medium text-sm">{card.tpaName}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Sum Insured</p>
                  <p className="font-semibold">{formatCurrency(card.sumInsured)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Card Number</p>
                  <p className="font-mono text-sm">{card.cardNumber}</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/60 text-xs">Valid</p>
                  <p className="text-sm font-medium">{formatDate(card.validFrom)} – {formatDate(card.validTo)}</p>
                  {card.dependents && (card.dependents as string[]).length > 0 && (
                    <p className="text-xs text-white/60 mt-1">+{(card.dependents as string[]).length} dependent(s)</p>
                  )}
                </div>
                <button
                  onClick={() => handleSuspend(card.id, card.status)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                >
                  {card.status === "active" ? "Suspend" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-5">Issue New E-Card</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Member Name</label>
                  <input name="memberName" required placeholder="Full name" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Member ID</label>
                  <input name="memberId" type="number" required placeholder="User ID" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Policy Number</label>
                <input name="policyNumber" required placeholder="e.g. NL-POL-2024-0011" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Insurer Name</label>
                  <input name="insurerName" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">TPA Name</label>
                  <input name="tpaName" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sum Insured (₹)</label>
                <input name="sumInsured" type="number" required placeholder="500000" className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Valid From</label>
                  <input name="validFrom" type="date" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Valid To</label>
                  <input name="validTo" type="date" required className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted/30 transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createMutation.isPending ? "Issuing..." : "Issue Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
