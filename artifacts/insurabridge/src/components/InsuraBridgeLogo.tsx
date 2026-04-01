/**
 * InsuraBridge official logo mark.
 * Icon: person figure with arms raised, forming an arch bridge overhead,
 * glowing apex dot, and ground line — matching the brand image exactly.
 *
 * Props:
 *   size      - icon size in px (default 36)
 *   showText  - whether to show the wordmark beside the icon (default true)
 *   textSize  - font-size for wordmark (default "1rem")
 *   animated  - run entrance & loop animations (default true)
 *   className - extra class on wrapper
 */

import { motion } from "framer-motion"

interface LogoProps {
  size?: number
  showText?: boolean
  textSize?: string
  animated?: boolean
  className?: string
}

export function InsuraBridgeLogo({
  size = 36,
  showText = true,
  textSize = "1rem",
  animated = true,
  className = "",
}: LogoProps) {
  const uid = `ib-${size}`

  /* ── colours matching the reference image ── */
  const BG       = "#0b1a2e"          // dark navy
  const PERSON   = "#38bdf8"          // sky-blue body
  const ARCH     = "#00C896"          // teal-green arch / arms
  const DOT_OUT  = "#00C896"          // outer glow dot
  const DOT_IN   = "#b2ffe8"          // bright inner dot
  const GROUND   = "#00897B"          // green ground line

  /* person proportions inside 100×100 viewBox */
  const HEAD_CX = 50, HEAD_CY = 54, HEAD_R = 10
  const BODY_TOP = 64
  /* arch: from left shoulder → apex → right shoulder */
  const ARCH_D = "M 18 62 Q 18 14 50 10 Q 82 14 82 62"
  const GROUND_Y = 76

  return (
    <div className={`flex items-center gap-2.5 flex-shrink-0 select-none ${className}`}>

      {/* ── Icon ────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="InsuraBridge"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Glow filter for apex dot */}
          <filter id={`${uid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Glow filter for arch */}
          <filter id={`${uid}-arch-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rounded square */}
        <rect width="100" height="100" rx="22" fill={BG} />

        {/* Ground line */}
        {animated ? (
          <motion.line
            x1="12" y1={GROUND_Y} x2="88" y2={GROUND_Y}
            stroke={GROUND} strokeWidth="3.5" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
          />
        ) : (
          <line x1="12" y1={GROUND_Y} x2="88" y2={GROUND_Y} stroke={GROUND} strokeWidth="3.5" strokeLinecap="round" />
        )}

        {/* Arch / arms */}
        {animated ? (
          <motion.path
            d={ARCH_D}
            stroke={ARCH} strokeWidth="5" strokeLinecap="round" fill="none"
            filter={`url(#${uid}-arch-glow)`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.75, delay: 0.2, ease: "easeInOut" }}
          />
        ) : (
          <path d={ARCH_D} stroke={ARCH} strokeWidth="5" strokeLinecap="round" fill="none" filter={`url(#${uid}-arch-glow)`} />
        )}

        {/* Person — head */}
        {animated ? (
          <motion.circle
            cx={HEAD_CX} cy={HEAD_CY} r={HEAD_R} fill={PERSON}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: `${HEAD_CX}px ${HEAD_CY}px` }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.05 }}
          />
        ) : (
          <circle cx={HEAD_CX} cy={HEAD_CY} r={HEAD_R} fill={PERSON} />
        )}

        {/* Person — body */}
        {animated ? (
          <motion.rect
            x={HEAD_CX - 12} y={BODY_TOP} width={24} height={14} rx={5} fill={PERSON}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            style={{ transformOrigin: `${HEAD_CX}px ${BODY_TOP}px` }}
            transition={{ duration: 0.3, delay: 0.15 }}
          />
        ) : (
          <rect x={HEAD_CX - 12} y={BODY_TOP} width={24} height={14} rx={5} fill={PERSON} />
        )}

        {/* Apex glowing dot — outer ring */}
        {animated ? (
          <>
            <motion.circle
              cx={50} cy={10} r={8} fill={DOT_OUT}
              filter={`url(#${uid}-glow)`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              style={{ transformOrigin: "50px 10px" }}
              transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
            />
            {/* Continuous pulse ring */}
            <motion.circle
              cx={50} cy={10} r={8} fill="none"
              stroke={DOT_OUT} strokeWidth={2}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              style={{ transformOrigin: "50px 10px" }}
              transition={{ duration: 1.6, delay: 1.4, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx={50} cy={10} r={4.5} fill={DOT_IN}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ transformOrigin: "50px 10px" }}
              transition={{ duration: 0.35, delay: 1, type: "spring", stiffness: 400 }}
            />
          </>
        ) : (
          <>
            <circle cx={50} cy={10} r={8} fill={DOT_OUT} filter={`url(#${uid}-glow)`} />
            <circle cx={50} cy={10} r={4.5} fill={DOT_IN} />
          </>
        )}
      </svg>

      {/* ── Wordmark ──────────────────────────────────── */}
      {showText && (
        animated ? (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
            style={{
              fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
              fontWeight: 800,
              fontSize: textSize,
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "#e2e8f0" }}>Insura</span>
            <span style={{
              background: "linear-gradient(90deg, #38bdf8 0%, #00C896 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Bridge</span>
          </motion.span>
        ) : (
          <span style={{
            fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
            fontWeight: 800,
            fontSize: textSize,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}>
            <span style={{ color: "#e2e8f0" }}>Insura</span>
            <span style={{
              background: "linear-gradient(90deg, #38bdf8 0%, #00C896 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Bridge</span>
          </span>
        )
      )}
    </div>
  )
}
