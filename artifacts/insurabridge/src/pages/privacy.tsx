import { motion } from "framer-motion"
import { useAppNavigate } from "@/hooks/use-navigate"
import { Shield, ArrowLeft } from "lucide-react"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"
import { ThemeToggle } from "@/components/ThemeToggle"

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, including:
    
• Identity Information: Name, date of birth, gender, and government-issued ID details
• Contact Information: Email address, phone number, and mailing address
• Health Information: Policy numbers, claim history, medical documents (as required for claim processing)
• Financial Information: Bank account details for settlement processing (encrypted and stored securely)
• Technical Data: IP addresses, browser type, device information, and usage logs for security and analytics

We also collect information automatically through cookies and similar tracking technologies when you use our platform.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `InsuraBridge uses your information to:

• Process and manage insurance claims, settlements, and empanelments
• Verify your identity and prevent fraudulent activity
• Communicate important updates about your policy, claims, or account
• Generate and issue e-cards and policy documents
• Improve our platform services, features, and user experience
• Comply with legal and regulatory obligations under IRDAI guidelines
• Send service notifications, alerts, and support communications`,
  },
  {
    title: "3. Information Sharing",
    content: `We share your information only in the following circumstances:

• With Insurers and TPAs: Required for claims processing and policy management
• With Empanelled Hospitals: For cashless treatment authorization and billing
• With Regulatory Authorities: IRDAI and other government bodies as required by law
• With Service Providers: Trusted vendors who assist in platform operations (under strict data processing agreements)
• During Business Transfers: In case of merger, acquisition, or asset sale, with prior notice to you

We do not sell, rent, or trade your personal information to third parties for marketing purposes.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures to protect your data:

• 256-bit AES encryption for data at rest
• TLS 1.3 for all data in transit
• Multi-factor authentication for portal access
• Regular security audits and penetration testing
• IRDAI-compliant data retention and destruction policies
• Role-based access controls limiting who can view sensitive information

Despite our best efforts, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your login credentials confidential.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal information for as long as necessary to provide services and comply with legal obligations:

• Active account data is retained for the duration of your policy plus 7 years (as required by IRDAI)
• Claim records are retained for 10 years from the date of settlement
• Communication logs are retained for 3 years
• You may request deletion of certain data subject to legal and regulatory requirements`,
  },
  {
    title: "6. Your Rights",
    content: `Under applicable data protection laws, you have the following rights:

• Access: Request a copy of the personal information we hold about you
• Correction: Request correction of inaccurate or incomplete data
• Deletion: Request deletion of your data (subject to legal retention requirements)
• Portability: Request your data in a structured, machine-readable format
• Objection: Object to certain types of data processing
• Withdrawal: Withdraw consent where processing is based on consent

To exercise any of these rights, contact us at sayanbhandari007@gmail.com`,
  },
  {
    title: "7. Cookies Policy",
    content: `We use cookies and similar technologies to:

• Maintain your session and authentication state
• Remember your preferences and settings
• Analyze platform usage and performance
• Enhance security and detect fraudulent activity

You can control cookies through your browser settings. Disabling certain cookies may affect platform functionality.`,
  },
  {
    title: "8. Contact Us",
    content: `If you have questions about this Privacy Policy or how we handle your data:

Email: sayanbhandari007@gmail.com
Phone: +91 8806822007 / +91 7908815767

InsuraBridge — IRDAI Compliant Insurance Technology Platform
Last updated: April 2026`,
  },
]

export default function Privacy() {
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
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-black text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground mb-10">Effective Date: April 1, 2026 · IRDAI Compliant</p>

          <p className="text-muted-foreground leading-relaxed mb-10">
            InsuraBridge ("we," "our," or "us") is committed to protecting the privacy and security of your personal
            information. This Privacy Policy explains how we collect, use, share, and safeguard your data when you use
            the InsuraBridge platform. By using our services, you agree to the practices described in this policy.
          </p>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h2 className="text-base font-bold text-foreground mb-3">{section.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © 2026 InsuraBridge · IRDAI Compliant · All rights reserved
      </footer>
    </div>
  )
}
