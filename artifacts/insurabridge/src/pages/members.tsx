import { useState } from "react"
import { useListMembers, useAddMember } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, UserPlus, Search } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

const RELATION_LABELS: Record<string, string> = {
  self: "Self", spouse: "Spouse", child: "Child",
  parent: "Parent", parent_in_law: "Parent-in-law", sibling: "Sibling",
}

const RELATION_COLORS: Record<string, string> = {
  self: "bg-blue-100 text-blue-700", spouse: "bg-pink-100 text-pink-700",
  child: "bg-amber-100 text-amber-700", parent: "bg-green-100 text-green-700",
  parent_in_law: "bg-purple-100 text-purple-700", sibling: "bg-teal-100 text-teal-700",
}

export default function Members() {
  const qc = useQueryClient()
  const { data: members, isLoading } = useListMembers()
  const addMutation = useAddMember({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/members"] }); setOpen(false) } } })
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = members?.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.policyNumber.includes(search)
  )

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    addMutation.mutate({
      data: {
        customerId: parseInt(fd.get("customerId") as string) || 1,
        policyNumber: fd.get("policyNumber") as string,
        name: fd.get("name") as string,
        relationship: fd.get("relationship") as any,
        dateOfBirth: fd.get("dateOfBirth") as string,
        gender: fd.get("gender") as any,
        preExistingConditions: (fd.get("preExistingConditions") as string || "").split(",").map(c => c.trim()).filter(Boolean),
        sumInsured: parseFloat(fd.get("sumInsured") as string) || 0,
        addedAt: new Date().toISOString(),
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Policy Members</h1>
          <p className="text-slate-500 mt-1">Manage all insured members and their coverage details.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25">
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: members?.length ?? 0 },
          { label: "Active", value: members?.filter(m => m.status === "active").length ?? 0 },
          { label: "With Pre-existing", value: members?.filter(m => (m.preExistingConditions as string[]).length > 0).length ?? 0 },
          { label: "Unique Policies", value: new Set(members?.map(m => m.policyNumber)).size ?? 0 },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-md bg-white">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or policy..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading members...</div>
        ) : filtered?.map(member => (
          <Card key={member.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{member.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RELATION_COLORS[member.relationship]}`}>
                      {RELATION_LABELS[member.relationship]}
                    </span>
                  </div>
                </div>
                <StatusBadge status={member.status} />
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Policy</span>
                  <span className="font-mono text-xs text-slate-700">{member.policyNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DOB</span>
                  <span className="text-slate-700">{formatDate(member.dateOfBirth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender</span>
                  <span className="capitalize text-slate-700">{member.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sum Insured</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(member.sumInsured)}</span>
                </div>
              </div>
              {(member.preExistingConditions as string[]).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1.5">Pre-existing Conditions</p>
                  <div className="flex flex-wrap gap-1">
                    {(member.preExistingConditions as string[]).map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Member Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Add New Member</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Full Name</label>
                  <input name="name" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Customer ID</label>
                  <input name="customerId" type="number" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Policy Number</label>
                <input name="policyNumber" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Relationship</label>
                  <select name="relationship" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {Object.entries(RELATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Gender</label>
                  <select name="gender" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Date of Birth</label>
                <input name="dateOfBirth" type="date" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Sum Insured (₹)</label>
                <input name="sumInsured" type="number" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Pre-existing Conditions (comma-separated)</label>
                <input name="preExistingConditions" placeholder="Diabetes, Hypertension..." className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={addMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {addMutation.isPending ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
