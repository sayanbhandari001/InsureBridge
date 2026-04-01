import { cn } from "@/lib/utils"

const STATUS_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  approved:            { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#34d399" },
  settled:             { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#34d399" },
  connected:           { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#34d399" },
  completed:           { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#34d399" },
  active:              { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#34d399" },
  rejected:            { bg: "rgba(248,113,113,0.12)", text: "#f87171", dot: "#f87171" },
  missed:              { bg: "rgba(248,113,113,0.12)", text: "#f87171", dot: "#f87171" },
  cancelled:           { bg: "rgba(248,113,113,0.12)", text: "#f87171", dot: "#f87171" },
  under_review:        { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24", dot: "#fbbf24" },
  partially_approved:  { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24", dot: "#fbbf24" },
  voicemail:           { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24", dot: "#fbbf24" },
  on_hold:             { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24", dot: "#fbbf24" },
  pending:             { bg: "rgba(96,165,250,0.12)",  text: "#60a5fa", dot: "#60a5fa" },
  submitted:           { bg: "rgba(96,165,250,0.12)",  text: "#60a5fa", dot: "#60a5fa" },
  pending_documents:   { bg: "rgba(96,165,250,0.12)",  text: "#60a5fa", dot: "#60a5fa" },
  busy:                { bg: "rgba(96,165,250,0.12)",  text: "#60a5fa", dot: "#60a5fa" },
  in_progress:         { bg: "rgba(96,165,250,0.12)",  text: "#60a5fa", dot: "#60a5fa" },
  expired:             { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", dot: "#a78bfa" },
  due_soon:            { bg: "rgba(251,146,60,0.12)",  text: "#fb923c", dot: "#fb923c" },
}

const DEFAULT_STATUS = { bg: "rgba(100,116,139,0.12)", text: "#94a3b8", dot: "#94a3b8" }

export function StatusBadge({ status }: { status: string }) {
  const key   = status.toLowerCase().replace(/ /g, "_")
  const style = STATUS_MAP[key] ?? DEFAULT_STATUS
  const label = status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap"
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.dot}30`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />
      {label}
    </span>
  )
}
