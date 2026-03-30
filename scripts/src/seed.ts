import { db } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  usersTable,
  claimsTable,
  threadsTable,
  messagesTable,
  callLogsTable,
  documentsTable,
  feedbackTable,
  billsTable,
  notificationsTable,
  ecardsTable,
  networkProvidersTable,
  scrutinyCasesTable,
  portabilityRequestsTable,
  renewalsTable,
  membersTable,
  reimbursementSettlementsTable,
  appFeedbackTable,
} from "@workspace/db/schema";

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(usersTable);
  let u1: any, u2: any, u3: any, u4: any, u5: any;

  if (existingUsers.length === 0) {
    const hash = await bcrypt.hash("demo1234", 10);
    [u1, u2, u3, u4, u5] = await db.insert(usersTable).values([
      { name: "Rahul Sharma", email: "rahul@example.com", passwordHash: hash, role: "customer", phone: "+91-9876543210" },
      { name: "City General Hospital", email: "admin@cityhospital.com", passwordHash: hash, role: "hospital", organization: "City General Hospital", phone: "+91-9988776655" },
      { name: "MediTPA Services", email: "ops@meditpa.com", passwordHash: hash, role: "tpa", organization: "MediTPA Services Pvt Ltd", phone: "+91-9111222333" },
      { name: "NationalLife Insurance", email: "claims@nationallife.com", passwordHash: hash, role: "insurer", organization: "NationalLife Insurance Co.", phone: "+91-9222333444" },
      { name: "Priya Mehta", email: "priya@example.com", passwordHash: hash, role: "customer", phone: "+91-9000111222" },
    ]).returning();
  } else {
    // Update passwordHash for existing users that have empty hash
    const emptyHashUsers = existingUsers.filter(u => !u.passwordHash || u.passwordHash === "");
    if (emptyHashUsers.length > 0) {
      const hash = await bcrypt.hash("demo1234", 10);
      for (const u of emptyHashUsers) {
        await db.update(usersTable).set({ passwordHash: hash }).where(eq(usersTable.id, u.id));
      }
    }
    [u1, u2, u3, u4, u5] = existingUsers;
  }

  const existingClaims = await db.select().from(claimsTable);
  let c1: any, c2: any, c3: any;

  if (existingClaims.length === 0) {
    [c1, c2, c3] = await db.insert(claimsTable).values([
      {
        claimNumber: "CLM-20240001",
        customerId: u1.id,
        patientName: "Rahul Sharma",
        hospitalId: u2.id,
        hospitalName: "City General Hospital",
        insurerId: u4.id,
        tpaId: u3.id,
        status: "under_review",
        claimType: "cashless",
        diagnosis: "Appendicitis - Appendectomy",
        admissionDate: new Date("2024-03-10"),
        dischargeDate: new Date("2024-03-15"),
        claimedAmount: "85000",
        roomRentCharges: "24000",
        surgeryCharges: "45000",
        medicineCharges: "3000",
        diagnosticCharges: "5000",
        otherCharges: "8000",
        policyNumber: "NL-POL-2024-0011",
        icdCode: "K37",
        treatmentType: "Surgical",
        notes: "Emergency surgery. All documents submitted.",
        updatedAt: new Date(),
      },
      {
        claimNumber: "CLM-20240002",
        customerId: u5.id,
        patientName: "Priya Mehta",
        hospitalId: u2.id,
        hospitalName: "City General Hospital",
        insurerId: u4.id,
        tpaId: u3.id,
        status: "approved",
        claimType: "reimbursement",
        diagnosis: "Knee Replacement Surgery",
        admissionDate: new Date("2024-02-20"),
        dischargeDate: new Date("2024-02-28"),
        claimedAmount: "250000",
        approvedAmount: "220000",
        deductible: "10000",
        coPayAmount: "5000",
        netPayableAmount: "205000",
        roomRentCharges: "24000",
        surgeryCharges: "150000",
        medicineCharges: "3000",
        diagnosticCharges: "5000",
        otherCharges: "68000",
        policyNumber: "NL-POL-2024-0088",
        icdCode: "M17.1",
        treatmentType: "Surgical",
        notes: "Pre-approved. TPA verified.",
        updatedAt: new Date(),
      },
      {
        claimNumber: "CLM-20240003",
        customerId: u1.id,
        patientName: "Rahul Sharma",
        hospitalId: u2.id,
        hospitalName: "City General Hospital",
        insurerId: u4.id,
        status: "pending_documents",
        claimType: "reimbursement",
        diagnosis: "Cardiac Checkup",
        admissionDate: new Date("2024-03-20"),
        claimedAmount: "45000",
        diagnosticCharges: "35000",
        medicineCharges: "10000",
        policyNumber: "NL-POL-2024-0011",
        icdCode: "Z03.5",
        treatmentType: "Medical",
        notes: "Pending discharge summary and lab reports.",
        updatedAt: new Date(),
      },
    ]).returning();
  } else {
    [c1, c2, c3] = existingClaims;
  }

  const existingThreads = await db.select().from(threadsTable);
  let t1: any, t2: any;

  if (existingThreads.length === 0) {
    [t1, t2] = await db.insert(threadsTable).values([
      {
        subject: `Claim ${c1.claimNumber} - Document Verification`,
        claimId: c1.id,
        participants: ["hospital", "tpa", "insurer"],
        lastMessageAt: new Date(),
        messageCount: 0,
      },
      {
        subject: `Claim ${c2.claimNumber} - Approval Status`,
        claimId: c2.id,
        participants: ["customer", "tpa", "insurer"],
        lastMessageAt: new Date(),
        messageCount: 0,
      },
    ]).returning();
  } else {
    [t1, t2] = existingThreads;
  }

  const existingMessages = await db.select().from(messagesTable);
  if (existingMessages.length === 0) {
    await db.insert(messagesTable).values([
      { threadId: t1.id, claimId: c1.id, senderId: u3.id, senderName: "MediTPA Services", senderRole: "tpa", content: "We have received the claim documents for CLM-20240001. Please submit the original discharge summary at the earliest.", attachments: [] },
      { threadId: t1.id, claimId: c1.id, senderId: u2.id, senderName: "City General Hospital", senderRole: "hospital", content: "The discharge summary has been uploaded. Please check the documents section.", attachments: [] },
      { threadId: t1.id, claimId: c1.id, senderId: u4.id, senderName: "NationalLife Insurance", senderRole: "insurer", content: "We are reviewing the submitted documents. Will update within 2 business days.", attachments: [] },
      { threadId: t2.id, claimId: c2.id, senderId: u5.id, senderName: "Priya Mehta", senderRole: "customer", content: "Hi, can I get an update on my reimbursement claim for knee replacement?", attachments: [] },
      { threadId: t2.id, claimId: c2.id, senderId: u3.id, senderName: "MediTPA Services", senderRole: "tpa", content: "Your claim has been approved for ₹2,20,000. The settlement will be processed within 5-7 business days.", attachments: [] },
    ]);
    await db.update(threadsTable).set({ messageCount: 3, lastMessageAt: new Date() }).where(eq(threadsTable.id, t1.id));
    await db.update(threadsTable).set({ messageCount: 2, lastMessageAt: new Date() }).where(eq(threadsTable.id, t2.id));
  }

  const existingCalls = await db.select().from(callLogsTable);
  if (existingCalls.length === 0) {
    await db.insert(callLogsTable).values([
      { claimId: c1.id, callerId: u3.id, callerName: "MediTPA Services", callerRole: "tpa", receiverName: "City General Hospital", receiverRole: "hospital", direction: "outbound", duration: 420, outcome: "connected", notes: "Discussed document requirements. Hospital confirmed upload by EOD.", callDate: new Date("2024-03-16T11:30:00") },
      { claimId: c2.id, callerId: u5.id, callerName: "Priya Mehta", callerRole: "customer", receiverName: "MediTPA Services", receiverRole: "tpa", direction: "inbound", duration: 180, outcome: "connected", notes: "Customer enquired about reimbursement status. Informed about approval.", callDate: new Date("2024-03-18T14:15:00") },
      { callerId: u4.id, callerName: "NationalLife Insurance", callerRole: "insurer", receiverName: "Rahul Sharma", receiverRole: "customer", direction: "outbound", outcome: "missed", notes: "Called to request additional documentation.", callDate: new Date("2024-03-21T10:00:00") },
    ]);
  }

  const existingDocs = await db.select().from(documentsTable);
  if (existingDocs.length === 0) {
    await db.insert(documentsTable).values([
      { claimId: c1.id, uploadedById: u2.id, uploaderName: "City General Hospital", uploaderRole: "hospital", fileName: "discharge_summary_rahul_sharma.pdf", fileType: "application/pdf", fileSize: 524288, documentType: "discharge_summary", url: "/documents/discharge_summary_rahul_sharma.pdf", status: "approved", notes: "Original discharge summary" },
      { claimId: c1.id, uploadedById: u2.id, uploaderName: "City General Hospital", uploaderRole: "hospital", fileName: "hospital_bill_clm20240001.pdf", fileType: "application/pdf", fileSize: 262144, documentType: "bill", url: "/documents/hospital_bill_clm20240001.pdf", status: "pending", notes: "Itemized bill for surgery" },
      { claimId: c1.id, uploadedById: u3.id, uploaderName: "MediTPA Services", uploaderRole: "tpa", fileName: "tpa_claim_form_clm20240001.pdf", fileType: "application/pdf", fileSize: 131072, documentType: "tpa_form", url: "/documents/tpa_claim_form_clm20240001.pdf", status: "approved", notes: "Completed TPA verification form" },
      { claimId: c2.id, uploadedById: u5.id, uploaderName: "Priya Mehta", uploaderRole: "customer", fileName: "id_proof_priya_mehta.jpg", fileType: "image/jpeg", fileSize: 1048576, documentType: "id_proof", url: "/documents/id_proof_priya_mehta.jpg", status: "approved", notes: "Aadhar card" },
    ]);
  }

  const existingFeedback = await db.select().from(feedbackTable);
  if (existingFeedback.length === 0) {
    await db.insert(feedbackTable).values([
      { customerId: u5.id, customerName: "Priya Mehta", claimId: c2.id, rating: 4, category: "claim_process", comment: "The claim process was smooth. Appreciated the quick turnaround.", targetEntity: "insurer" },
      { customerId: u1.id, customerName: "Rahul Sharma", claimId: c1.id, rating: 3, category: "communication", comment: "Communication could be more timely. Had to call multiple times for updates.", targetEntity: "tpa" },
      { customerId: u5.id, customerName: "Priya Mehta", claimId: c2.id, rating: 5, category: "hospital_service", comment: "Excellent care at City General Hospital. Staff was very professional.", targetEntity: "hospital" },
      { customerId: u1.id, customerName: "Rahul Sharma", rating: 4, category: "overall", comment: "Overall good experience. Could improve on documentation requirements clarity.", targetEntity: "overall" },
    ]);
  }

  const existingBills = await db.select().from(billsTable);
  if (existingBills.length === 0) {
    await db.insert(billsTable).values([
      {
        claimId: c1.id, billNumber: "BILL-CG-2024-0845", hospitalName: "City General Hospital", patientName: "Rahul Sharma",
        totalAmount: "85000", status: "under_review", submittedAt: new Date("2024-03-16"),
        items: [
          { description: "Surgical Procedure - Appendectomy", amount: 45000, quantity: 1, category: "Surgery" },
          { description: "ICU Stay (3 days)", amount: 18000, quantity: 3, category: "Accommodation" },
          { description: "General Ward (2 days)", amount: 6000, quantity: 2, category: "Accommodation" },
          { description: "Anesthesia", amount: 8000, quantity: 1, category: "Medical" },
          { description: "Lab Tests & Diagnostics", amount: 5000, quantity: 1, category: "Diagnostics" },
          { description: "Medicines & Consumables", amount: 3000, quantity: 1, category: "Pharmacy" },
        ],
        notes: "All charges as per standard tariff.",
      },
      {
        claimId: c2.id, billNumber: "BILL-CG-2024-0712", hospitalName: "City General Hospital", patientName: "Priya Mehta",
        totalAmount: "250000", approvedAmount: "220000", deductible: "10000", status: "approved",
        submittedAt: new Date("2024-03-01"), processedAt: new Date("2024-03-10"),
        items: [
          { description: "Knee Replacement Surgery (Bilateral)", amount: 150000, quantity: 1, category: "Surgery" },
          { description: "Implants & Prosthetics", amount: 60000, quantity: 1, category: "Medical" },
          { description: "Hospital Stay (8 days)", amount: 24000, quantity: 8, category: "Accommodation" },
          { description: "Physiotherapy Sessions", amount: 8000, quantity: 4, category: "Rehabilitation" },
          { description: "Lab Tests & X-rays", amount: 5000, quantity: 1, category: "Diagnostics" },
          { description: "Medicines", amount: 3000, quantity: 1, category: "Pharmacy" },
        ],
        notes: "Approved after verification. Deductible applied as per policy.",
      },
    ]);
  }

  // Notifications
  const existingNotifs = await db.select().from(notificationsTable);
  if (existingNotifs.length === 0) {
    await db.insert(notificationsTable).values([
      { userId: u1.id, title: "Claim Update", message: "Your claim CLM-20240001 is now under review.", type: "claim_update", relatedId: c1.id, relatedType: "claim" },
      { userId: u1.id, title: "New Message", message: "MediTPA Services sent you a message regarding CLM-20240001.", type: "message", relatedId: t1.id, relatedType: "thread" },
      { userId: u5.id, title: "Claim Approved", message: "Your claim CLM-20240002 has been approved for ₹2,20,000.", type: "claim_update", relatedId: c2.id, relatedType: "claim", isRead: true },
      { userId: u3.id, title: "New Claim", message: "A new cashless claim CLM-20240001 requires TPA verification.", type: "claim_update", relatedId: c1.id, relatedType: "claim" },
    ]);
  }

  // E-Cards
  const existingEcards = await db.select().from(ecardsTable);
  if (existingEcards.length === 0) {
    await db.insert(ecardsTable).values([
      { memberId: u1.id, memberName: "Rahul Sharma", policyNumber: "NL-POL-2024-0011", insurerName: "NationalLife Insurance", tpaName: "MediTPA Services", cardNumber: "IB-EC-001-2024", sumInsured: "500000", validFrom: new Date("2024-01-01"), validTo: new Date("2024-12-31"), status: "active", dependents: ["Sunita Sharma (Spouse)", "Arjun Sharma (Child)"] },
      { memberId: u5.id, memberName: "Priya Mehta", policyNumber: "NL-POL-2024-0088", insurerName: "NationalLife Insurance", tpaName: "MediTPA Services", cardNumber: "IB-EC-002-2024", sumInsured: "1000000", validFrom: new Date("2024-01-01"), validTo: new Date("2024-12-31"), status: "active", dependents: ["Vikram Mehta (Spouse)"] },
    ]);
  }

  // Network Providers
  const existingProviders = await db.select().from(networkProvidersTable);
  if (existingProviders.length === 0) {
    await db.insert(networkProvidersTable).values([
      { name: "City General Hospital", type: "hospital", city: "Mumbai", state: "Maharashtra", address: "123 Main Street, Andheri, Mumbai - 400053", phone: "+91-22-12345678", email: "admin@cityhospital.com", specialities: ["Cardiology", "Orthopedics", "General Surgery", "Neurology"], insurerIds: [u4.id], bedCount: 350, cashlessEnabled: true },
      { name: "Apollo Diagnostics", type: "diagnostic", city: "Mumbai", state: "Maharashtra", address: "45 Health Park, Bandra, Mumbai - 400050", phone: "+91-22-87654321", specialities: ["Radiology", "Pathology", "MRI/CT Scan"], insurerIds: [u4.id], cashlessEnabled: true },
      { name: "MedPharm Pharmacy", type: "pharmacy", city: "Pune", state: "Maharashtra", address: "78 Medical Lane, Pune - 411001", phone: "+91-20-11223344", specialities: ["Retail Pharmacy", "Specialty Drugs"], insurerIds: [u4.id], cashlessEnabled: false, status: "active" },
      { name: "Sunshine Clinic", type: "clinic", city: "Delhi", state: "Delhi", address: "22 Green Avenue, New Delhi - 110001", phone: "+91-11-55667788", specialities: ["General Medicine", "Pediatrics"], insurerIds: [u4.id], bedCount: 20, cashlessEnabled: true },
    ]);
  }

  // Scrutiny Cases
  const existingScrutiny = await db.select().from(scrutinyCasesTable);
  if (existingScrutiny.length === 0) {
    await db.insert(scrutinyCasesTable).values([
      { claimId: c1.id, claimNumber: "CLM-20240001", patientName: "Rahul Sharma", billAmount: "85000", status: "in_review", assignedTo: "Dr. Anita Rao", deductionReasons: [], remarks: "ICU charges under scrutiny for day 3 as per policy limit" },
      { claimId: c2.id, claimNumber: "CLM-20240002", patientName: "Priya Mehta", billAmount: "250000", scrutinizedAmount: "220000", deductions: "30000", status: "completed", assignedTo: "Dr. Sanjay Gupta", deductionReasons: ["Physiotherapy exceeds policy limit", "Non-standard implant charges"], remarks: "Completed. Net admissible ₹2,20,000.", completedAt: new Date("2024-03-08") },
    ]);
  }

  // Portability Requests
  const existingPortability = await db.select().from(portabilityRequestsTable);
  if (existingPortability.length === 0) {
    await db.insert(portabilityRequestsTable).values([
      { customerId: u1.id, customerName: "Rahul Sharma", fromInsurerName: "StarHealth Insurance", toInsurerName: "NationalLife Insurance", policyNumber: "SH-POL-2022-0455", sumInsured: "300000", newSumInsured: "500000", portabilityReason: "Better coverage and network hospitals", previousClaimHistory: "1 claim of ₹45,000 in 2023", status: "under_review", requestedAt: new Date("2024-03-01") },
    ]);
  }

  // Renewals
  const existingRenewals = await db.select().from(renewalsTable);
  if (existingRenewals.length === 0) {
    await db.insert(renewalsTable).values([
      { customerId: u1.id, customerName: "Rahul Sharma", policyNumber: "NL-POL-2024-0011", insurerName: "NationalLife Insurance", expiryDate: new Date("2024-12-31"), currentSumInsured: "500000", newSumInsured: "750000", currentPremium: "12000", newPremium: "16500", status: "pending", memberCount: 3, notes: "Sum insured upgrade requested" },
      { customerId: u5.id, customerName: "Priya Mehta", policyNumber: "NL-POL-2024-0088", insurerName: "NationalLife Insurance", expiryDate: new Date("2024-12-31"), currentSumInsured: "1000000", currentPremium: "22000", status: "initiated", memberCount: 2, renewalDate: new Date("2024-11-15") },
    ]);
  }

  // Members
  const existingMembers = await db.select().from(membersTable);
  if (existingMembers.length === 0) {
    await db.insert(membersTable).values([
      { customerId: u1.id, policyNumber: "NL-POL-2024-0011", name: "Rahul Sharma", relationship: "self", dateOfBirth: new Date("1985-06-15"), gender: "male", preExistingConditions: ["Hypertension"], sumInsured: "500000", addedAt: new Date("2024-01-01") },
      { customerId: u1.id, policyNumber: "NL-POL-2024-0011", name: "Sunita Sharma", relationship: "spouse", dateOfBirth: new Date("1988-03-20"), gender: "female", preExistingConditions: [], sumInsured: "500000", addedAt: new Date("2024-01-01") },
      { customerId: u1.id, policyNumber: "NL-POL-2024-0011", name: "Arjun Sharma", relationship: "child", dateOfBirth: new Date("2015-09-10"), gender: "male", preExistingConditions: [], sumInsured: "500000", addedAt: new Date("2024-01-01") },
      { customerId: u5.id, policyNumber: "NL-POL-2024-0088", name: "Priya Mehta", relationship: "self", dateOfBirth: new Date("1980-11-05"), gender: "female", preExistingConditions: ["Diabetes Type 2"], sumInsured: "1000000", addedAt: new Date("2024-01-01") },
      { customerId: u5.id, policyNumber: "NL-POL-2024-0088", name: "Vikram Mehta", relationship: "spouse", dateOfBirth: new Date("1978-07-22"), gender: "male", preExistingConditions: [], sumInsured: "1000000", addedAt: new Date("2024-01-01") },
    ]);
  }

  // Reimbursement Settlements
  const existingSettlements = await db.select().from(reimbursementSettlementsTable);
  if (existingSettlements.length === 0) {
    await db.insert(reimbursementSettlementsTable).values([
      {
        claimId: c2.id, claimNumber: "CLM-20240002", patientName: "Priya Mehta",
        policyNumber: "NL-POL-2024-0088", hospitalName: "City General Hospital",
        admissionDate: new Date("2024-02-20"), dischargeDate: new Date("2024-02-28"),
        totalBillAmount: "250000", admissibleAmount: "220000", deductible: "10000",
        coPayAmount: "5000", nonAdmissibleAmount: "30000", netPayableAmount: "205000",
        roomRentCharges: "24000", surgeryCharges: "150000", medicineCharges: "3000",
        diagnosticCharges: "5000", otherCharges: "68000",
        nonAdmissibleReasons: ["Physiotherapy exceeds limit (₹8,000 excess)", "Non-standard implant (₹22,000 excess)"],
        paymentMode: "neft", utrNumber: "UTR2024031000123", settlementDate: new Date("2024-03-10"),
        status: "paid", remarks: "Settlement processed. NEFT credit confirmed.",
      },
      {
        claimId: c1.id, claimNumber: "CLM-20240001", patientName: "Rahul Sharma",
        policyNumber: "NL-POL-2024-0011", hospitalName: "City General Hospital",
        admissionDate: new Date("2024-03-10"), dischargeDate: new Date("2024-03-15"),
        totalBillAmount: "85000",
        roomRentCharges: "24000", surgeryCharges: "45000", medicineCharges: "3000",
        diagnosticCharges: "5000", otherCharges: "8000",
        nonAdmissibleReasons: [],
        status: "processing", remarks: "Documents verified. Awaiting final approval.",
      },
    ]);
  }

  // App Feedback
  const existingAppFeedback = await db.select().from(appFeedbackTable);
  if (existingAppFeedback.length === 0) {
    await db.insert(appFeedbackTable).values([
      { userId: u3.id, userName: "MediTPA Services", userRole: "tpa", rating: 4, feature: "tpa_tools", comment: "E-card management is very efficient. Network provider lookup could be faster." },
      { userId: u4.id, userName: "NationalLife Insurance", userRole: "insurer", rating: 5, feature: "claims", comment: "Claims dashboard gives excellent overview. Very helpful for daily operations." },
      { userId: u2.id, userName: "City General Hospital", userRole: "hospital", rating: 4, feature: "billing", comment: "Billing breakdown is clear and detailed. Would appreciate more export options." },
      { userId: u1.id, userName: "Rahul Sharma", userRole: "customer", rating: 5, feature: "overall", comment: "Really easy to track my claims and communicate with TPA. Love the notification system." },
    ]);
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
