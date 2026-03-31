import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "wouter"
import {
  ArrowRight,
  Building2,
  Users,
  FileText,
  Zap,
  CheckCircle2,
  HeartPulse,
  BadgeCheck,
  Globe,
  ChevronDown,
  Star,
  Clock,
  BarChart3,
  Lock,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  TrendingUp,
  Award,
  Layers,
  RefreshCw,
} from "lucide-react"
import { AuroraBackground } from "@/components/AuroraBackground"
import { ParticleNetwork } from "@/components/ParticleNetwork"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"

/* ─── colour tokens ─────────────────────────────────────── */
const C = {
  bg: "linear-gradient(145deg,#060c1a 0%,#081428 55%,#060f12 100%)",
  card: "rgba(8,18,38,0.82)",
  cardBorder: "#1c3360",
  heading: "#f1f5f9",
  sub: "#64748b",
  accent: "#93c5fd",
  accentGreen: "#34d399",
  grad: "linear-gradient(135deg,#1B3A6B 0%,#00897B 100%)",
  gradReverse: "linear-gradient(135deg,#00897B 0%,#1B3A6B 100%)",
}

/* ─── data ───────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Who We Serve", href: "#roles" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
]

const STATS = [
  { value: "500+", label: "Empanelled Hospitals" },
  { value: "1.2M+", label: "Claims Processed" },
  { value: "98.4%", label: "Settlement Rate" },
  { value: "60+", label: "Insurer Partners" },
  { value: "<4h", label: "Avg Claim TAT" },
  { value: "₹3,200Cr", label: "Claims Settled" },
]

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Real-Time Claim Tracking",
    desc: "End-to-end visibility on every claim with live status, auto-escalation, and smart notifications across all stakeholders.",
    color: "#ef4444",
  },
  {
    icon: Globe,
    title: "Network Empanelment",
    desc: "Onboard hospitals and diagnostic centres into the cashless network with digital KYC, rate contracts, and live status tracking.",
    color: "#3b82f6",
  },
  {
    icon: BadgeCheck,
    title: "Digital E-Cards",
    desc: "Issue and manage digital insurance cards instantly. Members can download, share, or present from any device.",
    color: "#8b5cf6",
  },
  {
    icon: FileText,
    title: "Smart Document Vault",
    desc: "Centralised repository with version control, e-signature workflows, and one-click sharing for all claim documents.",
    color: "#f59e0b",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Real-time dashboards and exportable reports on claims, settlements, member utilisation, and network performance.",
    color: "#10b981",
  },
  {
    icon: RefreshCw,
    title: "Renewals & Portability",
    desc: "Automated renewal reminders, policy portability requests, and seamless endorsement processing — all in one place.",
    color: "#06b6d4",
  },
  {
    icon: Users,
    title: "Multi-Role Access Control",
    desc: "Role-based dashboards tailored for TPAs, Insurers, Hospitals, and Customers with granular permission management.",
    color: "#ec4899",
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    desc: "Automated payment triggers with NEFT/RTGS integration, audit trails, and real-time reconciliation for every disbursement.",
    color: "#f97316",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    desc: "ISO 27001-aligned infrastructure, end-to-end encryption, and IRDAI-compliant data residency for complete peace of mind.",
    color: "#6366f1",
  },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect Your Stakeholders",
    desc: "Onboard TPAs, insurers, hospitals, and members onto a single unified platform in days, not months.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Configure Your Workflows",
    desc: "Set claim approval flows, escalation rules, settlement thresholds, and notification preferences — no coding required.",
    icon: RefreshCw,
  },
  {
    step: "03",
    title: "Go Live & Track Everything",
    desc: "Process claims, issue e-cards, manage the network, and monitor every KPI in real time from one intelligent hub.",
    icon: TrendingUp,
  },
]

const ROLES = [
  {
    slug: "tpa",
    label: "Third-Party Administrators",
    tagline: "Streamline operations at scale",
    desc: "Manage claim intake, processing, and settlement across multiple insurers and hospitals from a single operations dashboard.",
    features: ["Bulk claim ingestion", "Auto-adjudication rules", "Hospital coordination", "Insurer reconciliation"],
    color: "#1B3A6B",
    glow: "#1B3A6B55",
  },
  {
    slug: "insurer",
    label: "Insurance Companies",
    tagline: "Full portfolio visibility",
    desc: "Monitor your entire policy portfolio, track claim ratios, manage TPA performance, and enforce underwriting guidelines.",
    features: ["Loss ratio dashboards", "TPA performance SLAs", "Policy analytics", "Regulatory reporting"],
    color: "#00897B",
    glow: "#00897B55",
  },
  {
    slug: "hospital",
    label: "Hospitals & Clinics",
    tagline: "Faster cashless clearances",
    desc: "Submit pre-authorisation requests, upload discharge documents, and receive settlements — all through one secure portal.",
    features: ["Pre-auth in minutes", "Digital billing", "Real-time settlement", "Network empanelment"],
    color: "#2a5298",
    glow: "#2a529855",
  },
  {
    slug: "customer",
    label: "Policy Holders",
    tagline: "Your health, always covered",
    desc: "Track claims, download e-cards, check network hospitals, and reach support — all from your personal member portal.",
    features: ["Claim status tracking", "Digital e-card", "Network finder", "24×7 support chat"],
    color: "#00BFA5",
    glow: "#00BFA555",
  },
]

const TESTIMONIALS = [
  {
    name: "Rajiv Mehta",
    title: "COO, MediTPA Solutions",
    text: "InsuraBridge cut our claim TAT from 9 days to under 4 hours. The real-time dashboards and auto-escalation alone saved us two full-time headcounts.",
    rating: 5,
  },
  {
    name: "Dr. Anjali Sharma",
    title: "Medical Director, City General Hospital",
    text: "Pre-auth used to be a phone-call nightmare. Now it's a two-minute digital workflow. Our cashless clearance rate went from 68% to 94% within the first quarter.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    title: "Head of Claims, National Life & Health",
    text: "The analytics module gives us loss ratio breakdowns by product, geography, and age band — data we used to build manually in spreadsheets every month.",
    rating: 5,
  },
  {
    name: "Amit Kulkarni",
    title: "Policy Holder",
    text: "I filed a claim on Monday morning and had a settlement confirmation by Tuesday afternoon. I didn't have to call anyone — everything happened through the app.",
    rating: 5,
  },
]

const FAQS = [
  {
    q: "How long does onboarding take?",
    a: "Most organisations are fully live within 7–14 business days. Our dedicated implementation team handles data migration, role configuration, and training.",
  },
  {
    q: "Is InsuraBridge compliant with IRDAI regulations?",
    a: "Yes. InsuraBridge is built to meet IRDAI guidelines on data localisation, audit trails, and policyholder data protection. We provide compliance reports on request.",
  },
  {
    q: "Can we integrate with our existing hospital management system?",
    a: "Absolutely. We provide REST APIs and HL7/FHIR connectors, and have pre-built integrations with Athena, MocDoc, Practo, and several leading HMS platforms.",
  },
  {
    q: "What support SLA do you offer?",
    a: "All plans include 24×7 critical-issue support with a 2-hour response SLA. Standard queries are resolved within one business day.",
  },
  {
    q: "How is pricing structured?",
    a: "Pricing is based on the number of members managed and active modules. We offer flexible per-member-per-month plans for insurers, and fixed monthly plans for hospitals. Contact us for a custom quote.",
  },
]

const PARTNERS = ["StarHealth", "HDFC ERGO", "Niva Bupa", "New India", "ICICI Lombard", "Bajaj Allianz", "Aditya Birla Health", "Care Health"]

/* ─── helpers ────────────────────────────────────────────── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

/* ─── sub-components ─────────────────────────────────────── */
function NavBar({ onLogin, onJoin }: { onLogin: () => void; onJoin: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: "rgba(6,12,26,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(28,51,96,0.6)",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <InsuraBridgeLogo size={36} textSize="0.95rem" />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.href.slice(1))}
              className="text-sm font-medium transition-colors"
              style={{ color: C.sub }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.accent)}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.sub)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onJoin}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(14,26,54,0.7)", border: `1.5px solid ${C.cardBorder}`, color: C.accent }}
          >
            Join Network
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogin}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5"
            style={{ background: C.grad, boxShadow: "0 4px 16px rgba(0,137,123,0.35)" }}
          >
            Portal Login <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg"
          style={{ color: C.sub }}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
            style={{ background: "rgba(6,12,26,0.97)", borderTop: "1px solid #1c3360" }}
          >
            <div className="px-5 py-4 space-y-3">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => { scrollTo(l.href.slice(1)); setOpen(false) }}
                  className="block w-full text-left text-sm font-medium py-2"
                  style={{ color: C.sub }}
                >
                  {l.label}
                </button>
              ))}
              <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: "#1c3360" }}>
                <button onClick={onJoin} className="py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1.5px solid ${C.cardBorder}`, color: C.accent }}>
                  Join Network
                </button>
                <button onClick={onLogin} className="py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: C.grad }}>
                  Portal Login
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
      style={{ background: "rgba(0,137,123,0.15)", border: "1px solid rgba(0,191,165,0.28)", color: "#34d399" }}
    >
      <CheckCircle2 className="w-3 h-3" />
      {text}
    </span>
  )
}

function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(8px)", ...style }}
    >
      {children}
    </div>
  )
}

/* ─── main component ─────────────────────────────────────── */
export default function Home() {
  const [, setLocation] = useLocation()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const goLogin = () => setLocation("/login")
  const goJoin = () => setLocation("/network-join")

  return (
    <div className="min-h-screen relative" style={{ background: C.bg, fontFamily: "'Inter',sans-serif", color: C.heading }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Global animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <AuroraBackground />
        <ParticleNetwork />
      </div>

      <NavBar onLogin={goLogin} onJoin={goJoin} />

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative z-10 pt-32 pb-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
            <SectionLabel text="Trusted by 60+ Insurers across India" />
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-tight mb-6">
              The Intelligent Hub for{" "}
              <span
                style={{
                  background: "linear-gradient(90deg,#93c5fd 0%,#34d399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Modern Insurance
              </span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed mb-8 max-w-xl" style={{ color: C.sub }}>
              InsuraBridge unifies TPAs, Insurers, Hospitals, and Members on one intelligent platform —
              automating claims, empanelments, settlements, and member experiences end-to-end.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={goJoin}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm"
                style={{ background: C.grad, boxShadow: "0 8px 32px rgba(0,137,123,0.45)" }}
              >
                <Building2 className="w-4 h-4" /> Join the Network
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={goLogin}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm"
                style={{ background: "rgba(14,26,54,0.75)", border: `1.5px solid ${C.cardBorder}`, color: C.accent }}
              >
                Portal Login <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-3">
              {["IRDAI Compliant", "ISO 27001", "₹3,200Cr+ Settled", "24×7 Support"].map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(0,137,123,0.1)", border: "1px solid rgba(0,191,165,0.2)", color: "#34d399" }}
                >
                  <CheckCircle2 className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: floating stats grid */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 * i }}
                className="p-5 rounded-2xl text-center"
                style={{ background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
              >
                <p className="text-2xl xl:text-3xl font-extrabold mb-1" style={{ color: C.accent }}>
                  {s.value}
                </p>
                <p className="text-xs font-medium" style={{ color: C.sub }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PARTNER STRIP ─────────────────────────────── */}
      <section className="relative z-10 py-10 border-y" style={{ borderColor: "#112044" }}>
        <p className="text-center text-xs font-semibold mb-6 tracking-widest uppercase" style={{ color: "#334155" }}>
          Trusted by leading insurers & TPAs
        </p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 px-5">
          {PARTNERS.map((p) => (
            <span key={p} className="text-sm font-semibold" style={{ color: "#334155" }}>
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Platform Capabilities" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything you need, nothing you don't</h2>
            <p className="max-w-2xl mx-auto text-base" style={{ color: C.sub }}>
              Nine purpose-built modules that cover every touchpoint in the health insurance ecosystem.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
              >
                <Card className="p-6 h-full group cursor-default hover:border-opacity-80 transition-all"
                  style={{ borderColor: f.color + "33" }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.color + "22", border: `1px solid ${f.color}44` }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: C.heading }}>
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: C.sub }}>
                    {f.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Getting Started" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Up and running in three steps</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: C.sub }}>
              From signup to first settled claim in under two weeks — with our implementation team by your side.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px"
              style={{ background: "linear-gradient(90deg,transparent,#1c3360,transparent)" }}
            />
            {HOW_IT_WORKS.map((h, i) => (
              <motion.div
                key={h.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i }}
              >
                <Card className="p-7 text-center h-full">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: C.grad, boxShadow: "0 4px 20px rgba(0,137,123,0.3)" }}
                  >
                    <h.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-bold mb-1" style={{ color: "#334155" }}>
                    Step {h.step}
                  </p>
                  <h3 className="text-base font-bold mb-2" style={{ color: C.heading }}>
                    {h.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: C.sub }}>
                    {h.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE SERVE (ROLES) ──────────────────────── */}
      <section id="roles" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Built for Every Role" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">One platform, four perspectives</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: C.sub }}>
              Each stakeholder gets a tailored dashboard with only what they need, nothing more.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {ROLES.map((r, i) => (
              <motion.div
                key={r.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -4 }}
                onClick={() => setLocation(`/login?role=${r.slug}`)}
                className="cursor-pointer"
              >
                <Card className="p-6 h-full transition-all hover:shadow-xl" style={{ borderColor: r.color + "55" }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-black text-sm"
                    style={{ background: r.color + "33", color: r.color === "#00BFA5" ? "#00BFA5" : C.accent }}
                  >
                    {r.label.charAt(0)}
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: C.heading }}>
                    {r.label}
                  </h3>
                  <p className="text-xs font-medium mb-3" style={{ color: r.color === "#00897B" ? "#34d399" : C.accent }}>
                    {r.tagline}
                  </p>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: C.sub }}>
                    {r.desc}
                  </p>
                  <ul className="space-y-1.5">
                    {r.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#34d399" }} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: C.accent }}>
                    Sign in as {r.label.split(" ")[0]} <ArrowRight className="w-3 h-3" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section id="testimonials" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Customer Stories" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Trusted by the industry's best</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: C.sub }}>
              Real results from real organisations using InsuraBridge every day.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed flex-1 mb-5 italic" style={{ color: "#94a3b8" }}>
                    "{t.text}"
                  </p>
                  <div>
                    <p className="text-xs font-bold" style={{ color: C.heading }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: C.sub }}>
                      {t.title}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section id="faq" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Common Questions" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
              >
                <Card className="overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-semibold pr-4" style={{ color: C.heading }}>
                      {f.q}
                    </span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: C.sub }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-xs leading-relaxed" style={{ color: C.sub }}>
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 md:p-16">
            <Award className="w-12 h-12 mx-auto mb-6 text-blue-300" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to modernise your insurance operations?</h2>
            <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: C.sub }}>
              Join 60+ insurers, 500+ hospitals, and 1.2 million members already on InsuraBridge.
              Get started in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={goJoin}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white"
                style={{ background: C.grad, boxShadow: "0 8px 32px rgba(0,137,123,0.45)" }}
              >
                <Building2 className="w-4 h-4" /> Join the Network
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={goLogin}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold"
                style={{ background: "rgba(14,26,54,0.8)", border: `1.5px solid ${C.cardBorder}`, color: C.accent }}
              >
                Portal Login <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </Card>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="relative z-10 border-t" style={{ borderColor: "#112044" }}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <InsuraBridgeLogo size={30} textSize="0.85rem" />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.sub }}>
                The unified platform for modern health insurance — connecting TPAs, insurers, hospitals, and members.
              </p>
            </div>

            {/* Platform */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#334155" }}>
                Platform
              </p>
              {["Claims Management", "Network Empanelment", "E-Cards & Members", "Settlements", "Analytics"].map((l) => (
                <button key={l} onClick={goLogin} className="block text-xs mb-2 transition-colors" style={{ color: C.sub }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.accent)}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.sub)}>
                  {l}
                </button>
              ))}
            </div>

            {/* For */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#334155" }}>
                For
              </p>
              {ROLES.map((r) => (
                <button key={r.slug} onClick={() => setLocation(`/login?role=${r.slug}`)} className="block text-xs mb-2 transition-colors"
                  style={{ color: C.sub }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.accent)}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.sub)}>
                  {r.label}
                </button>
              ))}
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#334155" }}>
                Contact
              </p>
              {[
                { icon: Mail, text: "hello@insurabridge.in" },
                { icon: Phone, text: "+91 98765 00000" },
                { icon: MapPin, text: "Mumbai, Maharashtra, India" },
                { icon: Clock, text: "24×7 Critical Support" },
              ].map(({ icon: Icon, text }) => (
                <p key={text} className="flex items-center gap-2 text-xs mb-2.5" style={{ color: C.sub }}>
                  <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "#334155" }} />
                  {text}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: "1px solid #112044" }}>
            <p className="text-xs" style={{ color: "#334155" }}>
              © 2026 InsuraBridge Technologies Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex gap-5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
                <button key={l} className="text-xs transition-colors" style={{ color: "#334155" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.accent)}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#334155")}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
