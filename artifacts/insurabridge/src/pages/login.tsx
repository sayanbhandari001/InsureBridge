import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Zap, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useLocation } from "wouter"
import { ParticleNetwork } from "@/components/ParticleNetwork"
import { AuroraBackground } from "@/components/AuroraBackground"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"

const roles = [
  { label: "TPA", slug: "tpa", color: "#1B3A6B", email: "ops@meditpa.com" },
  { label: "Insurer", slug: "insurer", color: "#00897B", email: "claims@nationallife.com" },
  { label: "Hospital", slug: "hospital", color: "#2a5298", email: "admin@cityhospital.com" },
  { label: "Customer", slug: "customer", color: "#00BFA5", email: "rahul@example.com" },
  { label: "Admin", slug: "admin", color: "#6D28D9", email: "admin@insurabridge.com" },
]

const DEMO_PASSWORD = "demo1234"

export default function Login() {
  const { login } = useAuth()
  const [, setLocation] = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roleParam = params.get("role")
    if (roleParam) {
      const idx = roles.findIndex((r) => r.slug === roleParam.toLowerCase())
      if (idx !== -1) setSelectedRole(idx)
    }
  }, [])

  const activeColor = roles[selectedRole].color
  const ringGlow = `${activeColor}55`

  function fillDemo() {
    setEmail(roles[selectedRole].email)
    setPassword(DEMO_PASSWORD)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    try {
      await login(email, password)
      setLocation("/")
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Use Fill Demo to try it out.")
    } finally {
      setLoading(false)
    }
  }

  const bg = "linear-gradient(145deg, #060c1a 0%, #081428 45%, #060f12 100%)"
  const cardBg = "rgba(8,18,38,0.88)"
  const heading = "#f1f5f9"
  const sub = "#64748b"
  const labelClr = "#94a3b8"
  const inputBg = "rgba(14,26,54,0.85)"
  const inputBdr = "#1c3360"
  const inputClr = "#e2e8f0"
  const bannerBg = "rgba(0,137,123,0.10)"
  const bannerBdr = "rgba(0,191,165,0.28)"
  const divClr = "#112044"
  const backBdr = "#1c3360"
  const backClr = "#94a3b8"
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: bg, fontFamily: "'Inter', sans-serif" }}
      aria-label="InsuraBridge Portal Login"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Animated background layers */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <AuroraBackground />
        <ParticleNetwork />
      </div>

      {/* Decorative rotating rings */}
      {[700, 920].map((size, i) => (
        <motion.div
          key={size}
          className="absolute pointer-events-none"
          style={{
            width: size,
            height: size,
            border: `1px solid rgba(0,191,165,${i === 0 ? 0.09 : 0.05})`,
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
          }}
          animate={{ rotate: i === 0 ? 360 : -360 }}
          transition={{ duration: i === 0 ? 40 : 55, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
          style={{
            background: cardBg,
            border: "1.5px solid #1c3360",
            boxShadow: `0 8px 48px rgba(0,0,0,0.55), 0 0 0 1px #1c336055, 0 0 80px ${ringGlow}22`,
            transition: "box-shadow 0.4s ease",
          }}
        >
          {/* Logo header */}
          <div className="flex items-center justify-between mb-6">
            <InsuraBridgeLogo size={38} textSize="1rem" />
            <p className="text-xs" style={{ color: sub }}>
              Unified Insurance Portal
            </p>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: heading }}>
            Welcome back
          </h1>
          <p className="text-sm mb-5" style={{ color: sub }}>
            Sign in to access your role dashboard
          </p>

          {/* Demo mode banner */}
          <div
            className="mb-5 p-3 rounded-xl flex items-start gap-2.5"
            style={{ background: bannerBg, border: `1px solid ${bannerBdr}` }}
            role="note"
            aria-label="Demo mode instructions"
          >
            <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#00897B" }} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: "#34d399" }}>
                Demo Mode
              </p>
              <p className="text-xs mt-0.5" style={{ color: sub }}>
                Select a role and click <strong>Fill Demo</strong> to auto-fill credentials, then Sign in.
              </p>
            </div>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <p className="text-xs font-medium mb-2" style={{ color: labelClr }}>
              Select your role
            </p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role, idx) => {
                const active = selectedRole === idx
                return (
                  <motion.button
                    key={role.slug}
                    type="button"
                    onClick={() => {
                      setSelectedRole(idx)
                      setError("")
                    }}
                    whileTap={{ scale: 0.96 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: active ? role.color + "33" : "rgba(14,26,54,0.7)",
                      border: `1.5px solid ${active ? role.color : "#1c3360"}`,
                      color: active ? "#f1f5f9" : "#64748b",
                      boxShadow: active ? `0 0 12px ${role.color}44` : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {role.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: inputBg,
                  border: `1.5px solid ${inputBdr}`,
                  color: inputClr,
                }}
                onFocus={(e) => (e.target.style.borderColor = activeColor)}
                onBlur={(e) => (e.target.style.borderColor = inputBdr)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: inputBg,
                    border: `1.5px solid ${inputBdr}`,
                    color: inputClr,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = activeColor)}
                  onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#64748b" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  aria-live="assertive"
                  className="p-3 rounded-xl flex items-center gap-2 text-xs font-medium"
                  style={{
                    background: "rgba(220,38,38,0.12)",
                    color: "#dc2626",
                    border: "1px solid rgba(220,38,38,0.3)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fill Demo + Sign in row */}
            <div className="flex gap-2 pt-1">
              <motion.button
                type="button"
                onClick={fillDemo}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "rgba(14,26,54,0.7)",
                  border: `1.5px solid ${backBdr}`,
                  color: backClr,
                }}
              >
                Fill Demo
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="flex-[2] py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: `linear-gradient(135deg, #1B3A6B 0%, ${activeColor} 100%)`,
                  boxShadow: `0 8px 32px ${activeColor}55`,
                  outlineColor: activeColor,
                }}
                aria-label={loading ? "Signing in…" : `Sign in as ${roles[selectedRole].label}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  `Sign In as ${roles[selectedRole].label}`
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${divClr}` }}>
            <p className="text-center text-xs" style={{ color: "#334155" }}>
              © 2026 InsuraBridge · All rights reserved
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
