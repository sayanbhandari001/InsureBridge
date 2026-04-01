/**
 * InsuraBridge logo mark.
 *
 * Unique animation sequence:
 *  1. Background square pops in (spring scale + slight tilt)
 *  2. Apex dot BURSTS with a bright bloom (3 concentric pulse rings)
 *  3. Two energy beams shoot DOWNWARD from the apex, forming the arms
 *     (left arm first, right arm 120 ms later — like an umbrella snapping open)
 *  4. Person head drops in from above with a bounce
 *  5. Body scales up from head downward
 *  6. Ground line sweeps outward from centre
 *  7. A small orbiting particle loops around the apex dot continuously
 *  8. Wordmark fades + slides in character-by-character
 */

import { motion } from "framer-motion"

interface LogoProps {
  size?: number
  showText?: boolean
  textSize?: string
  animated?: boolean
  className?: string
}

/* Split the wordmark so we can stagger letter-by-letter */
const INSURA   = "Insura".split("")
const BRIDGE   = "Bridge".split("")

export function InsuraBridgeLogo({
  size = 36,
  showText = true,
  textSize = "1rem",
  animated = true,
  className = "",
}: LogoProps) {
  const uid = `ibl-${size}`

  const BG      = "#0b1a2e"
  const PERSON  = "#38bdf8"
  const ARM     = "#00C896"
  const GLOW    = "#00C896"
  const DOT_IN  = "#d1fae5"
  const GROUND  = "#00897B"

  /*
   * Arms defined FROM the apex → shoulder so pathLength draws top-down.
   * Left arm:  apex (50,13) → sweeps left-out → left shoulder (40,63)
   * Right arm: apex (50,13) → sweeps right-out → right shoulder (60,63)
   */
  const LEFT_ARM  = "M 50 13 C 10 26 12 60 40 63"
  const RIGHT_ARM = "M 50 13 C 90 26 88 60 60 63"
  const APEX_CY   = 13
  const GROUND_Y  = 80

  return (
    <div
      className={`flex items-center gap-2.5 flex-shrink-0 select-none ${className}`}
    >
      {/* ─── Icon ─────────────────────────────────────── */}
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
          {/* Strong glow for apex dot */}
          <filter id={`${uid}-dg`} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Softer glow for arms */}
          <filter id={`${uid}-ag`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Orbit particle glow */}
          <filter id={`${uid}-og`} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── 1. Background square — pops in with slight tilt ── */}
        {animated ? (
          <motion.rect
            width="100" height="100" rx="22" fill={BG}
            initial={{ scale: 0.4, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            style={{ transformOrigin: "50px 50px" }}
            transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0 }}
          />
        ) : (
          <rect width="100" height="100" rx="22" fill={BG} />
        )}

        {/* ── 2. Ground line — sweeps from centre ── */}
        {animated ? (
          <motion.line
            x1="50" y1={GROUND_Y} x2="50" y2={GROUND_Y}
            stroke={GROUND} strokeWidth="3.5" strokeLinecap="round"
            animate={{ x1: 14, x2: 86 }}
            initial={{ x1: 50, x2: 50, opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ opacity: 1 }}
          />
        ) : (
          <line x1="14" y1={GROUND_Y} x2="86" y2={GROUND_Y}
            stroke={GROUND} strokeWidth="3.5" strokeLinecap="round" />
        )}

        {/* ── 3a. Apex outer bloom — bursts first ── */}
        {animated ? (
          <>
            {/* Outer burst ring 1 */}
            <motion.circle cx={50} cy={APEX_CY} r={9}
              fill="none" stroke={GLOW} strokeWidth="1.5"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 3.5], opacity: [1, 0] }}
              style={{ transformOrigin: `50px ${APEX_CY}px` }}
              transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
            />
            {/* Outer burst ring 2 */}
            <motion.circle cx={50} cy={APEX_CY} r={9}
              fill="none" stroke={GLOW} strokeWidth="1"
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: [0, 5], opacity: [0.8, 0] }}
              style={{ transformOrigin: `50px ${APEX_CY}px` }}
              transition={{ duration: 0.75, delay: 0.14, ease: "easeOut" }}
            />
            {/* Glow fill */}
            <motion.circle cx={50} cy={APEX_CY} r={9}
              fill={GLOW} filter={`url(#${uid}-dg)`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.6, 1], opacity: [0, 1, 0.9] }}
              style={{ transformOrigin: `50px ${APEX_CY}px` }}
              transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
            />
            {/* Bright inner dot */}
            <motion.circle cx={50} cy={APEX_CY} r={4.5}
              fill={DOT_IN}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ transformOrigin: `50px ${APEX_CY}px` }}
              transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.22 }}
            />

            {/* ── Continuous pulse ring (loop forever) ── */}
            <motion.circle cx={50} cy={APEX_CY} r={9}
              fill="none" stroke={GLOW} strokeWidth="1.5"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 2.6], opacity: [0.65, 0] }}
              style={{ transformOrigin: `50px ${APEX_CY}px` }}
              transition={{ duration: 1.9, delay: 1.2, repeat: Infinity, ease: "easeOut" }}
            />

            {/* ── Orbiting spark — uses group rotation for reliable SVG animation ── */}
            <motion.g
              animate={{ rotate: 360 }}
              initial={{ rotate: 0 }}
              style={{ transformOrigin: `50px ${APEX_CY}px` }}
              transition={{ duration: 2.2, delay: 1.1, repeat: Infinity, ease: "linear" }}
            >
              <motion.circle
                cx={50 + 16} cy={APEX_CY} r={2.5}
                fill={DOT_IN} filter={`url(#${uid}-og)`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.35, delay: 1.1 }}
              />
            </motion.g>
          </>
        ) : (
          <>
            <circle cx={50} cy={APEX_CY} r={9} fill={GLOW} filter={`url(#${uid}-dg)`} />
            <circle cx={50} cy={APEX_CY} r={4.5} fill={DOT_IN} />
          </>
        )}

        {/* ── 3b. Left arm — shoots DOWN from apex ── */}
        {animated ? (
          <motion.path
            d={LEFT_ARM}
            stroke={ARM} strokeWidth="6.5" strokeLinecap="round" fill="none"
            filter={`url(#${uid}-ag)`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <path d={LEFT_ARM} stroke={ARM} strokeWidth="6.5" strokeLinecap="round" fill="none" filter={`url(#${uid}-ag)`} />
        )}

        {/* ── 3c. Right arm — shoots DOWN from apex, 120 ms stagger ── */}
        {animated ? (
          <motion.path
            d={RIGHT_ARM}
            stroke={ARM} strokeWidth="6.5" strokeLinecap="round" fill="none"
            filter={`url(#${uid}-ag)`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <path d={RIGHT_ARM} stroke={ARM} strokeWidth="6.5" strokeLinecap="round" fill="none" filter={`url(#${uid}-ag)`} />
        )}

        {/* ── 4. Person head — drops in from above ── */}
        {animated ? (
          <motion.circle cx={50} cy={50} r={11} fill={PERSON}
            initial={{ y: -14, scale: 0.6, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 340, damping: 18, delay: 0.52 }}
          />
        ) : (
          <circle cx={50} cy={50} r={11} fill={PERSON} />
        )}

        {/* ── 5. Person body — scales up from top ── */}
        {animated ? (
          <motion.rect x={38} y={61} width={24} height={14} rx={5} fill={PERSON}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            style={{ transformOrigin: "50px 61px" }}
            transition={{ duration: 0.28, delay: 0.62, ease: "easeOut" }}
          />
        ) : (
          <rect x={38} y={61} width={24} height={14} rx={5} fill={PERSON} />
        )}
      </svg>

      {/* ── Wordmark — staggered per character ── */}
      {showText && (
        <span style={{
          fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
          fontWeight: 800,
          fontSize: textSize,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          display: "inline-flex",
          color: "hsl(var(--foreground))",
        }}>
          {animated ? (
            <>
              {INSURA.map((ch, i) => (
                <motion.span
                  key={`i-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.3 + i * 0.045, ease: "easeOut" }}
                >{ch}</motion.span>
              ))}
              {BRIDGE.map((ch, i) => (
                <motion.span
                  key={`b-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.57 + i * 0.045, ease: "easeOut" }}
                  style={{
                    background: "linear-gradient(90deg,#38bdf8 0%,#00C896 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >{ch}</motion.span>
              ))}
            </>
          ) : (
            <>
              <span>Insura</span>
              <span style={{
                background: "linear-gradient(90deg,#38bdf8 0%,#00C896 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Bridge</span>
            </>
          )}
        </span>
      )}
    </div>
  )
}
