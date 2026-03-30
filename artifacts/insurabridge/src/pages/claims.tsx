import { useState } from "react"
import { useListClaims, useCreateClaim, type CreateClaimRequest } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Search, Filter } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "wouter"

export default function Claims() {
  const queryClient = useQueryClient()
  const { data: claims, isLoading } = useListClaims()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState("")

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
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search claims..." 
              className="pl-9 bg-slate-50 border-slate-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 shrink-0">
            <Filter className="w-4 h-4" /> Filter Status
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Claim ID</th>
                <th className="px-6 py-4 font-medium">Patient Details</th>
                <th className="px-6 py-4 font-medium">Hospital</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading claims...</td></tr>
              ) : filteredClaims?.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">
                    <Link href={`/claims/${claim.id}`} className="hover:underline">{claim.claimNumber}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{claim.patientName}</div>
                    <div className="text-xs text-slate-500 mt-0.5 text-balance">{claim.diagnosis || 'No diagnosis'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{claim.hospitalName || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(claim.claimedAmount)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(claim.createdAt)}</td>
                  <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                </tr>
              ))}
              {filteredClaims?.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 bg-slate-50/30">No claims found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent onClose={() => setIsCreateOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create New Claim</DialogTitle>
            <DialogDescription>Submit a new claim for processing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Patient Name</label>
                <Input name="patientName" required placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Customer ID</label>
                <Input name="customerId" type="number" required defaultValue="1" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Policy Number</label>
                <Input name="policyNumber" required placeholder="POL-12345" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Claim Type</label>
                <select name="claimType" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="cashless">Cashless</option>
                  <option value="reimbursement">Reimbursement</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Hospital Name</label>
              <Input name="hospitalName" placeholder="City General Hospital" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Diagnosis</label>
              <Input name="diagnosis" placeholder="Viral Fever" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Claim Amount ($)</label>
              <Input name="claimedAmount" type="number" step="0.01" required placeholder="1500.00" />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Submit Claim"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
