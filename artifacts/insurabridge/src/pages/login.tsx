import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Zap, AlertCircle, Mail, Lock } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useAppNavigate } from "@/hooks/use-navigate"
import { ParticleNetwork } from "@/components/ParticleNetwork"
import { AuroraBackground } from "@/components/AuroraBackground"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"

const roles = [
  { label: "TPA",      slug: "tpa",      color: "#1B3A6B", email: "ops@meditpa.com" },
  { label: "Insurer",  slug: "insurer",  color: "#00897B", email: "claims@nationallife.com" },
  { label: "Hospital", slug: "hospital", color: "#2a5298", email: "admin@cityhospital.com" },
  { label: "Customer", slug: "customer", color: "#00BFA5", email: "rahul@example.com" },
  { label: "Admin",    slug: "admin",    color: "#6D28D9", email: "admin@insurabridge.com" },
]

const EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "meditpa.com", "nationallife.com", "cityhospital.com",
  "insurabridge.com", "hospital.in", "healthcare.in",
]

const DEMO_PASSWORD = "demo1234"

/* ─── Framed error banner ───────────────────────────────────── */
function ErrorFrame({ msg }: { msg: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          key="err"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          role="alert"
          aria-live="assertive"
          className="rounded-xl overflow-hidden"
          style={{
            border: "1px solid rgba(220,38,38,0.35)",
            boxShadow: "0 0 0 3px rgba(220,38,38,0.08), 0 4px 20px rgba(220,38,38,0.15)",
          }}
        >
          {/* Top accent bar */}
          <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg,#dc2626,#ef4444,#dc2626)" }} />
          <div className="flex items-start gap-2.5 px-4 py-3" style={{ background: "rgba(220,38,38,0.08)" }}>
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
            </motion.div>
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ color: "#f87171" }}>Authentication Failed</p>
              <p className="text-xs" style={{ color: "#fca5a5" }}>{msg}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Email field with domain completion ────────────────────── */
function EmailSuggest({
  value, onChange, activeColor, allEmails,
}: {
  value: string; onChange: (v: string) => void; activeColor: string; allEmails: string[]
}) {
  const [open, setOpen]     = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const atIdx  = value.indexOf("@")
  const local  = atIdx === -1 ? value : value.slice(0, atIdx)
  const domain = atIdx === -1 ? "" : value.slice(atIdx + 1)

  // After @: suggest matching domains. Before @: suggest known demo emails
  const suggestions: string[] = atIdx !== -1
    ? EMAIL_DOMAINS
        .filter(d => d.toLowerCase().startsWith(domain.toLowerCase()) && d.toLowerCase() !== domain.toLowerCase())
        .map(d => `${local}@${d}`)
    : value.length >= 1
      ? allEmails.filter(e => e.toLowerCase().startsWith(value.toLowerCase()) && e !== value)
      : []

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#475569" }} />
        <input
          type="email"
          value={value}
          required
          placeholder="you@example.com"
          autoComplete="off"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: "rgba(14,26,54,0.85)", border: `1.5px solid ${focused ? activeColor : "#1c3360"}`, color: "#e2e8f0" }}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); setOpen(true) }}
          onBlur={() => setFocused(false)}
        />
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            key="email-sg"
            initial={{ opacity: 0, y: -6, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.9 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden"
            style={{
              background: "rgba(6,12,26,0.98)",
              border: "1.5px solid #1c3360",
              boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
              transformOrigin: "top",
            }}
          >
            {suggestions.map((s, i) => {
              const [sLocal, sDomain] = s.split("@")
              return (
                <motion.button
                  key={s}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                  onMouseDown={() => { onChange(s); setOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 transition-colors"
                  style={{
                    color: "#e2e8f0",
                    borderBottom: i < suggestions.length - 1 ? "1px solid #1c336040" : "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Mail className="w-3 h-3 flex-shrink-0" style={{ color: activeColor }} />
                  <span style={{ color: "#94a3b8" }}>{sLocal}</span>
                  <span style={{ color: activeColor }}>@{sDomain}</span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function Login() {
  const { login }    = useAuth()
  const navigate     = useAppNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState(0)
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roleParam = params.get("role")
    if (roleParam) {
      const idx = roles.findIndex(r => r.slug === roleParam.toLowerCase())
      if (idx !== -1) setSelectedRole(idx)
    }
  }, [])

  const activeColor = roles[selectedRole].color
  const allEmails   = roles.map(r => r.email)

  function fillDemo() {
    setEmail(roles[selectedRole].email)
    setPassword(DEMO_PASSWORD)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    try {
      await login(email, password)
      navigate("/")
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Click Fill Demo to auto-fill.")
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const bg       = "linear-gradient(145deg, #060c1a 0%, #081428 45%, #060f12 100%)"
  const cardBg   = "rgba(8,18,38,0.88)"
  const heading  = "#f1f5f9"
  const sub      = "#64748b"
  const labelClr = "#94a3b8"
  const inputBg  = "rgba(14,26,54,0.85)"
  const inputBdr = "#1c3360"
  const inputClr = "#e2e8f0"

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: bg, fontFamily: "'Inter', sans-serif" }}
      aria-label="InsuraBridge Portal Login"
    >
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <AuroraBackground /><ParticleNetwork />
      </div>

      {/* Decorative rings */}
      {[700, 920].map((size, i) => (
        <motion.div key={size} className="absolute pointer-events-none"
          style={{ width: size, height: size, border: `1px solid rgba(0,191,165,${i === 0 ? 0.09 : 0.05})`, borderRadius: "50%", top: "50%", left: "50%", x: "-50%", y: "-50%" }}
          animate={{ rotate: i === 0 ? 360 : -360 }}
          transition={{ duration: i === 0 ? 40 : 55, repeat: Infinity, ease: "linear" }} aria-hidden />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <motion.div
          animate={shaking ? { x: [0, -10, 10, -7, 7, -4, 4, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
          style={{
            background: cardBg,
            border: "1.5px solid #1c3360",
            boxShadow: `0 8px 48px rgba(0,0,0,0.55), 0 0 80px ${activeColor}18`,
            transition: "box-shadow 0.4s ease",
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-between mb-6">
            <InsuraBridgeLogo size={38} textSize="1rem" />
            <p className="text-xs" style={{ color: sub }}>Unified Insurance Portal</p>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: heading }}>Welcome back</h1>
          <p className="text-sm mb-5" style={{ color: sub }}>Sign in to access your role dashboard</p>

          {/* Demo banner */}
          <motion.div
            className="mb-5 p-3 rounded-xl flex items-start gap-2.5"
            style={{ background: "rgba(0,137,123,0.10)", border: "1px solid rgba(0,191,165,0.28)" }}
            whileHover={{ scale: 1.01 }}
          >
            <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#00897B" }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: "#34d399" }}>Demo Mode</p>
              <p className="text-xs mt-0.5" style={{ color: sub }}>
                Select a role and click <strong className="text-white/70">Fill Demo</strong> to auto-fill credentials.
              </p>
            </div>
          </motion.div>

          {/* Role pills */}
          <div className="mb-5">
            <p className="text-xs font-medium mb-2" style={{ color: labelClr }}>Select your role</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role, idx) => {
                const active = selectedRole === idx
                return (
                  <motion.button
                    key={role.slug}
                    type="button"
                    onClick={() => { setSelectedRole(idx); setError("") }}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.04 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: active ? role.color + "33" : "rgba(14,26,54,0.7)",
                      border: `1.5px solid ${active ? role.color : "#1c3360"}`,
                      color: active ? "#f1f5f9" : "#64748b",
                      boxShadow: active ? `0 0 14px ${role.color}44` : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {role.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>Email address</label>
              <EmailSuggest
                value={email}
                onChange={v => { setEmail(v); setError("") }}
                activeColor={activeColor}
                allEmails={allEmails}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#475569" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError("") }}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: inputClr }}
                  onFocus={e => (e.target.style.borderColor = activeColor)}
                  onBlur={e => (e.target.style.borderColor = inputBdr)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#64748b" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Framed error */}
            <ErrorFrame msg={error} />

            {/* Buttons row */}
            <div className="flex gap-2 pt-1">
              <motion.button type="button" onClick={fillDemo} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "rgba(14,26,54,0.7)", border: "1.5px solid #1c3360", color: "#94a3b8" }}>
                Fill Demo
              </motion.button>
              <motion.button type="submit"
                whileHover={{ scale: 1.015, boxShadow: `0 8px 32px ${activeColor}66` }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="flex-[2] py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ background: `linear-gradient(135deg, #1B3A6B 0%, ${activeColor} 100%)`, boxShadow: `0 4px 20px ${activeColor}44`, transition: "box-shadow 0.3s" }}
                aria-label={loading ? "Signing in…" : `Sign in as ${roles[selectedRole].label}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : `Sign In as ${roles[selectedRole].label}`}
              </motion.button>
            </div>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: "1px solid #112044" }}>
            <p className="text-center text-xs" style={{ color: "#334155" }}>© 2026 InsuraBridge · All rights reserved</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
