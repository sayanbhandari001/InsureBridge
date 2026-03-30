import { db } from "@workspace/db";
import {
  usersTable,
  claimsTable,
  portabilityRequestsTable,
  renewalsTable,
  callLogsTable,
  threadsTable,
  messagesTable,
  notificationsTable,
  ecardsTable,
  networkProvidersTable,
  membersTable,
} from "@workspace/db/schema";
import { logger } from "./logger";

const DEMO_HASH = "$2b$10$uVVV49oky530mIvJtJ2FEu6PL3S./PN.IgX.Yz.S.KWj7PC0W5ZJC";

function genCardNumber() {
  return "IB-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Date.now().toString().slice(-6);
}

export async function seedIfEmpty() {
  try {
    const existingUsers = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
    if (existingUsers.length > 0) {
      logger.info("Database already seeded, skipping");
      return;
    }

    logger.info("Seeding demo data...");

    const [u1, u2, u3, u4, u5, u6] = await db.insert(usersTable).values([
      { name: "Rahul Sharma", email: "rahul@example.com", role: "customer", passwordHash: DEMO_HASH, organization: null, phone: "+91-9876543210" },
      { name: "City General Hospital", email: "admin@cityhospital.com", role: "hospital", passwordHash: DEMO_HASH, organization: "City General Hospital", phone: "+91-22-12345678" },
      { name: "MediTPA Services", email: "ops@meditpa.com", role: "tpa", passwordHash: DEMO_HASH, organization: "MediTPA Services", phone: "+91-11-87654321" },
      { name: "NationalLife Insurance", email: "claims@nationallife.com", role: "insurer", passwordHash: DEMO_HASH, organization: "NationalLife Insurance", phone: "+91-20-11223344" },
      { name: "Priya Mehta", email: "priya@example.com", role: "customer", passwordHash: DEMO_HASH, organization: null, phone: "+91-9812345678" },
      { name: "Platform Admin", email: "admin@insurabridge.com", role: "admin", passwordHash: DEMO_HASH, organization: "InsuraBridge", phone: null },
    ]).returning();

    await db.insert(claimsTable).values([
      { patientName: "Rahul Sharma", patientId: u1.id, hospitalName: "City General Hospital", hospitalId: u2.id, diagnosisCode: "J18.9", diagnosisDescription: "Pneumonia", admissionDate: new Date("2025-11-01"), dischargeDate: new Date("2025-11-08"), totalAmount: "125000", hospitalDiscount: "12500", paidByInsurer: "100000", paidByCustomer: "12500", status: "approved", tpaId: u3.id, insurerId: u4.id },
      { patientName: "Priya Mehta", patientId: u5.id, hospitalName: "City General Hospital", hospitalId: u2.id, diagnosisCode: "I21.0", diagnosisDescription: "Heart Attack", admissionDate: new Date("2025-12-10"), dischargeDate: new Date("2025-12-18"), totalAmount: "280000", hospitalDiscount: "28000", paidByInsurer: "220000", paidByCustomer: "32000", status: "under_review", tpaId: u3.id, insurerId: u4.id },
      { patientName: "Rahul Sharma", patientId: u1.id, hospitalName: "City General Hospital", hospitalId: u2.id, diagnosisCode: "K35.89", diagnosisDescription: "Appendicitis", admissionDate: new Date("2026-01-15"), dischargeDate: new Date("2026-01-19"), totalAmount: "95000", hospitalDiscount: "9500", paidByInsurer: "75000", paidByCustomer: "10500", status: "pending", tpaId: u3.id, insurerId: u4.id },
    ]);

    await db.insert(portabilityRequestsTable).values([
      { customerId: u1.id, customerName: "Rahul Sharma", fromInsurerName: "StarHealth", toInsurerName: "NationalLife Insurance", policyNumber: "SH-POL-2022-0455", sumInsured: "500000", newSumInsured: "700000", portabilityReason: "Better premium rates and wider network", status: "completed", requestedAt: new Date("2024-01-10"), effectiveDate: new Date("2024-04-01"), newPolicyNumber: "NL-POL-2024-0455", notes: "Portability completed" },
      { customerId: u5.id, customerName: "Priya Mehta", fromInsurerName: "StarHealth", toInsurerName: "CareInsure", policyNumber: "SH-POL-2021-0112", sumInsured: "300000", newSumInsured: "400000", portabilityReason: "Better coverage for family", status: "completed", requestedAt: new Date("2025-01-15"), effectiveDate: new Date("2025-04-01"), newPolicyNumber: "CI-POL-2023-0112", notes: "Portability completed" },
    ]);

    await db.insert(renewalsTable).values([
      { customerId: u1.id, customerName: "Rahul Sharma", policyNumber: "NL-POL-2024-0011", insurerName: "NationalLife Insurance", expiryDate: new Date("2026-06-01"), currentSumInsured: "500000", currentPremium: "18000", memberCount: 2, status: "pending" },
      { customerId: u5.id, customerName: "Priya Mehta", policyNumber: "NL-POL-2024-0088", insurerName: "NationalLife Insurance", expiryDate: new Date("2025-12-01"), renewalDate: new Date("2025-11-20"), currentSumInsured: "600000", newSumInsured: "700000", currentPremium: "22000", newPremium: "25000", memberCount: 3, status: "completed", newPolicyNumber: "NL-POL-2025-0088", notes: "Renewed with enhanced family floater" },
      { customerId: u1.id, customerName: "Rahul Sharma", policyNumber: "NL-POL-2024-0455", insurerName: "NationalLife Insurance", expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), currentSumInsured: "700000", currentPremium: "26000", memberCount: 2, status: "pending", notes: "Renewal due for ported policy" },
      { customerId: u5.id, customerName: "Priya Mehta", policyNumber: "CI-POL-2023-0112", insurerName: "CareInsure", expiryDate: new Date("2025-03-01"), renewalDate: new Date("2025-02-20"), currentSumInsured: "400000", newSumInsured: "500000", currentPremium: "14000", newPremium: "16500", memberCount: 3, status: "completed", newPolicyNumber: "CI-POL-2024-0112", notes: "Annual renewal with enhanced coverage" },
    ]);

    await db.insert(callLogsTable).values([
      { callerId: u1.id, callerName: "Rahul Sharma", callerRole: "customer", receiverName: "MediTPA Services", receiverRole: "tpa", direction: "outbound", outcome: "connected", duration: 420, callDate: new Date("2026-01-10T10:30:00"), summary: "Patient enquired about claim #CLM-001 status. Informed that claim is under review by insurer.", finalDecision: "Claim to be processed within 5 business days. Customer to receive SMS update." },
      { callerId: u3.id, callerName: "MediTPA Services", callerRole: "tpa", receiverName: "NationalLife Insurance", receiverRole: "insurer", direction: "outbound", outcome: "connected", duration: 180, callDate: new Date("2026-01-12T14:00:00"), summary: "TPA called to verify policy coverage limits for upcoming surgery.", finalDecision: "Approved cashless limit of ₹2,00,000. Pre-auth number: PA-20260112-001" },
      { callerId: u2.id, callerName: "City General Hospital", callerRole: "hospital", receiverName: "MediTPA Services", receiverRole: "tpa", direction: "outbound", outcome: "connected", duration: 600, callDate: new Date("2026-01-15T11:00:00"), summary: "Hospital called to dispute TPA's reduction of claimed amount from ₹1,25,000 to ₹90,000.", finalDecision: "Agreed to settle at ₹1,10,000 after reviewing medical records. Hospital to resubmit bills." },
    ]);

    const [t1] = await db.insert(threadsTable).values([
      { subject: "Claim Status Update", participants: ["customer", "tpa"], claimId: null },
    ]).returning();

    await db.insert(messagesTable).values([
      { threadId: t1.id, senderId: u1.id, senderName: "Rahul Sharma", senderRole: "customer", content: "Hello, could you please update me on the status of my claim?" },
      { threadId: t1.id, senderId: u3.id, senderName: "MediTPA Services", senderRole: "tpa", content: "Hi Rahul, your claim is currently under review. We'll update you within 3 business days." },
    ]);

    await db.insert(notificationsTable).values([
      { userId: u1.id, title: "Claim Update", message: "Your claim is under review. Expected processing time: 3-5 business days.", type: "info", read: false },
      { userId: u1.id, title: "Policy Renewal Due", message: "Your policy NL-POL-2024-0455 is due for renewal in 45 days.", type: "warning", read: false },
      { userId: u3.id, title: "New Claim Received", message: "A new claim has been submitted by City General Hospital for Priya Mehta.", type: "info", read: false },
    ]);

    await db.insert(ecardsTable).values([
      { policyNumber: "NL-POL-2024-0011", memberName: "Rahul Sharma", memberId: u1.id, insurerName: "NationalLife Insurance", tpaName: "MediTPA Services", cardNumber: genCardNumber(), sumInsured: "500000", validFrom: new Date("2025-06-01"), validTo: new Date("2026-06-01"), status: "active" },
      { policyNumber: "NL-POL-2025-0088", memberName: "Priya Mehta", memberId: u5.id, insurerName: "NationalLife Insurance", tpaName: "MediTPA Services", cardNumber: genCardNumber(), sumInsured: "700000", validFrom: new Date("2026-01-01"), validTo: new Date("2027-01-01"), status: "active" },
    ]);

    await db.insert(networkProvidersTable).values([
      { name: "City General Hospital", type: "hospital", city: "Mumbai", state: "Maharashtra", address: "123 Main Street, Andheri, Mumbai - 400053", phone: "+91-22-12345678", email: "admin@cityhospital.com", specialities: ["Cardiology", "Orthopedics", "General Surgery", "Neurology"], insurerIds: [u4.id], bedCount: 350, cashlessEnabled: true },
      { name: "Apollo Clinic", type: "clinic", city: "Bangalore", state: "Karnataka", address: "45 MG Road, Bangalore - 560001", phone: "+91-80-98765432", email: "admin@apolloclinic.com", specialities: ["General Medicine", "Pediatrics"], insurerIds: [u4.id], bedCount: 50, cashlessEnabled: true },
    ]);

    await db.insert(membersTable).values([
      { policyNumber: "NL-POL-2024-0011", primaryMemberId: u1.id, memberName: "Rahul Sharma", relationship: "self", dateOfBirth: new Date("1985-05-15"), gender: "male", sumInsured: "500000" },
      { policyNumber: "NL-POL-2024-0011", primaryMemberId: u1.id, memberName: "Sunita Sharma", relationship: "spouse", dateOfBirth: new Date("1988-09-22"), gender: "female", sumInsured: "500000" },
    ]);

    logger.info("Demo seed completed successfully");
  } catch (err) {
    logger.error({ err }, "Seed failed — app will still start");
  }
}
