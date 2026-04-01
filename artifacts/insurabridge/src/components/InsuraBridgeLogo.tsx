/**
 * InsuraBridge official logo — using the brand kit SVG icon.
 * Icon: two connected person figures joined by an arch bridge (the official mark).
 * Wordmark: "Insura" (white/light) + "Bridge" (teal gradient).
 */

interface LogoProps {
  size?: number
  showText?: boolean
  textSize?: string
  className?: string
  variant?: "icon-dark" | "icon-gradient" | "icon-transparent"
}

export function InsuraBridgeLogo({
  size = 36,
  showText = true,
  textSize = "1rem",
  className = "",
  variant = "icon-dark",
}: LogoProps) {
  const uid = `ib-${size}-${variant}`

  return (
    <div className={`flex items-center gap-2.5 flex-shrink-0 select-none ${className}`}>
      {/* ── Official Bridge-People Icon ──────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="InsuraBridge icon"
      >
        <defs>
          <linearGradient id={`${uid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B3A6B" />
            <stop offset="100%" stopColor="#00897B" />
          </linearGradient>
          <linearGradient id={`${uid}-arch`} x1="0%" y1="0%" x2="100%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#00BFA5" />
          </linearGradient>
          <linearGradient id={`${uid}-person`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rounded square */}
        {variant !== "icon-transparent" && (
          <rect width="180" height="180" rx="36" fill={`url(#${uid}-bg)`} />
        )}

        {/* Bridge scene centered at (90, 86) */}
        <g transform="translate(90, 86)">
          {/* Left person — head */}
          <circle cx="-36" cy="0" r="11" fill={`url(#${uid}-person)`} />
          {/* Left person — body */}
          <path d="M -46 13 Q -48 28 -46 42 L -26 42 Q -24 28 -26 13 Z" fill={`url(#${uid}-person)`} />
          {/* Left person — arm reaching right */}
          <path d="M -26 21 Q -17 17 -8 15" stroke={`url(#${uid}-person)`} strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Left arm endpoint dot */}
          <circle cx="-8" cy="15" r="4" fill="#00BFA5" />

          {/* Right person — head */}
          <circle cx="36" cy="0" r="11" fill={`url(#${uid}-person)`} />
          {/* Right person — body */}
          <path d="M 26 13 Q 24 28 26 42 L 46 42 Q 48 28 46 13 Z" fill={`url(#${uid}-person)`} />
          {/* Right person — arm reaching left */}
          <path d="M 26 21 Q 17 17 8 15" stroke={`url(#${uid}-person)`} strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Right arm endpoint dot */}
          <circle cx="8" cy="15" r="4" fill="#00BFA5" />

          {/* Arch bridge connecting both sides */}
          <path
            d="M -32 15 Q 0 -36 32 15"
            stroke={`url(#${uid}-arch)`}
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
            filter={`url(#${uid}-glow)`}
          />

          {/* Keystone dot at arch apex */}
          <circle cx="0" cy="-22" r="6.5" fill="white" />
          <circle cx="0" cy="-22" r="3.5" fill="#00BFA5" />

          {/* Ground line */}
          <line x1="-48" y1="47" x2="48" y2="47" stroke="rgba(255,255,255,0.55)" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      </svg>

      {/* ── Wordmark ─────────────────────────────────────────── */}
      {showText && (
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans','Inter','Helvetica Neue',Arial,sans-serif",
            fontWeight: 700,
            fontSize: textSize,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#e2e8f0" }}>Insura</span>
          <span
            style={{
              background: "linear-gradient(90deg, #60a5fa 0%, #2dd4bf 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Bridge
          </span>
        </span>
      )}
    </div>
  )
}
