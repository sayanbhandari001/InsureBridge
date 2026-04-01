import {
  useState, useEffect, useRef, useCallback,
} from "react"
import {
  motion, AnimatePresence,
  useScroll, useTransform, useSpring,
  useMotionValue, animate, useInView,
} from "framer-motion"
import {
  ArrowRight, Building2, CheckCircle, CheckCircle2, Zap, Globe,
  Lock, Menu, X, BarChart3, RefreshCw, Award, Layers, TrendingUp,
  HeartPulse, BadgeCheck, Star, ChevronDown, Briefcase, ShieldCheck,
  Landmark, LayoutDashboard,
} from "lucide-react"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"
import { useAppNavigate } from "@/hooks/use-navigate"

/* ─── Data ──────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#features",  label: "Features" },
  { href: "#stats",     label: "Impact" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq",       label: "FAQ" },
]

const STATS = [
  { value: 500,  display: "500+",     label: "Network Hospitals",  suffix: "+",  Icon: Building2 },
  { value: 1.2,  display: "1.2M+",   label: "Claims Processed",   suffix: "M+", Icon: CheckCircle },
  { value: 98.4, display: "98.4%",   label: "Settlement Rate",    suffix: "%",  Icon: Zap },
  { value: 60,   display: "60+",      label: "Insurance Partners", suffix: "+",  Icon: Globe },
]

const ROLES = [
  {
    slug: "tpa", Icon: Briefcase,
    title: "Third-Party Administrators",
    tagline: "Streamline operations at scale",
    desc: "Manage claim intake, processing, and settlement across multiple insurers from one dashboard.",
    features: ["Bulk claim ingestion", "Auto-adjudication", "Hospital coordination", "Insurer reconciliation"],
    color: "hsl(var(--primary))",
  },
  {
    slug: "insurer", Icon: ShieldCheck,
    title: "Insurance Companies",
    tagline: "Full portfolio visibility",
    desc: "Monitor claim ratios, manage TPA performance, and enforce underwriting guidelines.",
    features: ["Loss ratio dashboards", "TPA SLA tracking", "Policy analytics", "Regulatory reports"],
    color: "hsl(var(--primary))",
  },
  {
    slug: "hospital", Icon: Building2,
    title: "Hospitals & Clinics",
    tagline: "Faster cashless clearances",
    desc: "Submit pre-auth, upload discharge docs, and receive settlements through one secure portal.",
    features: ["Pre-auth in minutes", "Digital billing", "Real-time settlement", "Network empanelment"],
    color: "hsl(var(--primary))",
  },
  {
    slug: "customer", Icon: Landmark,
    title: "Policy Holders",
    tagline: "Your health, always covered",
    desc: "Track claims, download e-cards, check network hospitals, and reach support instantly.",
    features: ["Claim status tracking", "Digital e-card", "Network finder", "24×7 support chat"],
    color: "hsl(var(--primary))",
  },
]

const FEATURES = [
  { Icon: HeartPulse, title: "Real-Time Claim Tracking",   desc: "End-to-end visibility with live status, auto-escalation, and smart notifications." },
  { Icon: Globe,      title: "Network Empanelment",         desc: "Digital KYC, rate contracts, and live status for cashless hospital onboarding." },
  { Icon: BadgeCheck, title: "Digital E-Cards",             desc: "Instant insurance cards downloadable from any device, any time." },
  { Icon: BarChart3,  title: "Analytics & Reports",         desc: "Real-time dashboards and one-click exports for claims, utilisation, and network." },
  { Icon: RefreshCw,  title: "Renewals & Portability",      desc: "Automated reminders, portability requests, and endorsement processing." },
  { Icon: Zap,        title: "Instant Settlements",         desc: "Automated NEFT/RTGS triggers with full audit trail and real-time reconciliation." },
  { Icon: Lock,       title: "Enterprise Security",         desc: "ISO 27001-aligned infra, E2E encryption, IRDAI-compliant data residency." },
  { Icon: Award,      title: "Smart Documents",             desc: "Centralised vault with version control, e-signature, and one-click sharing." },
  { Icon: LayoutDashboard, title: "Multi-Role Dashboards",  desc: "Tailored views for TPAs, Insurers, Hospitals, and Members — one platform." },
]

const OPS_FEATURES = [
  {
    title: "Unified Claims Console",
    desc: "Every claim across all TPAs and insurers in one view — filterable, searchable, actionable.",
  },
  {
    title: "Member & Policy Hub",
    desc: "Full member lifecycle management from onboarding to renewal, portability, and e-cards.",
  },
  {
    title: "Settlement Automation",
    desc: "NEFT/RTGS triggers, reconciliation, and audit trail — no manual steps, no errors.",
  },
  {
    title: "Smart Communication Centre",
    desc: "Threaded messaging, voice call logs, and document sharing between all stakeholders.",
  },
]

const TESTIMONIALS = [
  { name: "Rajiv Mehta",       title: "COO, MediTPA Solutions",        text: "InsuraBridge cut our claim TAT from 9 days to under 4 hours. The auto-escalation alone saved two full-time headcounts.", rating: 5 },
  { name: "Dr. Anjali Sharma", title: "Medical Director, City General", text: "Pre-auth used to be a phone nightmare. Now it's two minutes. Our cashless clearance rate went from 68% to 94%.", rating: 5 },
  { name: "Priya Nair",        title: "Head of Claims, National Life",  text: "Loss ratio breakdowns by product, geography, and age band — data we used to build manually every month.", rating: 5 },
  { name: "Amit Kulkarni",     title: "Policy Holder",                  text: "Filed Monday, settlement confirmation by Tuesday afternoon. Didn't have to call anyone — everything just happened.", rating: 5 },
]

const FAQS = [
  { q: "How long does onboarding take?",          a: "Most organisations go live within 7–14 business days. Our team handles migration, config, and training." },
  { q: "Is InsuraBridge IRDAI compliant?",        a: "Yes — built to meet IRDAI guidelines on data localisation, audit trails, and policyholder data protection." },
  { q: "Can we integrate with our existing HMS?", a: "Yes. We have REST APIs, HL7/FHIR connectors, and pre-built integrations with Athena, MocDoc, and Practo." },
  { q: "What support SLA do you offer?",          a: "All plans include 24×7 critical-issue support with a 2-hour response SLA. Standard queries resolved in one business day." },
  { q: "How is pricing structured?",              a: "Flexible per-member-per-month for insurers; fixed monthly plans for hospitals. Contact us for a custom quote." },
]

const PARTNERS = [
  "Star Health", "HDFC ERGO", "Niva Bupa", "New India Assurance", "ICICI Lombard",
  "Bajaj Allianz", "Aditya Birla Health", "Care Health", "ManipalCigna",
  "SBI Health", "Reliance Health", "Royal Sundaram",
]

const HERO_WORDS = ["Health Claims", "TPA Operations", "Network Empanelment", "Member Care", "Insurance"]

/* ─── Helpers ───────────────────────────────────────────────── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

/* ─── AnimatedStat ──────────────────────────────────────────── */
function AnimatedStat({ stat }: { stat: typeof STATS[0] }) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(0)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const displayValue = useTransform(mv, (v) => {
    if (stat.suffix === "%")  return v.toFixed(1)
    if (stat.suffix === "M+") return v.toFixed(1)
    return Math.round(v).toString()
  })
  useEffect(() => {
    if (!inView) return
    const ctrl = animate(mv, stat.value, { duration: 2, ease: "easeOut" })
    return ctrl.stop
  }, [inView, mv, stat.value])

  return (
    <motion.span ref={ref} className="text-3xl md:text-4xl font-display font-black text-foreground">
      <motion.span>{displayValue}</motion.span>
      <span>{stat.suffix}</span>
    </motion.span>
  )
}

/* ─── NetworkCard ───────────────────────────────────────────── */
function NetworkCard({
  Icon, title, desc, delay = 0, onClick, stat, statLabel, features,
}: {
  Icon: React.ElementType; title: string; desc: string; delay?: number;
  onClick?: () => void; stat?: string; statLabel?: string; features?: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.55, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative bg-card p-7 rounded-2xl border border-border shadow-sm
        hover:shadow-lg hover:shadow-primary/8 transition-shadow duration-300
        flex flex-col gap-4 overflow-hidden${onClick ? " cursor-pointer" : ""}`}
      role={onClick ? "button" : "article"}
    >
      {/* hover glow */}
      <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)" }} />

      {/* icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary
        group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <h3 className="font-display font-bold text-base text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        {features && (
          <ul className="mt-3 space-y-1.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {stat && (
        <div className="pt-3 border-t border-border">
          <span className="text-2xl font-display font-black text-foreground">{stat}</span>
          <span className="text-xs text-muted-foreground ml-1">{statLabel}</span>
        </div>
      )}

      {/* animated underline + arrow on hover */}
      <div className="flex items-center justify-between mt-1">
        <div className="h-0.5 w-0 bg-primary group-hover:w-3/4 transition-all duration-500 ease-out rounded-full" />
        {onClick && (
          <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Access Portal <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Typewriter ────────────────────────────────────────────── */
function Typewriter() {
  const [wordIdx, setWordIdx] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = HERO_WORDS[wordIdx]
    let t: ReturnType<typeof setTimeout>
    if (!deleting && displayed.length < word.length)
      t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 65)
    else if (!deleting && displayed.length === word.length)
      t = setTimeout(() => setDeleting(true), 1800)
    else if (deleting && displayed.length > 0)
      t = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 38)
    else { setDeleting(false); setWordIdx((i) => (i + 1) % HERO_WORDS.length) }
    return () => clearTimeout(t)
  }, [displayed, deleting, wordIdx])

  return (
    <span className="text-primary">
      {displayed}
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }} className="text-primary">|</motion.span>
    </span>
  )
}

/* ─── Scroll progress bar ───────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <motion.div className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-primary" style={{ scaleX }} />
  )
}

/* ─── Marquee ───────────────────────────────────────────────── */
function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden" style={{ maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)" }}>
      <motion.div
        className="flex gap-14 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((p, i) => (
          <span key={i} className="text-sm font-semibold text-muted-foreground/50 flex-shrink-0">{p}</span>
        ))}
      </motion.div>
    </div>
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
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-8"
        >
          <div className="flex gap-1 mb-4">
            {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>
          <p className="text-sm md:text-base italic leading-relaxed mb-6 text-muted-foreground">"{t.text}"</p>
          <div>
            <p className="text-sm font-bold text-foreground">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.title}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-2 justify-center mt-4">
        {TESTIMONIALS.map((_, i) => (
          <motion.button
            key={i} onClick={() => setIdx(i)}
            animate={{ width: i === idx ? 24 : 8, opacity: i === idx ? 1 : 0.35 }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Navbar ────────────────────────────────────────────────── */
function NavBar({
  navigate,
  visible,
}: {
  navigate: (to: string) => void
  visible: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className="sticky top-0 z-50 w-full"
      animate={{ y: visible ? "0%" : "-100%" }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
    >
    <header className="w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-semibold z-50">
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
          >
            <InsuraBridgeLogo size={32} textSize="0.95rem" animated={false} />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <button
                key={label}
                onClick={() => scrollTo(href.slice(1))}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/network-join")}
              className="px-4 py-2 rounded-full font-semibold text-sm border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              Join Network
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, opacity: 0.9 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full font-semibold text-sm text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #00BFA5 100%)" }}
            >
              Portal Login <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {open
                ? <motion.span key="x"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} className="block"><X className="w-5 h-5" /></motion.span>
                : <motion.span key="ham" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }} className="block"><Menu className="w-5 h-5" /></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-72 bg-card border-l border-border shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <span className="font-display font-black text-lg text-foreground">InsuraBridge</span>
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col p-4 gap-1 flex-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <button key={label} onClick={() => { scrollTo(href.slice(1)); setOpen(false) }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-muted transition-colors text-left">
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-border space-y-2">
                <button onClick={() => { navigate("/network-join"); setOpen(false) }}
                  className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors">
                  Join Network
                </button>
                <button onClick={() => { navigate("/login"); setOpen(false) }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #00BFA5)" }}>
                  Portal Login <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
    </motion.div>
  )
}

/* ─── DashboardMockup ───────────────────────────────────────── */
function DashboardMockup() {
  const stats = [
    { label: "Open Claims", value: "1,284", delta: "+12", color: "#60a5fa" },
    { label: "Settled Today", value: "₹2.4Cr", delta: "+8%", color: "#34d399" },
    { label: "Pre-auth Queue", value: "47", delta: "-3", color: "#fbbf24" },
    { label: "SLA Breaches", value: "2", delta: "-5", color: "#f87171" },
  ]
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl bg-primary pointer-events-none" />
      <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 mx-4 bg-background/60 border border-border rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
            app.insurabridge.in/dashboard
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-5 bg-background/40">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Good morning,</p>
              <p className="text-sm font-bold text-foreground">TPA Operations Centre</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-lg font-black font-display text-foreground">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: s.delta.startsWith("+") ? "#34d399" : "#f87171" }}>{s.delta}</p>
              </div>
            ))}
          </div>

          {/* Mini claim rows */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Claims</p>
            </div>
            {[
              { id: "CLM-2841", hospital: "Apollo Delhi",   amount: "₹84,000", status: "Approved",    color: "#34d399" },
              { id: "CLM-2840", hospital: "Fortis Gurgaon", amount: "₹1.2L",   status: "Under Review", color: "#fbbf24" },
              { id: "CLM-2839", hospital: "Max Saket",      amount: "₹36,000", status: "Pending",     color: "#60a5fa" },
            ].map((row) => (
              <div key={row.id} className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <div>
                  <p className="text-xs font-mono font-semibold text-foreground">{row.id}</p>
                  <p className="text-xs text-muted-foreground">{row.hospital}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-foreground">{row.amount}</p>
                  <p className="text-xs" style={{ color: row.color }}>{row.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useAppNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollY = useRef(0)

  const heroRef = useRef<HTMLDivElement>(null)

  /* Auto-hide navbar on scroll down, show on scroll up */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY < 80) {
        setNavVisible(true)
      } else if (currentY > lastScrollY.current + 8) {
        setNavVisible(false)
      } else if (currentY < lastScrollY.current - 8) {
        setNavVisible(true)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /* Scroll-based hero logo morph (logo only — text stays fixed) */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const smoothP = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 1e-4 })

  const logoScale   = useTransform(smoothP, [0, 0.6], [1, 0.28])
  const logoY       = useTransform(smoothP, [0, 0.6], [0, -240])
  const logoOpacity = useTransform(smoothP, [0, 0.35, 0.62], [1, 1, 0])

  return (
    <div id="main" className="min-h-screen relative w-full bg-background bg-grid-pattern">
      {/* Hero radial glow overlay */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" aria-hidden />

      <ScrollProgress />
      <NavBar navigate={navigate} visible={navVisible} />

      {/* ══ FLOATING CTA PANEL (appears when header hides) ═════════ */}
      <AnimatePresence>
        {!navVisible && (
          <motion.div
            className="fixed left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3"
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <motion.button
              onClick={() => navigate("/network-join")}
              whileHover={{ x: 6, scale: 1.06, boxShadow: "0 8px 32px hsl(var(--primary) / 0.5)" }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-xl"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #00BFA5)" }}
            >
              <Building2 className="w-4 h-4" /> Join Network
            </motion.button>
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ x: 6, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border border-border/80 bg-card/90 backdrop-blur-sm text-foreground shadow-xl"
            >
              Portal Login <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HERO ═══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24"
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-20 min-h-[88vh]">

          {/* LEFT — only the logo morphs on scroll */}
          <div className="flex-none lg:w-72 flex justify-center lg:justify-start pt-8 lg:pt-16">
            <motion.div
              style={{ scale: logoScale, y: logoY, opacity: logoOpacity }}
              className="will-change-transform"
            >
              <InsuraBridgeLogo size={72} textSize="1.75rem" animated={true} />
            </motion.div>
          </div>

          {/* RIGHT — all text content, completely static (never moves or resizes) */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left justify-center lg:pt-16 gap-6">
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-primary/20 bg-primary/5 text-primary"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Unified Insurance Platform — Trusted by 60+ Insurers
            </motion.div>

            {/* Hero headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-foreground leading-tight"
            >
              The Intelligent Hub for{" "}
              <br className="hidden sm:block" />
              <Typewriter />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              InsuraBridge unifies TPAs, Insurers, Hospitals, and Members — automating claims, empanelments, settlements, and member experiences end-to-end.
            </motion.p>

            {/* scroll hint */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="text-xs text-muted-foreground/50 flex items-center gap-1 mt-2"
            >
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" /> Scroll to explore
            </motion.p>
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════════ */}
      <section id="stats" className="relative z-10 border-y border-border bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center gap-2"
              >
                <s.Icon className="w-5 h-5 text-primary opacity-60" aria-hidden />
                <AnimatedStat stat={s} />
                <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARTNER MARQUEE ════════════════════════════════════════ */}
      <section className="relative z-10 py-10 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <p className="text-center text-xs text-muted-foreground/50 font-semibold uppercase tracking-widest">Trusted by India's leading insurers</p>
        </div>
        <Marquee items={PARTNERS} />
      </section>

      {/* ══ ECOSYSTEM ══════════════════════════════════════════════ */}
      <section id="ecosystem" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 border border-primary/20 bg-primary/5 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> One Platform
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-black text-foreground mb-4"
          >
            One Unified Ecosystem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Every stakeholder in the health insurance lifecycle, connected on a single secure platform. Click any card to access the portal for that role.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((r, i) => (
            <NetworkCard
              key={r.slug}
              Icon={r.Icon}
              title={r.title}
              desc={r.desc}
              features={r.features}
              delay={i * 0.1}
              onClick={() => navigate("/login")}
            />
          ))}
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 bg-muted/40 border-y border-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl font-display font-black text-foreground mb-4"
            >
              Platform Capabilities
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              InsuraBridge is engineered for the demands of large-scale health insurance operations.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <NetworkCard key={f.title} Icon={f.Icon} title={f.title} desc={f.desc} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ OPERATIONS CENTRE ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 overflow-hidden">
        {/* subtle BG */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-hero-glow" aria-hidden />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 border border-primary/20 bg-primary/5 text-primary"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> Enterprise-Grade
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
                className="text-3xl md:text-4xl font-display font-black text-foreground mb-5 leading-tight"
              >
                Operations Centre
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="text-muted-foreground text-lg mb-8 leading-relaxed"
              >
                InsuraBridge delivers a comprehensive claims, member, and settlement management system — unified under one platform. No context switching, no silos.
              </motion.p>

              <div className="space-y-4 mb-10">
                {OPS_FEATURES.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center bg-primary/15 text-primary">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{f.title}</p>
                      <p className="text-muted-foreground text-sm">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.button
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white shadow-md hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #00BFA5)" }}
                >
                  <LayoutDashboard className="w-4 h-4" /> Access Dashboard
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.38 }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/network-join")}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border border-border bg-card text-foreground hover:bg-muted transition-colors"
                >
                  Join the Network
                </motion.button>
              </div>
            </div>

            {/* Right dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═══════════════════════════════════════════ */}
      <section id="testimonials" className="relative z-10 bg-muted/40 border-y border-border py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl font-display font-black text-foreground mb-4"
            >
              Trusted by Professionals
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Real outcomes from real teams across India's healthcare insurance ecosystem.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <TestimonialCarousel />
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-black text-foreground mb-4"
          >
            Getting Started
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Go live in days, not months.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", Icon: Layers, title: "Connect Stakeholders", desc: "Onboard TPAs, insurers, hospitals, and members in days — not months." },
            { step: "02", Icon: RefreshCw, title: "Configure Workflows", desc: "Set approval flows, escalation rules, and notification preferences — no code needed." },
            { step: "03", Icon: TrendingUp, title: "Go Live & Track", desc: "Process claims, issue e-cards, and monitor every KPI in real time." },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
              className="bg-card rounded-2xl p-7 border border-border shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                <s.Icon className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-primary/60 mb-2 font-mono">{s.step}</div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════════ */}
      <section id="faq" className="relative z-10 bg-muted/40 border-t border-border py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl font-display font-black text-foreground mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <InsuraBridgeLogo size={28} textSize="0.85rem" animated={false} />
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "Security", "Contact"].map((l) => (
                <button key={l} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">© 2026 InsuraBridge · IRDAI Compliant · All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
