import { useState } from "react"
import { useListCallLogs, useCreateCallLog } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Phone, PhoneIncoming, PhoneOutgoing, Plus, ChevronDown, ChevronUp,
  FileText, Gavel, Clock, Calendar, PhoneMissed
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuth, ROLE_COLORS, ROLE_LABELS } from "@/lib/auth"

const OUTCOME_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  connected: {
    icon: <Phone className="w-4 h-4" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
  },
  missed: {
    icon: <PhoneMissed className="w-4 h-4" />,
    color: "text-red-400",
    bg: "bg-red-500/15 border-red-500/30",
  },
  voicemail: {
    icon: <PhoneIncoming className="w-4 h-4" />,
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  busy: {
    icon: <Phone className="w-4 h-4" />,
    color: "text-muted-foreground",
    bg: "bg-muted/30 border-border",
  },
}

function formatDuration(secs: number | null | undefined) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function CallLogs() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: calls, isLoading } = useListCallLogs()
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

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
    if (!user) return
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      data: {
        callerId: user.id,
        callerName: user.name,
        callerRole: user.role,
        receiverName: fd.get("receiverName") as string,
        receiverRole: fd.get("receiverRole") as string,
        direction: fd.get("direction") as any,
        outcome: fd.get("outcome") as any,
        duration: parseInt(fd.get("duration") as string) || 0,
        notes: fd.get("notes") as string,
        summary: fd.get("summary") as string,
        finalDecision: fd.get("finalDecision") as string,
        callDate: new Date().toISOString()
      }
    })
  }

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Call Logs</h1>
          <p className="text-muted-foreground mt-1">Telephonic communication records with summaries and decisions.</p>
        </div>
        <Button onClick={() => setIsLogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Log New Call
        </Button>
      </div>

      {/* Stats strip */}
      {calls && calls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Calls", value: calls.length, color: "text-muted-foreground" },
            { label: "Connected", value: calls.filter(c => c.outcome === "connected").length, color: "text-emerald-600" },
            { label: "Missed / Busy", value: calls.filter(c => c.outcome === "missed" || c.outcome === "busy").length, color: "text-red-500" },
            { label: "With Decisions", value: calls.filter(c => c.finalDecision).length, color: "text-primary" },
          ].map(s => (
            <Card key={s.label} className="border-none shadow-sm p-4 bg-card">
              <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Call cards */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="border-none shadow-sm p-8 text-center text-muted-foreground">Loading call logs...</Card>
        ) : calls?.length === 0 ? (
          <Card className="border-none shadow-sm p-12 text-center">
            <Phone className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No call logs yet.</p>
          </Card>
        ) : calls?.map(call => {
          const isExpanded = expandedId === call.id
          const cfg = OUTCOME_CONFIG[call.outcome] || OUTCOME_CONFIG.connected
          const hasDetail = !!(call.summary || call.finalDecision || call.notes)

          return (
            <Card key={call.id} className={`border-none shadow-sm overflow-hidden transition-shadow duration-200 ${isExpanded ? "shadow-md" : "hover:shadow-md"}`}>
              {/* Main row */}
              <button
                onClick={() => hasDetail && toggleExpand(call.id)}
                className={`w-full text-left p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${hasDetail ? "cursor-pointer" : "cursor-default"}`}
              >
                {/* Direction icon */}
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.bg}`}>
                  <span className={cfg.color}>
                    {call.direction === "inbound"
                      ? <PhoneIncoming className="w-4 h-4" />
                      : <PhoneOutgoing className="w-4 h-4" />
                    }
                  </span>
                </div>

                {/* Caller → Receiver */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{call.callerName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[call.callerRole] || "bg-muted/40 text-muted-foreground"}`}>
                        {ROLE_LABELS[call.callerRole] || call.callerRole}
                      </span>
                    </div>
                    <span className="text-muted-foreground/50">→</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{call.receiverName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[call.receiverRole] || "bg-muted/40 text-muted-foreground"}`}>
                        {ROLE_LABELS[call.receiverRole] || call.receiverRole}
                      </span>
                    </div>
                  </div>
                  {/* Preview of notes if not expanded */}
                  {!isExpanded && call.notes && (
                    <p className="text-sm text-muted-foreground truncate">{call.notes}</p>
                  )}
                </div>

                {/* Meta + outcome */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0 flex-wrap">
                  {call.duration && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-sm">{formatDuration(call.duration)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-sm">{formatDate(call.callDate)}</span>
                  </div>
                  <StatusBadge status={call.outcome} />
                  {hasDetail && (
                    <span className="text-muted-foreground/70 ml-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && hasDetail && (
                <div className="border-t border-border/50 bg-muted/30/60 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Summary */}
                  <div className="bg-card border border-border rounded-xl border border-blue-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-sm text-blue-900">Call Summary</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {call.summary || call.notes || <span className="text-muted-foreground/70 italic">No summary recorded.</span>}
                    </p>
                  </div>

                  {/* Final Decision */}
                  <div className={`rounded-xl border p-4 ${call.finalDecision ? "bg-white border-emerald-500/20" : "bg-white border-border/50"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${call.finalDecision ? "bg-emerald-500/15" : "bg-muted/40"}`}>
                        <Gavel className={`w-3.5 h-3.5 ${call.finalDecision ? "text-emerald-600" : "text-muted-foreground/70"}`} />
                      </div>
                      <h4 className={`font-semibold text-sm ${call.finalDecision ? "text-emerald-900" : "text-muted-foreground"}`}>
                        Final Decision
                      </h4>
                    </div>
                    {call.finalDecision ? (
                      <p className="text-sm text-muted-foreground leading-relaxed">{call.finalDecision}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/70 italic">
                        {call.outcome === "missed" || call.outcome === "busy"
                          ? "Call not connected — no decision reached."
                          : "No final decision recorded for this call."
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Log Call dialog */}
      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent onClose={() => setIsLogOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Call Record</DialogTitle>
            <DialogDescription>Record a telephonic communication with its discussion summary and final decision.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogCall} className="space-y-4 mt-4">
            {/* Caller info (read-only from auth) */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Caller: {user.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]} · Logged in user</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="receiverName" className="text-sm font-medium text-muted-foreground">Receiver Name</label>
                <Input id="receiverName" name="receiverName" required placeholder="Dr. Smith / MediTPA..." />
              </div>
              <div className="space-y-1">
                <label htmlFor="receiverRole" className="text-sm font-medium text-muted-foreground">Receiver Role</label>
                <select id="receiverRole" name="receiverRole" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="hospital">Hospital</option>
                  <option value="customer">Customer</option>
                  <option value="tpa">TPA</option>
                  <option value="insurer">Insurer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="direction" className="text-sm font-medium text-muted-foreground">Direction</label>
                <select id="direction" name="direction" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="outcome" className="text-sm font-medium text-muted-foreground">Outcome</label>
                <select id="outcome" name="outcome" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="connected">Connected</option>
                  <option value="missed">Missed</option>
                  <option value="voicemail">Voicemail</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="duration" className="text-sm font-medium text-muted-foreground">Duration (secs)</label>
                <Input id="duration" name="duration" type="number" placeholder="300" min={0} />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <label htmlFor="summary" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> Call Summary
              </label>
              <textarea
                id="summary"
                name="summary"
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="What was discussed during the call? Include key points raised by both parties..."
              />
            </div>

            {/* Final Decision */}
            <div className="space-y-1">
              <label htmlFor="finalDecision" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gavel className="w-3.5 h-3.5 text-emerald-600" /> Final Decision
              </label>
              <textarea
                id="finalDecision"
                name="finalDecision"
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="What was agreed or decided at the end of the call? Include next steps, timelines, and responsibilities..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsLogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Log"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
