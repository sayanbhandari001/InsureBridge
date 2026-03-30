import { useState } from "react"
import { useListNetworkProviders, useCreateNetworkProvider } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, MapPin, Phone, Mail, CheckCircle, XCircle, Building2, Search } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  diagnostic: "Diagnostic",
  pharmacy: "Pharmacy",
  specialist: "Specialist",
}

const TYPE_COLORS: Record<string, string> = {
  hospital: "bg-blue-100 text-blue-700",
  clinic: "bg-green-100 text-green-700",
  diagnostic: "bg-purple-100 text-purple-700",
  pharmacy: "bg-amber-100 text-amber-700",
  specialist: "bg-pink-100 text-pink-700",
}

export default function NetworkProviders() {
  const qc = useQueryClient()
  const { data: providers, isLoading } = useListNetworkProviders()
  const createMutation = useCreateNetworkProvider({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/network-providers"] }); setOpen(false) } } })
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  const filtered = providers?.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || p.type === typeFilter
    return matchSearch && matchType
  })

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      data: {
        name: fd.get("name") as string,
        type: fd.get("type") as any,
        city: fd.get("city") as string,
        state: fd.get("state") as string,
        address: fd.get("address") as string,
        phone: fd.get("phone") as string || null,
        email: fd.get("email") as string || null,
        specialities: (fd.get("specialities") as string || "").split(",").map(s => s.trim()).filter(Boolean),
        insurerIds: [],
        bedCount: fd.get("bedCount") ? parseInt(fd.get("bedCount") as string) : null,
        cashlessEnabled: fd.get("cashlessEnabled") === "true",
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Network Providers</h1>
          <p className="text-slate-500 mt-1">Manage empanelled hospitals, clinics and diagnostic centres.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search by name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Types</option>
          {Object.entries(PROVIDER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(PROVIDER_TYPE_LABELS).slice(0, 4).map(([type, label]) => (
          <Card key={type} className="border-none shadow-md bg-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setTypeFilter(type === typeFilter ? "" : type)}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{providers?.filter(p => p.type === type).length ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">{label}s</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Loading providers...</div>
        ) : filtered?.map(provider => (
          <Card key={provider.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{provider.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[provider.type]}`}>
                      {PROVIDER_TYPE_LABELS[provider.type]}
                    </span>
                    <StatusBadge status={provider.status} />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {provider.address}, {provider.city}, {provider.state}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    {provider.phone && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {provider.phone}
                      </div>
                    )}
                    {provider.email && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {provider.email}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {provider.cashlessEnabled
                        ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-700 text-xs">Cashless Enabled</span></>
                        : <><XCircle className="w-3.5 h-3.5 text-slate-300" /><span className="text-slate-400 text-xs">Cashless Disabled</span></>
                      }
                    </div>
                    {provider.bedCount && <span className="text-slate-400 text-xs">{provider.bedCount} beds</span>}
                  </div>
                  {(provider.specialities as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(provider.specialities as string[]).map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
                      ))}
                    </div>
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
            <h2 className="text-lg font-bold text-slate-900 mb-5">Add Network Provider</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Provider Name</label>
                  <input name="name" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Type</label>
                  <select name="type" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {Object.entries(PROVIDER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Address</label>
                <input name="address" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">City</label>
                  <input name="city" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">State</label>
                  <input name="state" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Phone</label>
                  <input name="phone" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Bed Count</label>
                  <input name="bedCount" type="number" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Specialities (comma-separated)</label>
                <input name="specialities" placeholder="Cardiology, Orthopedics..." className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Cashless Enabled</label>
                <select name="cashlessEnabled" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Adding..." : "Add Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
