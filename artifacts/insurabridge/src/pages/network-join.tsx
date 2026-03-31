import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "wouter"
import {
  ShieldCheck,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Send,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react"
import { AuroraBackground } from "@/components/AuroraBackground"
import { ParticleNetwork } from "@/components/ParticleNetwork"

const hospitalTypes = ["Government Hospital", "Private Hospital", "Nursing Home", "Clinic / Polyclinic", "Diagnostic Centre", "Day Care Centre"]

const bg = "linear-gradient(145deg, #060c1a 0%, #081428 45%, #060f12 100%)"
const cardBg = "rgba(8,18,38,0.88)"
const inputBg = "rgba(14,26,54,0.85)"
const inputBdr = "#1c3360"
const inputClr = "#e2e8f0"
const labelClr = "#94a3b8"
const activeColor = "#00897B"

export default function NetworkJoin() {
  const [, setLocation] = useLocation()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    facilityName: "",
    type: "",
    contactPerson: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    message: "",
  })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: bg, fontFamily: "'Inter', sans-serif", color: "#f1f5f9" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <AuroraBackground />
        <ParticleNetwork />
      </div>

      {/* Navbar */}
      <header
        className="relative z-20 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ borderBottom: "1px solid rgba(28,51,96,0.6)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)" }}
          >
            <ShieldCheck className="w-5 h-5 text-blue-200" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">InsuraBridge</span>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(14,26,54,0.7)",
              border: "1.5px solid #1c3360",
              color: "#94a3b8",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/login")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)",
              boxShadow: "0 4px 20px rgba(0,137,123,0.35)",
            }}
          >
            Portal Login
          </motion.button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-xl"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-10 text-center shadow-2xl"
                style={{ background: cardBg, border: "1.5px solid #1c3360" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(0,137,123,0.2)", border: "2px solid #00897B" }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#34d399" }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
                  Application Received!
                </h2>
                <p className="text-sm mb-8" style={{ color: "#64748b" }}>
                  Thank you for your interest in joining the InsuraBridge network. Our empanelment
                  team will review your application and reach out within 2–3 business days.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLocation("/login")}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)",
                      boxShadow: "0 4px 20px rgba(0,137,123,0.35)",
                    }}
                  >
                    Go to Portal Login
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLocation("/")}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: "rgba(14,26,54,0.7)",
                      border: "1.5px solid #1c3360",
                      color: "#94a3b8",
                    }}
                  >
                    Back to Home
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                className="rounded-2xl p-8 shadow-2xl"
                style={{ background: cardBg, border: "1.5px solid #1c3360" }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,137,123,0.2)", border: "1px solid #00897B44" }}
                  >
                    <Building2 className="w-5 h-5" style={{ color: "#34d399" }} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>
                      Join the Network
                    </h1>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      Apply to become a cashless empanelled facility
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Facility Name */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                      Facility / Hospital Name *
                    </label>
                    <div className="relative">
                      <Building2
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#475569" }}
                      />
                      <input
                        required
                        value={form.facilityName}
                        onChange={(e) => handleChange("facilityName", e.target.value)}
                        placeholder="City General Hospital"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: inputClr }}
                        onFocus={(e) => (e.target.style.borderColor = activeColor)}
                        onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                      Facility Type *
                    </label>
                    <select
                      required
                      value={form.type}
                      onChange={(e) => handleChange("type", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: form.type ? inputClr : "#475569" }}
                      onFocus={(e) => (e.target.style.borderColor = activeColor)}
                      onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                    >
                      <option value="" disabled>
                        Select facility type
                      </option>
                      {hospitalTypes.map((t) => (
                        <option key={t} value={t} style={{ background: "#081428" }}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                      Contact Person *
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#475569" }}
                      />
                      <input
                        required
                        value={form.contactPerson}
                        onChange={(e) => handleChange("contactPerson", e.target.value)}
                        placeholder="Dr. Anjali Sharma"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: inputClr }}
                        onFocus={(e) => (e.target.style.borderColor = activeColor)}
                        onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                      />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                        Email *
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "#475569" }}
                        />
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="admin@hospital.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: inputClr }}
                          onFocus={(e) => (e.target.style.borderColor = activeColor)}
                          onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "#475569" }}
                        />
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: inputClr }}
                          onFocus={(e) => (e.target.style.borderColor = activeColor)}
                          onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* City + State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                        City *
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "#475569" }}
                        />
                        <input
                          required
                          value={form.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                          placeholder="Mumbai"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: inputClr }}
                          onFocus={(e) => (e.target.style.borderColor = activeColor)}
                          onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                        State *
                      </label>
                      <input
                        required
                        value={form.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: inputClr }}
                        onFocus={(e) => (e.target.style.borderColor = activeColor)}
                        onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: labelClr }}>
                      Additional Information
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us about your facility, bed capacity, specialities, etc."
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ background: inputBg, border: `1.5px solid ${inputBdr}`, color: inputClr }}
                      onFocus={(e) => (e.target.style.borderColor = activeColor)}
                      onBlur={(e) => (e.target.style.borderColor = inputBdr)}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 mt-2"
                    style={{
                      background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)",
                      boxShadow: "0 8px 32px rgba(0,137,123,0.4)",
                      opacity: loading ? 0.75 : 1,
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="relative z-10 py-5" style={{ borderTop: "1px solid #112044" }}>
        <p className="text-center text-xs" style={{ color: "#334155" }}>
          © 2026 InsuraBridge · All rights reserved
        </p>
      </footer>
    </div>
  )
}
