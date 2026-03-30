import { useState } from "react"
import { useListCallLogs, useCreateCallLog } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Phone, PhoneIncoming, PhoneOutgoing, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { StatusBadge } from "@/components/ui/status-badge"

export default function CallLogs() {
  const queryClient = useQueryClient()
  const { data: calls, isLoading } = useListCallLogs()
  const [isLogOpen, setIsLogOpen] = useState(false)

  const createMutation = useCreateCallLog({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/calls"] })
        setIsLogOpen(false)
      }
    }
  })

  const handleLogCall = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      data: {
        callerId: 1,
        callerName: "Admin User",
        callerRole: "admin",
        receiverName: fd.get("receiverName") as string,
        receiverRole: fd.get("receiverRole") as string,
        direction: fd.get("direction") as any,
        outcome: fd.get("outcome") as any,
        duration: parseInt(fd.get("duration") as string) || 0,
        notes: fd.get("notes") as string,
        callDate: new Date().toISOString()
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Call Logs</h1>
          <p className="text-slate-500 mt-1">History of telephonic communications.</p>
        </div>
        <Button onClick={() => setIsLogOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Log New Call
        </Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">From</th>
                <th className="px-6 py-4 font-medium">To</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Outcome</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading call logs...</td></tr>
              ) : calls?.map((call) => (
                <tr key={call.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {call.direction === 'inbound' ? 
                        <PhoneIncoming className="w-4 h-4 text-emerald-500" /> : 
                        <PhoneOutgoing className="w-4 h-4 text-blue-500" />
                      }
                      <span className="capitalize font-medium text-slate-700">{call.direction}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{call.callerName}</p>
                    <p className="text-xs text-slate-500 capitalize">{call.callerRole}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{call.receiverName}</p>
                    <p className="text-xs text-slate-500 capitalize">{call.receiverRole}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{call.duration ? `${Math.floor(call.duration/60)}m ${call.duration%60}s` : '-'}</td>
                  <td className="px-6 py-4"><StatusBadge status={call.outcome} /></td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(call.callDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent onClose={() => setIsLogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Log Call Record</DialogTitle>
            <DialogDescription>Manually add a recent call to the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogCall} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Receiver Name</label>
                <Input name="receiverName" required placeholder="Dr. Smith" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Receiver Role</label>
                <select name="receiverRole" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="hospital">Hospital</option>
                  <option value="customer">Customer</option>
                  <option value="tpa">TPA</option>
                  <option value="insurer">Insurer</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Direction</label>
                <select name="direction" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Outcome</label>
                <select name="outcome" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="connected">Connected</option>
                  <option value="missed">Missed</option>
                  <option value="voicemail">Voicemail</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Duration (seconds)</label>
              <Input name="duration" type="number" placeholder="120" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Notes / Summary</label>
              <textarea name="notes" rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Discussed claim documents..." />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsLogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {createMutation.isPending ? "Saving..." : "Save Log"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
