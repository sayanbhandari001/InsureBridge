import { motion } from "framer-motion"
import { useLocation } from "wouter"
import {
  ShieldCheck,
  ArrowRight,
  Building2,
  Users,
  FileText,
  Zap,
  CheckCircle2,
  Globe,
  HeartPulse,
  BadgeCheck,
} from "lucide-react"
import { AuroraBackground } from "@/components/AuroraBackground"
import { ParticleNetwork } from "@/components/ParticleNetwork"

const stats = [
  { value: "500+", label: "Network Hospitals" },
  { value: "1.2M", label: "Claims Processed" },
  { value: "98.4%", label: "Settlement Rate" },
  { value: "60+", label: "Insurer Partners" },
]

const features = [
  {
    icon: HeartPulse,
    title: "Real-Time Claims",
    desc: "Track and manage claims end-to-end with live status updates and smart escalation.",
  },
  {
    icon: Globe,
    title: "Network Empanelment",
    desc: "Onboard hospitals and clinics seamlessly into the cashless network.",
  },
  {
    icon: FileText,
    title: "Smart Documents",
    desc: "Centralised document repository with version control and e-signatures.",
  },
  {
    icon: BadgeCheck,
    title: "E-Cards & Members",
    desc: "Instant digital insurance cards and member management for every policy.",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    desc: "Tailored dashboards for TPAs, Insurers, Hospitals, and Customers.",
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    desc: "Automated payout triggers with full audit trail for every disbursement.",
  },
]

const roles = [
  { label: "TPA", desc: "Operations & claims management", color: "#1B3A6B" },
  { label: "Insurer", desc: "Policy and portfolio oversight", color: "#00897B" },
  { label: "Hospital", desc: "Cashless admission & billing", color: "#2a5298" },
  { label: "Customer", desc: "Policy holder self-service", color: "#00BFA5" },
]

const bg = "linear-gradient(145deg, #060c1a 0%, #081428 45%, #060f12 100%)"

export default function Home() {
  const [, setLocation] = useLocation()

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: bg, fontFamily: "'Inter', sans-serif", color: "#f1f5f9" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Animated background */}
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
            onClick={() => setLocation("/network-join")}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(14,26,54,0.7)",
              border: "1.5px solid #1c3360",
              color: "#93c5fd",
            }}
          >
            <Building2 className="w-4 h-4" />
            Join the Network
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
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(0,137,123,0.15)",
              border: "1px solid rgba(0,191,165,0.3)",
              color: "#34d399",
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Trusted by 60+ insurers across India
          </span>

          <h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto"
            style={{ color: "#f1f5f9" }}
          >
            The unified platform for{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #93c5fd 0%, #34d399 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              modern insurance
            </span>
          </h1>

          <p className="text-base md:text-lg max-w-xl mx-auto mb-10" style={{ color: "#64748b" }}>
            InsuraBridge connects TPAs, Insurers, Hospitals, and Customers on a single intelligent
            platform — powering faster claims, smarter networks, and seamless member experiences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/network-join")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)",
                boxShadow: "0 8px 32px rgba(0,137,123,0.4)",
                fontSize: "0.95rem",
              }}
            >
              <Building2 className="w-4 h-4" />
              Join the Network
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/login")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold"
              style={{
                background: "rgba(14,26,54,0.75)",
                border: "1.5px solid #1c3360",
                color: "#93c5fd",
                fontSize: "0.95rem",
              }}
            >
              Portal Login
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="rounded-2xl p-5 text-center"
              style={{
                background: "rgba(8,18,38,0.7)",
                border: "1px solid #1c3360",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="text-2xl font-extrabold mb-1" style={{ color: "#93c5fd" }}>
                {s.value}
              </p>
              <p className="text-xs font-medium" style={{ color: "#64748b" }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={{ color: "#f1f5f9" }}>
            Everything in one place
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: "#64748b" }}>
            Purpose-built modules for every stakeholder in the insurance ecosystem.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.5 }}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(8,18,38,0.75)",
                  border: "1px solid #1c3360",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(27,58,107,0.5)", border: "1px solid #1c3360" }}
                >
                  <f.icon className="w-5 h-5" style={{ color: "#93c5fd" }} />
                </div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#f1f5f9" }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={{ color: "#f1f5f9" }}>
            Built for every role
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: "#64748b" }}>
            One platform, four perspectives — each tailored to your workflow.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roles.map((r) => (
              <motion.div
                key={r.label}
                whileHover={{ scale: 1.03 }}
                onClick={() => setLocation(`/login?role=${r.label.toLowerCase()}`)}
                className="rounded-2xl p-5 cursor-pointer transition-all"
                style={{
                  background: "rgba(8,18,38,0.75)",
                  border: `1.5px solid ${r.color}44`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: r.color + "33" }}
                >
                  <span className="text-xs font-bold" style={{ color: r.color === "#2a5298" ? "#93c5fd" : r.color }}>
                    {r.label[0]}
                  </span>
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: "#f1f5f9" }}>
                  {r.label}
                </p>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  {r.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24">
        <div
          className="max-w-3xl mx-auto rounded-2xl p-10 text-center"
          style={{
            background: "rgba(8,18,38,0.85)",
            border: "1px solid #1c3360",
            backdropFilter: "blur(12px)",
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "#f1f5f9" }}>
            Ready to get started?
          </h2>
          <p className="text-sm mb-8" style={{ color: "#64748b" }}>
            Join hundreds of hospitals and insurers already using InsuraBridge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/network-join")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)",
                boxShadow: "0 8px 32px rgba(0,137,123,0.4)",
              }}
            >
              <Building2 className="w-4 h-4" />
              Join the Network
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/login")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold"
              style={{
                background: "rgba(14,26,54,0.75)",
                border: "1.5px solid #1c3360",
                color: "#93c5fd",
              }}
            >
              Portal Login
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6" style={{ borderTop: "1px solid #112044" }}>
        <p className="text-center text-xs" style={{ color: "#334155" }}>
          © 2026 InsuraBridge · All rights reserved
        </p>
      </footer>
    </div>
  )
}
