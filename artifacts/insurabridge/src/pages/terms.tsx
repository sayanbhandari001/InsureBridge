import { motion } from "framer-motion"
import { useAppNavigate } from "@/hooks/use-navigate"
import { FileText, ArrowLeft } from "lucide-react"
import { InsuraBridgeLogo } from "@/components/InsuraBridgeLogo"
import { ThemeToggle } from "@/components/ThemeToggle"

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using the InsuraBridge platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must immediately stop using the Platform.

These Terms apply to all users including TPAs, Insurers, Hospitals, Members, and Administrators. Additional role-specific terms may apply based on your agreement with InsuraBridge.`,
  },
  {
    title: "2. Platform Description",
    content: `InsuraBridge is a unified health insurance management platform that provides:

• Claims processing and tracking for TPAs and Insurers
• Network empanelment for hospitals and healthcare facilities
• Policy and member management tools
• Settlement and billing automation
• E-card generation and portability management
• Real-time communication between all stakeholders

The Platform is designed to comply with IRDAI (Insurance Regulatory and Development Authority of India) guidelines and applicable Indian laws.`,
  },
  {
    title: "3. User Accounts & Access",
    content: `To use certain features, you must create an account. You agree to:

• Provide accurate, complete, and up-to-date information
• Maintain the confidentiality of your login credentials
• Immediately notify us of any unauthorized access to your account
• Take responsibility for all activities under your account
• Not share your credentials with unauthorized persons

InsuraBridge reserves the right to suspend or terminate accounts that violate these Terms or applicable laws.`,
  },
  {
    title: "4. Permitted Use",
    content: `You may use the Platform only for lawful purposes and in accordance with these Terms. You must not:

• Use the Platform for fraudulent insurance claims or misrepresentation
• Attempt to gain unauthorized access to other users' accounts or data
• Upload malicious code, viruses, or harmful content
• Reverse engineer, decompile, or disassemble Platform software
• Use automated scripts or bots without prior written authorization
• Violate any IRDAI regulations or applicable insurance laws

Violation of these restrictions may result in immediate termination and legal action.`,
  },
  {
    title: "5. Intellectual Property",
    content: `All content, features, and functionality of the Platform — including text, graphics, logos, icons, software, and data — are owned by InsuraBridge and are protected by applicable intellectual property laws.

You are granted a limited, non-exclusive, non-transferable license to use the Platform for its intended purposes. This license does not permit you to copy, modify, distribute, or create derivative works without our explicit written consent.`,
  },
  {
    title: "6. Data Accuracy & Responsibility",
    content: `Users are responsible for the accuracy of data submitted to the Platform. InsuraBridge:

• Does not verify the authenticity of medical documents or prescriptions (verification is performed by the relevant insurer or TPA)
• Is not liable for claim decisions made by insurers or TPAs
• Is not responsible for delays caused by incomplete or inaccurate information submitted by users
• Reserves the right to flag or remove content that appears fraudulent or violates these Terms`,
  },
  {
    title: "7. Service Availability",
    content: `InsuraBridge strives for 99.5% uptime but does not guarantee uninterrupted service availability. We may:

• Perform scheduled maintenance (with advance notice where possible)
• Experience unexpected outages due to technical or infrastructure issues
• Suspend access temporarily for security or compliance reasons

InsuraBridge is not liable for losses arising from service interruptions, provided we take reasonable steps to restore services promptly.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `To the maximum extent permitted by law, InsuraBridge shall not be liable for:

• Indirect, incidental, special, or consequential damages
• Loss of profits, data, or business opportunities
• Decisions made by insurers, TPAs, or hospitals based on Platform data
• Third-party service failures or outages

Our total liability to you for any claim shall not exceed the amount paid by you for the Platform services in the 12 months preceding the claim.`,
  },
  {
    title: "9. Changes to Terms",
    content: `InsuraBridge may update these Terms from time to time. Material changes will be communicated via email or Platform notification at least 30 days before taking effect. Continued use of the Platform after the effective date constitutes acceptance of the updated Terms.`,
  },
  {
    title: "10. Governing Law & Disputes",
    content: `These Terms are governed by the laws of India. Any disputes arising from these Terms shall be resolved through:

1. Good-faith negotiation between the parties
2. Mediation, if negotiation fails
3. Arbitration under the Arbitration and Conciliation Act, 1996

The courts of Kolkata, West Bengal shall have exclusive jurisdiction for any legal proceedings.`,
  },
  {
    title: "11. Contact",
    content: `For questions about these Terms, contact us:

Email: sayanbhandari007@gmail.com  
Phone: +91 8806822007 / +91 7908815767

InsuraBridge — IRDAI Compliant Insurance Technology Platform
Last updated: April 2026`,
  },
]

export default function Terms() {
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
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-black text-foreground">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground mb-10">Effective Date: April 1, 2026 · Governed by Indian Law</p>

          <p className="text-muted-foreground leading-relaxed mb-10">
            These Terms of Service govern your use of the InsuraBridge platform. Please read them carefully. By using
            InsuraBridge, you enter into a binding agreement with us.
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
