import {
  useState, useEffect, useRef, useCallback,
} from "react"
import {
  motion, AnimatePresence, useScroll, useTransform,
  useMotionValue, useSpring, animate, useInView,
} from "framer-motion"
import {
  ArrowRight, Building2, CheckCircle2, HeartPulse, BadgeCheck,
  Globe, ChevronDown, Star, Clock, BarChart3, Lock, Phone, Mail,
  MapPin, Menu, X, TrendingUp, Award, Layers, RefreshCw, Zap,
} from "lucide-react"
import { AuroraBackground } from "@/components/AuroraBackground"
import { ParticleNetwork } from "@/components/ParticleNetwork"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"
import { useAppNavigate } from "@/hooks/use-navigate"

/* ─── colours ──────────────────────────────────────────────── */
const C = {
  bg: "linear-gradient(145deg,#060c1a 0%,#081428 55%,#060f12 100%)",
  card: "rgba(8,18,38,0.82)",
  border: "#1c3360",
  heading: "#f1f5f9",
  sub: "#64748b",
  accent: "#93c5fd",
  green: "#34d399",
  grad: "linear-gradient(135deg,#1B3A6B 0%,#00897B 100%)",
}

/* ─── static data ───────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Features",    id: "features" },
  { label: "How It Works",id: "how-it-works" },
  { label: "Who We Serve",id: "roles" },
  { label: "Testimonials",id: "testimonials" },
  { label: "FAQ",         id: "faq" },
]

const STATS: { raw: number; display: string; label: string; prefix?: string; suffix?: string; special?: string }[] = [
  { raw: 500,   display: "500+",       label: "Empanelled Hospitals",  suffix: "+" },
  { raw: 1.2,   display: "1.2M+",      label: "Claims Processed",      suffix: "M+" },
  { raw: 98.4,  display: "98.4%",      label: "Settlement Rate",       suffix: "%" },
  { raw: 60,    display: "60+",        label: "Insurer Partners",       suffix: "+" },
  { raw: 4,     display: "<4h",        label: "Avg Claim TAT",         special: "<4h" },
  { raw: 3200,  display: "₹3,200Cr",   label: "Claims Settled",        prefix: "₹", suffix: "Cr" },
]

const PARTNERS = [
  "StarHealth","HDFC ERGO","Niva Bupa","New India","ICICI Lombard",
  "Bajaj Allianz","Aditya Birla Health","Care Health","ManipalCigna",
  "SBI Health","Reliance Health","Royal Sundaram",
]

const FEATURES = [
  { icon: HeartPulse, title: "Real-Time Claim Tracking", desc: "End-to-end visibility with live status, auto-escalation, and smart notifications.", color: "#ef4444" },
  { icon: Globe,      title: "Network Empanelment",      desc: "Digital KYC, rate contracts, and live status for cashless hospital onboarding.",  color: "#3b82f6" },
  { icon: BadgeCheck, title: "Digital E-Cards",          desc: "Instant insurance cards downloadable from any device, any time.",                  color: "#8b5cf6" },
  { icon: BarChart3,  title: "Analytics & Reports",      desc: "Real-time dashboards and one-click exports for claims, utilisation, and network.", color: "#10b981" },
  { icon: RefreshCw,  title: "Renewals & Portability",   desc: "Automated reminders, portability requests, and endorsement processing.",          color: "#06b6d4" },
  { icon: Zap,        title: "Instant Settlements",      desc: "Automated NEFT/RTGS triggers with full audit trail and real-time reconciliation.", color: "#f97316" },
  { icon: Lock,       title: "Enterprise Security",      desc: "ISO 27001-aligned infra, E2E encryption, IRDAI-compliant data residency.",        color: "#6366f1" },
  { icon: RefreshCw,  title: "Smart Documents",          desc: "Centralised vault with version control, e-signature, and one-click sharing.",     color: "#f59e0b" },
  { icon: Award,      title: "Multi-Role Dashboards",    desc: "Tailored views for TPAs, Insurers, Hospitals, and Members — one platform.",      color: "#ec4899" },
]

const STEPS = [
  { icon: Layers,   step: "01", title: "Connect Stakeholders",     desc: "Onboard TPAs, insurers, hospitals, and members in days — not months." },
  { icon: RefreshCw,step: "02", title: "Configure Workflows",      desc: "Set approval flows, escalation rules, and notification preferences — no code needed." },
  { icon: TrendingUp,step:"03", title: "Go Live & Track",          desc: "Process claims, issue e-cards, and monitor every KPI in real time." },
]

const ROLES = [
  { slug:"tpa",      label:"Third-Party Administrators", tagline:"Streamline operations at scale",      desc:"Manage claim intake, processing, and settlement across multiple insurers from one dashboard.", features:["Bulk claim ingestion","Auto-adjudication","Hospital coordination","Insurer reconciliation"], color:"#1B3A6B" },
  { slug:"insurer",  label:"Insurance Companies",        tagline:"Full portfolio visibility",            desc:"Monitor claim ratios, manage TPA performance, and enforce underwriting guidelines.",           features:["Loss ratio dashboards","TPA SLA tracking","Policy analytics","Regulatory reports"],       color:"#00897B" },
  { slug:"hospital", label:"Hospitals & Clinics",        tagline:"Faster cashless clearances",           desc:"Submit pre-auth, upload discharge docs, and receive settlements through one secure portal.",   features:["Pre-auth in minutes","Digital billing","Real-time settlement","Network empanelment"],    color:"#2a5298" },
  { slug:"customer", label:"Policy Holders",             tagline:"Your health, always covered",          desc:"Track claims, download e-cards, check network hospitals, and reach support instantly.",        features:["Claim status tracking","Digital e-card","Network finder","24×7 support chat"],           color:"#00BFA5" },
]

const TESTIMONIALS = [
  { name:"Rajiv Mehta",      title:"COO, MediTPA Solutions",       text:"InsuraBridge cut our claim TAT from 9 days to under 4 hours. The auto-escalation alone saved two full-time headcounts.", rating:5 },
  { name:"Dr. Anjali Sharma",title:"Medical Director, City General",text:"Pre-auth used to be a phone nightmare. Now it's two minutes. Our cashless clearance rate went from 68% to 94%.",        rating:5 },
  { name:"Priya Nair",       title:"Head of Claims, National Life", text:"Loss ratio breakdowns by product, geography, and age band — data we used to build manually every month.",               rating:5 },
  { name:"Amit Kulkarni",    title:"Policy Holder",                 text:"Filed Monday, settlement confirmation by Tuesday afternoon. Didn't have to call anyone — everything just happened.",     rating:5 },
]

const FAQS = [
  { q:"How long does onboarding take?",                  a:"Most organisations go live within 7–14 business days. Our team handles migration, config, and training." },
  { q:"Is InsuraBridge IRDAI compliant?",                a:"Yes — built to meet IRDAI guidelines on data localisation, audit trails, and policyholder data protection." },
  { q:"Can we integrate with our existing HMS?",         a:"Yes. We have REST APIs, HL7/FHIR connectors, and pre-built integrations with Athena, MocDoc, and Practo." },
  { q:"What support SLA do you offer?",                  a:"All plans include 24×7 critical-issue support with a 2-hour response SLA. Standard queries resolved in one business day." },
  { q:"How is pricing structured?",                      a:"Flexible per-member-per-month for insurers; fixed monthly plans for hospitals. Contact us for a custom quote." },
]

const HERO_WORDS = ["Modern Insurance", "Health Claims", "TPA Operations", "Member Care", "Network Empanelment"]

/* ─── animation variants ───────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}
const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
}

/* ─── small helpers ─────────────────────────────────────────── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

/* ─── AnimatedStat: count-up number display ─────────────────── */
function AnimatedStat({ stat }: { stat: typeof STATS[0] }) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(0)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  // Transform must be called unconditionally at top level
  const displayValue = useTransform(mv, (v) => {
    if (stat.suffix === "%")  return v.toFixed(1)
    if (stat.suffix === "M+") return v.toFixed(1)
    if (stat.suffix === "Cr") return Math.round(v).toLocaleString("en-IN")
    return Math.round(v).toString()
  })

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(mv, stat.raw, { duration: 2.2, ease: "easeOut" })
    return ctrl.stop
  }, [inView, mv, stat.raw])

  if (stat.special) return <span ref={ref}>{stat.special}</span>

  return (
    <motion.span ref={ref}>
      {stat.prefix ?? ""}
      <motion.span>{displayValue}</motion.span>
      {stat.suffix ?? ""}
    </motion.span>
  )
}

/* ─── Marquee ────────────────────────────────────────────────── */
function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden relative" style={{ maskImage: "linear-gradient(90deg,transparent 0%,black 10%,black 90%,transparent 100%)" }}>
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((p, i) => (
          <span key={i} className="text-sm font-bold flex-shrink-0" style={{ color: "#334155" }}>
            {p}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Card tilt on hover ────────────────────────────────────── */
function TiltCard({ children, className = "", style = {}, onClick }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  function onMove(e: React.MouseEvent) {
    const r = ref.current!.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    rotateX.set(-y * 10)
    rotateY.set(x * 10)
  }
  function onLeave() { rotateX.set(0); rotateY.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800, ...style }}
      className={`rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ─── Testimonial carousel ──────────────────────────────────── */
function TestimonialCarousel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(id)
  }, [])

  const t = TESTIMONIALS[idx]

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="rounded-2xl p-8"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex gap-1 mb-4">
            {Array.from({ length: t.rating }).map((_, j) => (
              <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm md:text-base italic leading-relaxed mb-6" style={{ color: "#94a3b8" }}>
            "{t.text}"
          </p>
          <div>
            <p className="text-sm font-bold" style={{ color: C.heading }}>{t.name}</p>
            <p className="text-xs" style={{ color: C.sub }}>{t.title}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot nav */}
      <div className="flex gap-2 justify-center mt-5">
        {TESTIMONIALS.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setIdx(i)}
            animate={{ width: i === idx ? 24 : 8, opacity: i === idx ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
            style={{ background: "linear-gradient(90deg,#1B3A6B,#00897B)" }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Typewriter cycling words ──────────────────────────────── */
function TypewriterWords() {
  const [wordIdx, setWordIdx]   = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    const word = HERO_WORDS[wordIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 60)
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 35)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setWordIdx((i) => (i + 1) % HERO_WORDS.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, wordIdx])

  return (
    <span
      style={{
        background: "linear-gradient(90deg,#93c5fd 0%,#34d399 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline-block",
        minWidth: "2ch",
      }}
    >
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        style={{ WebkitTextFillColor: "#34d399" }}
      >
        |
      </motion.span>
    </span>
  )
}

/* ─── Scroll-progress bar ───────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left"
      style={{ scaleX, background: "linear-gradient(90deg,#1B3A6B,#00897B,#34d399)" }}
    />
  )
}

/* ─── Floating orbs ────────────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[
        { w: 600, h: 600, x: "-20%", y: "10%",  col: "rgba(0,137,123,0.12)", dur: 14 },
        { w: 500, h: 500, x: "70%",  y: "-10%", col: "rgba(27,58,107,0.18)", dur: 18 },
        { w: 400, h: 400, x: "40%",  y: "50%",  col: "rgba(0,191,165,0.08)", dur: 22 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: o.w, height: o.h, left: o.x, top: o.y, background: `radial-gradient(circle,${o.col} 0%,transparent 70%)` }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

/* ─── NavBar ────────────────────────────────────────────────── */
function NavBar({ navigate }: { navigate: (to: string) => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: scrolled ? "rgba(6,12,26,0.95)" : "rgba(6,12,26,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "rgba(28,51,96,0.7)" : "rgba(28,51,96,0.3)"}`,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16">
        <InsuraBridgeLogo size={36} textSize="0.95rem" />

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l, i) => (
            <motion.button
              key={l.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => scrollTo(l.id)}
              className="text-sm font-medium relative group"
              style={{ color: C.sub }}
            >
              <span className="transition-colors group-hover:text-white">{l.label}</span>
              <span
                className="absolute -bottom-0.5 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                style={{ background: "linear-gradient(90deg,#93c5fd,#34d399)" }}
              />
            </motion.button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/network-join")}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(14,26,54,0.7)", border: `1.5px solid ${C.border}`, color: C.accent }}
          >
            Join Network
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,137,123,0.55)" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5"
            style={{ background: C.grad, boxShadow: "0 4px 16px rgba(0,137,123,0.35)" }}
          >
            Portal Login <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        <button className="lg:hidden p-2 rounded-lg" style={{ color: C.sub }} onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
            style={{ background: "rgba(6,12,26,0.98)", borderTop: "1px solid #1c3360" }}
          >
            <div className="px-5 py-4 space-y-3">
              {NAV_LINKS.map((l) => (
                <button key={l.label} onClick={() => { scrollTo(l.id); setOpen(false) }}
                  className="block w-full text-left text-sm font-medium py-2 transition-colors"
                  style={{ color: C.sub }}>
                  {l.label}
                </button>
              ))}
              <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: C.border }}>
                <button onClick={() => { navigate("/network-join"); setOpen(false) }}
                  className="py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1.5px solid ${C.border}`, color: C.accent }}>
                  Join Network
                </button>
                <button onClick={() => { navigate("/login"); setOpen(false) }}
                  className="py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: C.grad }}>
                  Portal Login
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ─── SectionLabel ──────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  return (
    <motion.span
      variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
      style={{ background: "rgba(0,137,123,0.15)", border: "1px solid rgba(0,191,165,0.28)", color: C.green }}
    >
      <CheckCircle2 className="w-3 h-3" /> {text}
    </motion.span>
  )
}

/* ─── main ──────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useAppNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  /* Mouse parallax for hero */
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const r = heroRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set(((e.clientX - r.left) / r.width  - 0.5) * 30)
    mouseY.set(((e.clientY - r.top)  / r.height - 0.5) * 30)
  }, [mouseX, mouseY])

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: C.bg, fontFamily: "'Inter',sans-serif", color: C.heading }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Global animated BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <AuroraBackground />
        <ParticleNetwork />
      </div>

      <ScrollProgress />
      <NavBar navigate={navigate} />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={onMouseMove}
        className="relative z-10 pt-36 pb-20 px-5 md:px-10 min-h-screen flex items-center"
      >
        <FloatingOrbs />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left copy */}
          <div>
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
              <motion.span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "rgba(0,137,123,0.15)", border: "1px solid rgba(0,191,165,0.3)", color: C.green }}
                animate={{ boxShadow: ["0 0 0 0 rgba(0,191,165,0)", "0 0 0 8px rgba(0,191,165,0.1)", "0 0 0 0 rgba(0,191,165,0)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full"
                  style={{ background: C.green }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                Trusted by 60+ Insurers across India
              </motion.span>
            </motion.div>

            <div className="text-4xl md:text-5xl xl:text-6xl font-black leading-tight mb-6">
              {["The Intelligent", "Hub for"].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                style={{ minHeight: "1.2em" }}
              >
                <TypewriterWords />
              </motion.div>
            </div>

            <motion.p
              variants={fadeUp} custom={4} initial="hidden" animate="visible"
              className="text-base md:text-lg leading-relaxed mb-8 max-w-xl"
              style={{ color: C.sub }}
            >
              InsuraBridge unifies TPAs, Insurers, Hospitals, and Members — automating claims,
              empanelments, settlements, and member experiences end-to-end.
            </motion.p>

            <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="flex flex-wrap gap-4 mb-10">
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: "0 12px 40px rgba(0,137,123,0.55)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/network-join")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm relative overflow-hidden"
                style={{ background: C.grad }}
              >
                <motion.span className="absolute inset-0 opacity-0 hover:opacity-100"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
                <Building2 className="w-4 h-4" /> Join the Network
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06, borderColor: C.accent }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm"
                style={{ background: "rgba(14,26,54,0.75)", border: `1.5px solid ${C.border}`, color: C.accent }}
              >
                Portal Login <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Trust pills */}
            <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible" className="flex flex-wrap gap-2">
              {["IRDAI Compliant","ISO 27001","₹3,200Cr+ Settled","24×7 Support"].map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(0,137,123,0.1)", border: "1px solid rgba(0,191,165,0.2)", color: C.green }}
                >
                  <CheckCircle2 className="w-3 h-3" /> {t}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Right: stats grid with parallax */}
          <motion.div
            style={{ x: springX, y: springY }}
            className="grid grid-cols-2 gap-4"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={scaleIn} custom={i} initial="hidden" animate="visible"
                whileHover={{ scale: 1.04, borderColor: "#00897B" }}
                className="p-5 rounded-2xl text-center cursor-default"
                style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(12px)", transition: "border-color 0.25s" }}
              >
                <p className="text-2xl xl:text-3xl font-extrabold mb-1" style={{ color: C.accent }}>
                  <AnimatedStat stat={s} />
                </p>
                <p className="text-xs font-medium" style={{ color: C.sub }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ color: "#334155" }}
        >
          <span className="text-xs">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* ══ PARTNER MARQUEE ═══════════════════════════════════ */}
      <section className="relative z-10 py-10 border-y" style={{ borderColor: "#112044" }}>
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-center text-xs font-semibold mb-6 tracking-widest uppercase"
          style={{ color: "#334155" }}
        >
          Trusted by leading insurers &amp; TPAs
        </motion.p>
        <Marquee items={PARTNERS} />
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Platform Capabilities" />
            <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold mb-4">
              Everything you need, nothing you don't
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="max-w-2xl mx-auto text-base" style={{ color: C.sub }}>
              Nine purpose-built modules covering every touchpoint in the health insurance ecosystem.
            </motion.p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp} custom={i % 3} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="rounded-2xl p-6 cursor-default group"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  backdropFilter: "blur(8px)",
                  transition: "border-color 0.25s, box-shadow 0.25s",
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = f.color + "66"
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${f.color}22`
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = C.border
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = "none"
                }}
              >
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.color + "22", border: `1px solid ${f.color}44` }}
                  whileHover={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </motion.div>
                <h3 className="text-sm font-bold mb-2" style={{ color: C.heading }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Getting Started" />
            <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold mb-4">
              Up and running in three steps
            </motion.h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.18, duration: 0.6, ease: [0.22,1,0.36,1] }}
                className="rounded-2xl p-7 text-center relative"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                {/* Animated step number */}
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: C.grad, boxShadow: "0 4px 20px rgba(0,137,123,0.3)" }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <s.icon className="w-6 h-6 text-white" />
                </motion.div>
                <motion.p
                  className="text-3xl font-black mb-2"
                  style={{
                    background: "linear-gradient(90deg,#93c5fd,#34d399)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.18 + 0.3 }}
                >
                  {s.step}
                </motion.p>
                <h3 className="text-base font-bold mb-2" style={{ color: C.heading }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ROLES ═════════════════════════════════════════════ */}
      <section id="roles" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Built for Every Role" />
            <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold mb-4">
              One platform, four perspectives
            </motion.h2>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {ROLES.map((r, i) => (
              <motion.div
                key={r.slug}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.55 }}
              >
                <TiltCard
                  className="p-6 h-full cursor-pointer"
                  style={{ background: C.card, border: `1.5px solid ${r.color}44`, transition: "border-color 0.25s" }}
                  onClick={() => navigate(`/login?role=${r.slug}`)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-black text-sm"
                    style={{ background: r.color + "33", color: C.accent }}>
                    {r.label.charAt(0)}
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: C.heading }}>{r.label}</h3>
                  <p className="text-xs font-semibold mb-3" style={{ color: r.color === "#00BFA5" ? "#00BFA5" : C.accent }}>
                    {r.tagline}
                  </p>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: C.sub }}>{r.desc}</p>
                  <ul className="space-y-1.5 mb-4">
                    {r.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: C.green }} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.accent }}>
                    Sign in as {r.label.split(" ")[0]} <ArrowRight className="w-3 h-3" />
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section id="testimonials" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel text="Customer Stories" />
            <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold mb-4">
              Trusted by the industry's best
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <TestimonialCarousel />
          </motion.div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════ */}
      <section id="faq" className="relative z-10 py-24 px-5 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Common Questions" />
            <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold mb-4">
              Frequently asked questions
            </motion.h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.45 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold pr-4" style={{ color: C.heading }}>{f.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: C.sub }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-xs leading-relaxed" style={{ color: C.sub }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-5 md:px-10">
        <motion.div
          className="max-w-4xl mx-auto text-center rounded-2xl p-12 md:p-16 relative overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }}
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,137,123,0.12) 0%, transparent 70%)" }}
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }} transition={{ type: "spring", delay: 0.2 }}
          >
            <Award className="w-12 h-12 mx-auto mb-6 text-blue-300" />
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to modernise your insurance operations?
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-base mb-10 max-w-xl mx-auto" style={{ color: C.sub }}>
            Join 60+ insurers, 500+ hospitals, and 1.2 million members already on InsuraBridge.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 12px 40px rgba(0,137,123,0.55)" }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/network-join")}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white"
              style={{ background: C.grad }}>
              <Building2 className="w-4 h-4" /> Join the Network
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold"
              style={{ background: "rgba(14,26,54,0.8)", border: `1.5px solid ${C.border}`, color: C.accent }}>
              Portal Login <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <motion.footer
        className="relative z-10 border-t"
        style={{ borderColor: "#112044" }}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="mb-4"><InsuraBridgeLogo size={30} textSize="0.85rem" /></div>
              <p className="text-xs leading-relaxed" style={{ color: C.sub }}>
                The unified platform for modern health insurance — connecting TPAs, insurers, hospitals, and members.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#334155" }}>Platform</p>
              {["Claims Management","Network Empanelment","E-Cards & Members","Settlements","Analytics"].map((l) => (
                <button key={l} onClick={() => navigate("/login")} className="block text-xs mb-2 transition-colors hover:text-white" style={{ color: C.sub }}>{l}</button>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#334155" }}>For</p>
              {ROLES.map((r) => (
                <button key={r.slug} onClick={() => navigate(`/login?role=${r.slug}`)} className="block text-xs mb-2 transition-colors hover:text-white" style={{ color: C.sub }}>{r.label}</button>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#334155" }}>Contact</p>
              {[
                { Icon: Mail, text: "hello@insurabridge.in" },
                { Icon: Phone, text: "+91 98765 00000" },
                { Icon: MapPin, text: "Mumbai, Maharashtra" },
                { Icon: Clock, text: "24×7 Critical Support" },
              ].map(({ Icon, text }) => (
                <p key={text} className="flex items-center gap-2 text-xs mb-2.5" style={{ color: C.sub }}>
                  <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "#334155" }} /> {text}
                </p>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: "1px solid #112044" }}>
            <p className="text-xs" style={{ color: "#334155" }}>© 2026 InsuraBridge Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-5">
              {["Privacy Policy","Terms of Service","Cookie Policy"].map((l) => (
                <button key={l} className="text-xs transition-colors hover:text-white" style={{ color: "#334155" }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
