/**
 * InsuraBridge logo — clean modern wordmark with a bridge-connector icon.
 * No shield. Uses a minimal "bridge node" mark: two dots connected by a
 * rising arc, representing connected healthcare stakeholders.
 */

interface LogoProps {
  size?: number
  showText?: boolean
  textSize?: string
  className?: string
}

export function InsuraBridgeLogo({
  size = 36,
  showText = true,
  textSize = "1rem",
  className = "",
}: LogoProps) {
  const id = `ib-${size}`
  const r = size / 36 // scale ratio

  return (
    <div className={`flex items-center gap-2 flex-shrink-0 select-none ${className}`}>
      {/* ── Icon: bridge-node mark ────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="InsuraBridge"
      >
        <defs>
          <linearGradient id={`${id}-g1`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0d4a40" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Rounded square background */}
        <rect width="36" height="36" rx="9" fill={`url(#${id}-bg)`} />
        <rect width="36" height="36" rx="9" fill="none" stroke="rgba(96,165,250,0.2)" strokeWidth="1" />

        {/* Left node */}
        <circle cx="9" cy="22" r="3.2" fill={`url(#${id}-g1)`} />

        {/* Right node */}
        <circle cx="27" cy="22" r="3.2" fill={`url(#${id}-g1)`} />

        {/* Bridge arch connecting them */}
        <path
          d="M9 22 C9 10 27 10 27 22"
          stroke={`url(#${id}-g1)`}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter={`url(#${id}-glow)`}
        />

        {/* Top node (apex of arch — the bridge tower) */}
        <circle cx="18" cy="11.5" r="2.4" fill={`url(#${id}-g1)`} opacity="0.85" />

        {/* Vertical drop lines from apex */}
        <line x1="18" y1="13.8" x2="18" y2="21.5" stroke="rgba(96,165,250,0.35)" strokeWidth="1" strokeDasharray="2 1.5" />
      </svg>

      {/* ── Wordmark ─────────────────────────────────────── */}
      {showText && (
        <span
          style={{
            fontSize: textSize,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            fontFamily: "'Inter', 'Outfit', sans-serif",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#e2e8f0" }}>Insura</span>
          <span
            style={{
              background: "linear-gradient(90deg, #60a5fa 0%, #34d399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Bridge
          </span>
        </span>
      )}
    </div>
  )
}
