import { cn } from "@/lib/utils"

export function StatusBadge({ status }: { status: string }) {
  const getColors = (s: string) => {
    switch (s.toLowerCase()) {
      case 'approved':
      case 'settled':
      case 'connected':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      case 'rejected':
      case 'missed':
        return 'bg-red-50 text-red-700 ring-red-600/10'
      case 'under_review':
      case 'partially_approved':
      case 'voicemail':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20'
      case 'pending':
      case 'submitted':
      case 'pending_documents':
      case 'busy':
        return 'bg-blue-50 text-blue-700 ring-blue-700/10'
      default:
        return 'bg-slate-50 text-slate-700 ring-slate-600/20'
    }
  }

  const formatText = (s: string) => {
    return s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", getColors(status))}>
      {formatText(status)}
    </span>
  )
}
