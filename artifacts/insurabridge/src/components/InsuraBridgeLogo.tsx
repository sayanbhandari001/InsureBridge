/**
 * InsuraBridge custom logo mark.
 * A shield whose lower half contains a stylised bridge arch —
 * symbolising protection (shield) and connectivity (bridge).
 *
 * Props:
 *  size   – pixel dimension of the square icon box  (default 36)
 *  showText – render the word-mark next to the icon (default true)
 *  textSize – Tailwind-like rem value for the word-mark (default "1rem")
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
  const id = `ibg-${size}`

  return (
    <div className={`flex items-center gap-2.5 flex-shrink-0 ${className}`}>
      {/* ── Icon mark ─────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="InsuraBridge icon"
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1B3A6B" />
            <stop offset="100%" stopColor="#00897B" />
          </linearGradient>
          <linearGradient id={`${id}-bridge`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shield background */}
        <path
          d="M20 2 L36 8 L36 22 C36 30.5 28.5 37 20 38 C11.5 37 4 30.5 4 22 L4 8 Z"
          fill={`url(#${id}-grad)`}
        />

        {/* Subtle inner shield outline */}
        <path
          d="M20 5 L33 10 L33 22 C33 29 26.5 34.5 20 35.5 C13.5 34.5 7 29 7 22 L7 10 Z"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />

        {/* ── Bridge arch group ──────────────────────────────── */}
        {/* Road / deck — horizontal bar at bottom-center of shield */}
        <rect
          x="8"
          y="26"
          width="24"
          height="2.2"
          rx="1.1"
          fill={`url(#${id}-bridge)`}
          opacity="0.95"
        />

        {/* Left arch pillar */}
        <rect x="11" y="20" width="2.5" height="6" rx="1" fill="rgba(255,255,255,0.9)" />
        {/* Right arch pillar */}
        <rect x="26.5" y="20" width="2.5" height="6" rx="1" fill="rgba(255,255,255,0.9)" />

        {/* Arch curve (single smooth arc over the two pillars) */}
        <path
          d="M11 21 Q20 12 29 21"
          stroke={`url(#${id}-bridge)`}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          filter={`url(#${id}-glow)`}
        />

        {/* Suspension cables (thin lines from top-of-arch to deck) */}
        <line x1="15.5" y1="16.2" x2="14.5" y2="26" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
        <line x1="20"   y1="13.5" x2="20"   y2="26" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
        <line x1="24.5" y1="16.2" x2="25.5" y2="26" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />

        {/* Small shield-star highlight at top */}
        <circle cx="20" cy="8.5" r="1.6" fill="rgba(255,255,255,0.3)" />
      </svg>

      {/* ── Word-mark ─────────────────────────────────────────── */}
      {showText && (
        <span
          style={{
            fontSize: textSize,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1,
            color: "#f1f5f9",
          }}
        >
          Insura
          <span
            style={{
              background: "linear-gradient(90deg,#93c5fd,#34d399)",
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
