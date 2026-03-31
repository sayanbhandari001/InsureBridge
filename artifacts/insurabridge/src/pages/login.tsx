import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, ShieldCheck, Zap, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useLocation } from "wouter"
import { ParticleNetwork } from "@/components/ParticleNetwork"
import { AuroraBackground } from "@/components/AuroraBackground"

const roles = [
  { label: "TPA", slug: "tpa", color: "#1B3A6B", email: "ops@meditpa.com" },
  { label: "Insurer", slug: "insurer", color: "#00897B", email: "claims@nationallife.com" },
  { label: "Hospital", slug: "hospital", color: "#2a5298", email: "admin@cityhospital.com" },
  { label: "Customer", slug: "customer", color: "#00BFA5", email: "rahul@example.com" },
  { label: "Admin", slug: "admin", color: "#6D28D9", email: "admin@insurabridge.com" },
]

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
    const demo = roles[selectedRole]
    setEmail(demo.email)
    setPassword("demo1234")
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
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
  const label = "#94a3b8"
  const inputBg = "rgba(14,26,54,0.85)"
  const inputBdr = "#1c3360"
  const inputClr = "#e2e8f0"
  const bannerBg = "rgba(0,137,123,0.10)"
  const bannerBdr = "rgba(0,191,165,0.28)"
  const divClr = "#112044"
  const backBdr = "#1c3360"
  const backClr = "#94a3b8"
  const logoClr = "#93c5fd"

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ background: bg, fontFamily: "'Inter', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <AuroraBackground />
        <ParticleNetwork />
      </div>

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
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)",
                boxShadow: `0 0 18px ${activeColor}44`,
              }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: logoClr }} />
            </div>
            <div>
              <span className="font-bold text-base" style={{ color: heading }}>
                InsuraBridge
              </span>
              <p className="text-xs" style={{ color: sub }}>
                Unified Insurance Portal
              </p>
            </div>
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
            <p className="text-xs font-medium mb-2" style={{ color: label }}>
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
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: label }}>
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
              <label className="block text-xs font-medium mb-1.5" style={{ color: label }}>
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
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.28)",
                    color: "#f87171",
                  }}
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

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
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="flex-[2] py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? activeColor + "99"
                    : `linear-gradient(135deg, ${activeColor} 0%, ${activeColor}cc 100%)`,
                  color: "#fff",
                  boxShadow: loading ? "none" : `0 4px 20px ${activeColor}44`,
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${divClr}` }}>
            <p className="text-center text-xs" style={{ color: "#334155" }}>
              © 2026 InsuraBridge. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
