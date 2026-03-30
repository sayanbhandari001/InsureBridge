import { db } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  usersTable,
  claimsTable,
  threadsTable,
  messagesTable,
  callLogsTable,
  documentsTable,
  feedbackTable,
  billsTable,
} from "@workspace/db/schema";

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(usersTable);
  let u1: any, u2: any, u3: any, u4: any, u5: any;

  if (existingUsers.length === 0) {
    [u1, u2, u3, u4, u5] = await db.insert(usersTable).values([
      { name: "Rahul Sharma", email: "rahul@example.com", role: "customer", phone: "+91-9876543210" },
      { name: "City General Hospital", email: "admin@cityhospital.com", role: "hospital", organization: "City General Hospital", phone: "+91-9988776655" },
      { name: "MediTPA Services", email: "ops@meditpa.com", role: "tpa", organization: "MediTPA Services Pvt Ltd", phone: "+91-9111222333" },
      { name: "NationalLife Insurance", email: "claims@nationallife.com", role: "insurer", organization: "NationalLife Insurance Co.", phone: "+91-9222333444" },
      { name: "Priya Mehta", email: "priya@example.com", role: "customer", phone: "+91-9000111222" },
    ]).returning();
  } else {
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
        policyNumber: "NL-POL-2024-0011",
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
        policyNumber: "NL-POL-2024-0088",
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
        policyNumber: "NL-POL-2024-0011",
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
      {
        threadId: t1.id,
        claimId: c1.id,
        senderId: u3.id,
        senderName: "MediTPA Services",
        senderRole: "tpa",
        content: "We have received the claim documents for CLM-20240001. Please submit the original discharge summary at the earliest.",
        attachments: [],
      },
      {
        threadId: t1.id,
        claimId: c1.id,
        senderId: u2.id,
        senderName: "City General Hospital",
        senderRole: "hospital",
        content: "The discharge summary has been uploaded. Please check the documents section.",
        attachments: [],
      },
      {
        threadId: t1.id,
        claimId: c1.id,
        senderId: u4.id,
        senderName: "NationalLife Insurance",
        senderRole: "insurer",
        content: "We are reviewing the submitted documents. Will update within 2 business days.",
        attachments: [],
      },
      {
        threadId: t2.id,
        claimId: c2.id,
        senderId: u5.id,
        senderName: "Priya Mehta",
        senderRole: "customer",
        content: "Hi, can I get an update on my reimbursement claim for knee replacement?",
        attachments: [],
      },
      {
        threadId: t2.id,
        claimId: c2.id,
        senderId: u3.id,
        senderName: "MediTPA Services",
        senderRole: "tpa",
        content: "Your claim has been approved for ₹2,20,000. The settlement will be processed within 5-7 business days.",
        attachments: [],
      },
    ]);

    await db.update(threadsTable).set({ messageCount: 3, lastMessageAt: new Date() }).where(eq(threadsTable.id, t1.id));
    await db.update(threadsTable).set({ messageCount: 2, lastMessageAt: new Date() }).where(eq(threadsTable.id, t2.id));
  }

  const existingCalls = await db.select().from(callLogsTable);
  if (existingCalls.length === 0) {
    await db.insert(callLogsTable).values([
      {
        claimId: c1.id,
        callerId: u3.id,
        callerName: "MediTPA Services",
        callerRole: "tpa",
        receiverName: "City General Hospital",
        receiverRole: "hospital",
        direction: "outbound",
        duration: 420,
        outcome: "connected",
        notes: "Discussed document requirements for CLM-20240001. Hospital confirmed they will upload discharge summary by EOD.",
        callDate: new Date("2024-03-16T11:30:00"),
      },
      {
        claimId: c2.id,
        callerId: u5.id,
        callerName: "Priya Mehta",
        callerRole: "customer",
        receiverName: "MediTPA Services",
        receiverRole: "tpa",
        direction: "inbound",
        duration: 180,
        outcome: "connected",
        notes: "Customer called to enquire about reimbursement status. Informed about approval.",
        callDate: new Date("2024-03-18T14:15:00"),
      },
      {
        callerId: u4.id,
        callerName: "NationalLife Insurance",
        callerRole: "insurer",
        receiverName: "Rahul Sharma",
        receiverRole: "customer",
        direction: "outbound",
        duration: null,
        outcome: "missed",
        notes: "Called to request additional documentation.",
        callDate: new Date("2024-03-21T10:00:00"),
      },
    ]);
  }

  const existingDocs = await db.select().from(documentsTable);
  if (existingDocs.length === 0) {
    await db.insert(documentsTable).values([
      {
        claimId: c1.id,
        uploadedById: u2.id,
        uploaderName: "City General Hospital",
        uploaderRole: "hospital",
        fileName: "discharge_summary_rahul_sharma.pdf",
        fileType: "application/pdf",
        fileSize: 524288,
        documentType: "discharge_summary",
        url: "/documents/discharge_summary_rahul_sharma.pdf",
        status: "approved",
        notes: "Original discharge summary",
      },
      {
        claimId: c1.id,
        uploadedById: u2.id,
        uploaderName: "City General Hospital",
        uploaderRole: "hospital",
        fileName: "hospital_bill_clm20240001.pdf",
        fileType: "application/pdf",
        fileSize: 262144,
        documentType: "bill",
        url: "/documents/hospital_bill_clm20240001.pdf",
        status: "pending",
        notes: "Itemized bill for surgery",
      },
      {
        claimId: c1.id,
        uploadedById: u3.id,
        uploaderName: "MediTPA Services",
        uploaderRole: "tpa",
        fileName: "tpa_claim_form_clm20240001.pdf",
        fileType: "application/pdf",
        fileSize: 131072,
        documentType: "tpa_form",
        url: "/documents/tpa_claim_form_clm20240001.pdf",
        status: "approved",
        notes: "Completed TPA verification form",
      },
      {
        claimId: c2.id,
        uploadedById: u5.id,
        uploaderName: "Priya Mehta",
        uploaderRole: "customer",
        fileName: "id_proof_priya_mehta.jpg",
        fileType: "image/jpeg",
        fileSize: 1048576,
        documentType: "id_proof",
        url: "/documents/id_proof_priya_mehta.jpg",
        status: "approved",
        notes: "Aadhar card",
      },
    ]);
  }

  const existingFeedback = await db.select().from(feedbackTable);
  if (existingFeedback.length === 0) {
    await db.insert(feedbackTable).values([
      {
        customerId: u5.id,
        customerName: "Priya Mehta",
        claimId: c2.id,
        rating: 4,
        category: "claim_process",
        comment: "The claim process was smooth. Appreciated the quick turnaround.",
        targetEntity: "insurer",
      },
      {
        customerId: u1.id,
        customerName: "Rahul Sharma",
        claimId: c1.id,
        rating: 3,
        category: "communication",
        comment: "Communication could be more timely. Had to call multiple times for updates.",
        targetEntity: "tpa",
      },
      {
        customerId: u5.id,
        customerName: "Priya Mehta",
        claimId: c2.id,
        rating: 5,
        category: "hospital_service",
        comment: "Excellent care at City General Hospital. Staff was very professional.",
        targetEntity: "hospital",
      },
      {
        customerId: u1.id,
        customerName: "Rahul Sharma",
        rating: 4,
        category: "overall",
        comment: "Overall good experience. Could improve on documentation requirements clarity.",
        targetEntity: "overall",
      },
    ]);
  }

  const existingBills = await db.select().from(billsTable);
  if (existingBills.length === 0) {
    await db.insert(billsTable).values([
      {
        claimId: c1.id,
        billNumber: "BILL-CG-2024-0845",
        hospitalName: "City General Hospital",
        patientName: "Rahul Sharma",
        totalAmount: "85000",
        approvedAmount: null,
        items: [
          { description: "Surgical Procedure - Appendectomy", amount: 45000, quantity: 1, category: "Surgery" },
          { description: "ICU Stay (3 days)", amount: 18000, quantity: 3, category: "Accommodation" },
          { description: "General Ward (2 days)", amount: 6000, quantity: 2, category: "Accommodation" },
          { description: "Anesthesia", amount: 8000, quantity: 1, category: "Medical" },
          { description: "Lab Tests & Diagnostics", amount: 5000, quantity: 1, category: "Diagnostics" },
          { description: "Medicines & Consumables", amount: 3000, quantity: 1, category: "Pharmacy" },
        ],
        status: "under_review",
        submittedAt: new Date("2024-03-16"),
        notes: "All charges as per standard tariff.",
      },
      {
        claimId: c2.id,
        billNumber: "BILL-CG-2024-0712",
        hospitalName: "City General Hospital",
        patientName: "Priya Mehta",
        totalAmount: "250000",
        approvedAmount: "220000",
        deductible: "10000",
        items: [
          { description: "Knee Replacement Surgery (Bilateral)", amount: 150000, quantity: 1, category: "Surgery" },
          { description: "Implants & Prosthetics", amount: 60000, quantity: 1, category: "Medical" },
          { description: "Hospital Stay (8 days)", amount: 24000, quantity: 8, category: "Accommodation" },
          { description: "Physiotherapy Sessions", amount: 8000, quantity: 4, category: "Rehabilitation" },
          { description: "Lab Tests & X-rays", amount: 5000, quantity: 1, category: "Diagnostics" },
          { description: "Medicines", amount: 3000, quantity: 1, category: "Pharmacy" },
        ],
        status: "approved",
        submittedAt: new Date("2024-03-01"),
        processedAt: new Date("2024-03-10"),
        notes: "Approved after verification. Deductible applied as per policy.",
      },
    ]);
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
