import { motion } from "framer-motion"
import { useAppNavigate } from "@/hooks/use-navigate"
import { Lock, ArrowLeft, ShieldCheck, Server, Eye, Key, AlertTriangle, CheckCircle2 } from "lucide-react"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"
import { ThemeToggle } from "@/components/ThemeToggle"

const pillars = [
  {
    icon: Key,
    title: "Encryption",
    description: "All data at rest is encrypted using AES-256. All data in transit uses TLS 1.3 — the strongest encryption standard available.",
    color: "#38bdf8",
  },
  {
    icon: ShieldCheck,
    title: "Authentication",
    description: "Multi-factor authentication (MFA) is enforced for all portal access. Role-based access controls ensure users only see what they need to.",
    color: "#00C896",
  },
  {
    icon: Server,
    title: "Infrastructure",
    description: "Hosted on SOC 2 Type II certified cloud infrastructure with automatic failover, DDoS protection, and 99.5% uptime SLA.",
    color: "#818cf8",
  },
  {
    icon: Eye,
    title: "Monitoring",
    description: "24/7 automated threat detection, anomaly monitoring, and audit logging. Every data access is recorded for compliance and forensics.",
    color: "#f59e0b",
  },
]

const practices = [
  {
    title: "Penetration Testing",
    content: "We conduct bi-annual third-party penetration tests and quarterly internal security assessments. All critical vulnerabilities are patched within 24 hours of discovery.",
  },
  {
    title: "IRDAI Compliance",
    content: "InsuraBridge adheres to all IRDAI data security guidelines, including the IRDAI (Protection of Policyholders' Interests) Regulations and applicable IT Act provisions.",
  },
  {
    title: "Data Segregation",
    content: "Patient health data, financial information, and operational data are stored in segregated environments with strict access boundaries. No cross-contamination of data is possible.",
  },
  {
    title: "Employee Security",
    content: "All employees undergo background verification and mandatory security training. Access to sensitive data is granted on a need-to-know basis and reviewed quarterly.",
  },
  {
    title: "Incident Response",
    content: "We maintain a documented Incident Response Plan. In the event of a data breach, affected parties are notified within 72 hours per applicable regulations.",
  },
  {
    title: "Backup & Recovery",
    content: "Data is backed up every 4 hours with daily off-site replication. Recovery Point Objective (RPO) is 4 hours. Recovery Time Objective (RTO) is 2 hours.",
  },
  {
    title: "Vendor Security",
    content: "Third-party vendors undergo security assessment before onboarding. All vendors sign Data Processing Agreements and are bound to equivalent security standards.",
  },
  {
    title: "Secure Development",
    content: "We follow OWASP Top 10 guidelines in development. All code undergoes security review before deployment. Dependencies are regularly audited for known vulnerabilities.",
  },
]

const certifications = [
  "IRDAI Compliant",
  "ISO 27001 Aligned",
  "SOC 2 Type II Infrastructure",
  "OWASP Secure Development",
  "IT Act 2000 Compliant",
  "PCI-DSS for Payment Data",
]

export default function Security() {
  const navigate = useAppNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <InsuraBridgeLogo size={28} textSize="0.85rem" animated={false} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-black text-foreground">Security</h1>
          </div>
          <p className="text-muted-foreground mb-4">Enterprise-grade security protecting your health & financial data</p>

          {/* Hero statement */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10">
            <p className="text-foreground leading-relaxed">
              At InsuraBridge, security is not an afterthought — it is built into every layer of our platform. We handle
              sensitive health, financial, and identity data for millions of policyholders, and we take that responsibility
              seriously. Our security program is designed to meet the stringent requirements of India's insurance
              regulatory framework and international best practices.
            </p>
          </div>

          {/* Security pillars */}
          <h2 className="text-xl font-bold text-foreground mb-4">Security Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${pillar.color}20` }}>
                    <pillar.icon className="w-4.5 h-4.5" style={{ color: pillar.color }} />
                  </div>
                  <h3 className="font-bold text-foreground">{pillar.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Security practices */}
          <h2 className="text-xl font-bold text-foreground mb-4">Security Practices</h2>
          <div className="space-y-4 mb-10">
            {practices.map((practice, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 flex gap-4"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{practice.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{practice.content}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Certifications */}
          <h2 className="text-xl font-bold text-foreground mb-4">Compliance & Certifications</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {certifications.map((cert, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-primary/30 bg-primary/5 text-primary"
              >
                {cert}
              </span>
            ))}
          </div>

          {/* Vulnerability reporting */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-foreground">Report a Security Vulnerability</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              If you discover a security vulnerability in our platform, please report it responsibly. We appreciate
              responsible disclosure and will acknowledge your report within 24 hours.
            </p>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Email:</span>{" "}
                <a href="mailto:sayanbhandari007@gmail.com" className="text-primary hover:underline">
                  sayanbhandari007@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Phone:</span> +91 8806822007 / +91 7908815767
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © 2026 InsuraBridge · IRDAI Compliant · All rights reserved
      </footer>
    </div>
  )
}
