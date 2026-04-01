import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppNavigate } from "@/hooks/use-navigate"
import {
  ArrowLeft, Building2, CheckCircle2, Send, MapPin,
  Phone, Mail, User, ChevronDown, AlertCircle, Search,
} from "lucide-react"
import { AuroraBackground } from "@/components/AuroraBackground"
import { ParticleNetwork } from "@/components/ParticleNetwork"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"
import { ThemeToggle } from "@/components/ThemeToggle"

/* ─── static data ───────────────────────────────────────────── */
const FACILITY_TYPES = [
  { value: "Government Hospital",    icon: "🏥", desc: "Publicly funded hospital or medical centre" },
  { value: "Private Hospital",       icon: "🏨", desc: "Privately owned multi-speciality hospital" },
  { value: "Nursing Home",           icon: "🛏️",  desc: "Small in-patient nursing facility" },
  { value: "Clinic / Polyclinic",    icon: "🩺", desc: "Outpatient consultation centre" },
  { value: "Diagnostic Centre",      icon: "🔬", desc: "Pathology, radiology & diagnostics" },
  { value: "Day Care Centre",        icon: "💊", desc: "Procedures not requiring overnight stay" },
  { value: "Maternity Hospital",     icon: "👶", desc: "Specialised maternity and neonatal care" },
  { value: "Eye Hospital",           icon: "👁️", desc: "Ophthalmology and vision care" },
  { value: "Dental Clinic",          icon: "🦷", desc: "Dental and oral health care" },
  { value: "Cardiac Centre",         icon: "❤️",  desc: "Cardiology and heart care speciality" },
  { value: "Cancer Centre",          icon: "🎗️", desc: "Oncology and cancer treatment facility" },
  { value: "Rehabilitation Centre",  icon: "♿", desc: "Physical, occupational and speech therapy" },
]

const CITIES = [
  "Agra","Ahmedabad","Amritsar","Aurangabad","Bangalore","Bhopal","Bhubaneswar",
  "Chandigarh","Chennai","Coimbatore","Dehradun","Delhi","Faridabad","Guwahati",
  "Gwalior","Hubli","Hyderabad","Indore","Jaipur","Jalandhar","Jodhpur",
  "Kanpur","Kochi","Kolkata","Lucknow","Ludhiana","Madurai","Mangalore",
  "Meerut","Mumbai","Mysore","Nagpur","Nashik","Patna","Pune","Raipur",
  "Rajkot","Ranchi","Salem","Surat","Thiruvananthapuram","Tiruchirappalli",
  "Vadodara","Varanasi","Visakhapatnam",
]

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir",
  "Jharkhand","Karnataka","Kerala","Ladakh","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal",
]

const HOSPITAL_NAMES = [
  "Apollo Hospital","Fortis Hospital","Max Hospital","Narayana Health",
  "Manipal Hospital","Medanta Hospital","AIIMS","Lilavati Hospital",
  "Kokilaben Hospital","Jaslok Hospital","Hinduja Hospital",
  "Wockhardt Hospital","Ruby Hall Clinic","Jupiter Hospital",
  "Sahyadri Hospital","Global Hospital","Tata Memorial Hospital",
  "Breach Candy Hospital","SL Raheja Hospital","Aster Hospital",
  "Columbia Asia Hospital","Cloudnine Hospital","Rainbow Children's",
  "Care Hospitals","KIMS Hospital","Yashoda Hospital","Continental Hospital",
]

const EMAIL_DOMAINS = [
  "gmail.com","yahoo.com","outlook.com","hotmail.com","hospital.com",
  "clinic.in","healthcare.in","medicenter.in","nhc.in","meditrust.in",
]

/* ─── theme (CSS-variable-based, works dark + light) ───────── */
const T = {
  get bg()       { return "hsl(var(--background))" },
  get card()     { return "hsl(var(--card) / 0.92)" },
  get input()    { return "hsl(var(--card))" },
  get border()   { return "hsl(var(--border))" },
  get text()     { return "hsl(var(--foreground))" },
  get label()    { return "hsl(var(--muted-foreground))" },
  active:   "#00897B",
  error:    "#dc2626",
  errorBg:  "rgba(220,38,38,0.10)",
  errorBdr: "rgba(220,38,38,0.28)",
}

/* ─── helpers ───────────────────────────────────────────────── */
function validate(form: Record<string, string>) {
  const e: Record<string, string> = {}
  if (!form.facilityName.trim())
    e.facilityName = "Facility name is required"
  else if (form.facilityName.trim().length < 3)
    e.facilityName = "Name must be at least 3 characters"
  if (!form.type)
    e.type = "Please select a facility type"
  if (!form.contactPerson.trim())
    e.contactPerson = "Contact person name is required"
  if (!form.email.trim())
    e.email = "Email address is required"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = "Enter a valid email address (e.g. admin@hospital.com)"
  if (!form.phone.trim())
    e.phone = "Phone number is required"
  else if (form.phone.replace(/\D/g, "").length < 10)
    e.phone = "Enter a valid 10-digit phone number"
  if (!form.city.trim())
    e.city = "City is required"
  if (!form.state.trim())
    e.state = "State is required"
  return e
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 10)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

/* ─── FieldError ─────────────────────────────────────────────── */
function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-1.5 px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-medium overflow-hidden"
          style={{ background: T.errorBg, border: `1px solid ${T.errorBdr}`, color: "#f87171" }}
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── AutoSuggest input ──────────────────────────────────────── */
function AutoSuggest({
  value, onChange, suggestions, icon, placeholder,
  required, type = "text", error, label, highlight,
}: {
  value: string; onChange: (v: string) => void; suggestions: string[]
  icon?: React.ReactNode; placeholder?: string; required?: boolean
  type?: string; error?: string; label?: string; highlight?: (s: string, q: string) => React.ReactNode
}) {
  const [open, setOpen]   = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = value.length >= 1
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()).slice(0, 7)
    : []

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function highlightMatch(s: string, q: string) {
    if (!q) return s
    const idx = s.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return s
    return (
      <>
        {s.slice(0, idx)}
        <span style={{ color: T.active, fontWeight: 700 }}>{s.slice(idx, idx + q.length)}</span>
        {s.slice(idx + q.length)}
      </>
    )
  }

  const borderColor = error ? T.error : focused ? T.active : T.border

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>}
        <input
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); setOpen(true) }}
          onBlur={() => setFocused(false)}
          className="w-full py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: T.input,
            border: `1.5px solid ${borderColor}`,
            color: T.text,
            paddingLeft: icon ? "2.25rem" : "0.75rem",
            paddingRight: "0.75rem",
          }}
        />
      </div>
      <FieldError msg={error} />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            key="sg"
            initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.92 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden"
            style={{
              background: "hsl(var(--card))",
              border: `1.5px solid ${T.border}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              transformOrigin: "top",
            }}
          >
            {filtered.map((s, i) => (
              <motion.button
                key={s}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}
                onMouseDown={() => { onChange(s); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
                style={{
                  color: T.text,
                  borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}40` : "none",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {highlight ? highlight(s, value) : highlightMatch(s, value)}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── EmailField with domain completion ─────────────────────── */
function EmailField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen]     = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const atIdx  = value.indexOf("@")
  const local  = atIdx === -1 ? value : value.slice(0, atIdx)
  const domain = atIdx === -1 ? "" : value.slice(atIdx + 1)

  const suggestions = atIdx !== -1
    ? EMAIL_DOMAINS
        .filter(d => d.toLowerCase().startsWith(domain.toLowerCase()) && d.toLowerCase() !== domain.toLowerCase())
        .map(d => `${local}@${d}`)
    : []

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const borderColor = error ? T.error : focused ? T.active : T.border

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
        <input
          type="email"
          value={value}
          required
          placeholder="admin@hospital.com"
          autoComplete="off"
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); setOpen(true) }}
          onBlur={() => setFocused(false)}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: T.input, border: `1.5px solid ${borderColor}`, color: T.text }}
        />
      </div>
      <FieldError msg={error} />
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            key="email-sg"
            initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.92 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden"
            style={{ background: "hsl(var(--card))", border: `1.5px solid ${T.border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.6)", transformOrigin: "top" }}
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={s}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                onMouseDown={() => { onChange(s); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
                style={{ color: T.text, borderBottom: i < suggestions.length - 1 ? `1px solid ${T.border}40` : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Mail className="w-3 h-3 flex-shrink-0" style={{ color: T.active }} />
                <span>{local}</span>
                <span style={{ color: T.active }}>@{suggestions[i].split("@")[1]}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── FancySelect (searchable animated dropdown) ──────────────── */
function FancySelect({
  value, onChange, options, placeholder, error,
}: {
  value: string; onChange: (v: string) => void
  options: { value: string; icon: string; desc: string }[]
  placeholder?: string; error?: string
}) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const filtered = options.filter(o => o.value.toLowerCase().includes(search.toLowerCase()))
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const borderColor = error ? T.error : open ? T.active : T.border

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch("") }}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-left flex items-center justify-between outline-none transition-all"
        style={{ background: T.input, border: `1.5px solid ${borderColor}`, color: value ? T.text : T.label }}
      >
        <span className="flex items-center gap-2">
          {selected
            ? <><span className="text-base">{selected.icon}</span><span>{selected.value}</span></>
            : <span>{placeholder ?? "Select an option"}</span>}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <FieldError msg={error} />

      <AnimatePresence>
        {open && (
          <motion.div
            key="fsel"
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden"
            style={{
              background: "hsl(var(--card))",
              border: `1.5px solid ${T.border}`,
              boxShadow: "0 12px 48px rgba(0,0,0,0.65)",
              transformOrigin: "top",
            }}
          >
            {/* Search bar */}
            <div className="p-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search facility type…"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: T.input, border: `1px solid ${T.border}`, color: T.text }}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs py-5 text-center text-muted-foreground">No matching types</p>
              ) : filtered.map((opt, i) => {
                const isSelected = value === opt.value
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.025 } }}
                    onMouseDown={() => { onChange(opt.value); setOpen(false) }}
                    className="w-full px-4 py-2.5 text-left flex items-start gap-3 transition-colors"
                    style={{
                      borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}30` : "none",
                      background: isSelected ? "rgba(0,137,123,0.1)" : "transparent",
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "hsl(var(--muted))" }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSelected ? "rgba(0,137,123,0.1)" : "transparent" }}
                  >
                    <span className="text-base mt-0.5 leading-none">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: isSelected ? "#34d399" : T.text }}>{opt.value}</p>
                      <p className="text-xs mt-0.5 leading-snug text-muted-foreground">{opt.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function NetworkJoin() {
  const navigate = useAppNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [shaking, setShaking]     = useState(false)
  const [form, setForm] = useState({
    facilityName: "", type: "", contactPerson: "",
    email: "", phone: "", city: "", state: "", message: "",
  })

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  function handlePhone(raw: string) {
    const formatted = formatPhone(raw)
    handleChange("phone", formatted)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: T.bg, fontFamily: "'Inter', sans-serif", color: "#f1f5f9" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <AuroraBackground /><ParticleNetwork />
      </div>

      {/* Navbar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ borderBottom: "1px solid rgba(28,51,96,0.6)", backdropFilter: "blur(12px)" }}
      >
        <InsuraBridgeLogo size={34} textSize="0.95rem" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)", boxShadow: "0 4px 20px rgba(0,137,123,0.35)" }}>
            Portal Login
          </motion.button>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          className="w-full max-w-xl"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="rounded-2xl p-10 text-center shadow-2xl"
                style={{ background: T.card, border: `1.5px solid ${T.border}` }}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.15 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(0,137,123,0.2)", border: "2px solid #00897B" }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#34d399" }} />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">Application Received!</h2>
                <p className="text-sm mb-8 text-muted-foreground">
                  Our empanelment team will review your application and reach out within 2–3 business days.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/login")}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)" }}>
                    Go to Portal Login
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/")}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    Back to Home
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.div
                key="form"
                animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.45 }}
                className="rounded-2xl p-8 shadow-2xl"
                style={{ background: T.card, border: `1.5px solid ${T.border}` }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,137,123,0.2)", border: "1px solid #00897B44" }}
                  >
                    <Building2 className="w-5 h-5" style={{ color: "#34d399" }} />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>Join the Network</h1>
                    <p className="text-xs text-muted-foreground">Apply to become a cashless empanelled facility</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                  {/* Facility Name */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: T.label }}>
                      Facility / Hospital Name <span style={{ color: T.error }}>*</span>
                    </label>
                    <AutoSuggest
                      value={form.facilityName}
                      onChange={v => handleChange("facilityName", v)}
                      suggestions={HOSPITAL_NAMES}
                      icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
                      placeholder="e.g. Apollo Hospital, City General…"
                      required
                      error={errors.facilityName}
                    />
                  </div>

                  {/* Facility Type */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: T.label }}>
                      Facility Type <span style={{ color: T.error }}>*</span>
                    </label>
                    <FancySelect
                      value={form.type}
                      onChange={v => handleChange("type", v)}
                      options={FACILITY_TYPES}
                      placeholder="Search & select facility type…"
                      error={errors.type}
                    />
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: T.label }}>
                      Contact Person <span style={{ color: T.error }}>*</span>
                    </label>
                    <AutoSuggest
                      value={form.contactPerson}
                      onChange={v => handleChange("contactPerson", v)}
                      suggestions={["Dr. ", "Mr. ", "Ms. ", "Prof. ", "Dr. Anjali Sharma", "Dr. Rajiv Mehta", "Dr. Priya Nair"]}
                      icon={<User className="w-4 h-4 text-muted-foreground" />}
                      placeholder="Dr. Anjali Sharma"
                      required
                      error={errors.contactPerson}
                    />
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.label }}>
                        Email <span style={{ color: T.error }}>*</span>
                      </label>
                      <EmailField
                        value={form.email}
                        onChange={v => handleChange("email", v)}
                        error={errors.email}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.label }}>
                        Phone <span style={{ color: T.error }}>*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                        <input
                          type="tel"
                          value={form.phone}
                          required
                          placeholder="98765 43210"
                          autoComplete="off"
                          onChange={e => handlePhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                          style={{
                            background: T.input,
                            border: `1.5px solid ${errors.phone ? T.error : T.border}`,
                            color: T.text,
                          }}
                          onFocus={e => { if (!errors.phone) e.target.style.borderColor = T.active }}
                          onBlur={e => { e.target.style.borderColor = errors.phone ? T.error : T.border }}
                        />
                      </div>
                      <FieldError msg={errors.phone} />
                    </div>
                  </div>

                  {/* City + State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.label }}>
                        City <span style={{ color: T.error }}>*</span>
                      </label>
                      <AutoSuggest
                        value={form.city}
                        onChange={v => handleChange("city", v)}
                        suggestions={CITIES}
                        icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
                        placeholder="Mumbai"
                        required
                        error={errors.city}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.label }}>
                        State <span style={{ color: T.error }}>*</span>
                      </label>
                      <AutoSuggest
                        value={form.state}
                        onChange={v => handleChange("state", v)}
                        suggestions={STATES}
                        placeholder="Maharashtra"
                        required
                        error={errors.state}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: T.label }}>Additional Information</label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={e => handleChange("message", e.target.value)}
                      placeholder="Bed capacity, specialities, accreditations, NABH/JCI status, etc."
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                      style={{ background: T.input, border: `1.5px solid ${T.border}`, color: T.text }}
                      onFocus={e => (e.target.style.borderColor = T.active)}
                      onBlur={e => (e.target.style.borderColor = T.border)}
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.015, boxShadow: "0 12px 40px rgba(0,137,123,0.55)" }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 mt-2"
                    style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #00897B 100%)", opacity: loading ? 0.75 : 1 }}
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
                      <><Send className="w-4 h-4" /> Submit Application</>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="relative z-10 py-5" style={{ borderTop: "1px solid #112044" }}>
        <p className="text-center text-xs text-muted-foreground">© 2026 InsuraBridge · All rights reserved</p>
      </footer>
    </div>
  )
}
