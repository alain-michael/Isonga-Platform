Here is the **extracted text** from *Technical Specification Document (3).pdf*, exactly as it appears:

---

## **Technical Specification Document (TSD) — Financing Readiness Assessment and Investor Matching System**

---

### **1. System Overview**

#### **1.1 Objective**

This system aims to streamline the process by which Rwandan SMEs assess their financing readiness and connect with investors or lenders. It combines a sector-specific assessment engine, a post-assessment document vetting system, and investor matching algorithms into a cloud-native, multilingual Progressive Web App (PWA).

#### **1.2 Deployment**

* **Cloud Host:** Hostinger Cloud
* **Architecture:** Microservices
* **Device Access:** Mobile-first (low-end Android compatibility)
* **Offline Support:** Yes (Workbox caching)
* **Languages:** Kinyarwanda, English, French

---

### **2. System Modules & Workflow**

#### **2.1 Signup & Login (SMEs Only)**

* Signup Options: Only SMEs can register; Investors are created by Admins
* Email/Phone Verification: Firebase Authentication with OTP/email confirmation
* Login: Secure JWT-based session for all users
* Role-Based Routing: Redirect based on role to SME Dashboard, Investor Portal, or Admin Panel
* Password Recovery: Email/OTP-based reset

#### **2.2 SME Assessment Flow (Step 1)**

* Tailored Questionnaire: Sector-specific questions rendered dynamically and editable by Admins
* Validation & Scoring: Scores computed for Business Model, Financial Health, Governance, Market Potential
* PDF Generation: Auto-generated summary with scores, gaps, and recommendations
* Opt-in & Payment: SMEs pay via Mobile Money (MTN/Airtel) to unlock the dashboard

#### **2.3 SME Dashboard (Step 2)**

* Profile & Details: Editable governance, operations, and business plan sections
* Document Upload: Financial documents uploaded to Data Room; auto-extracted via Google Document AI
* Investor Requests: SMEs respond to investor document/detail requests
* Profile Deletion: SMEs initiate deletion; Admins approve and log action

#### **2.4 Investor Portal**

* Browse & Filter: Vetted SMEs filtered by sector, score, funding size
* Criteria Setup: Investors define sector, funding range, minimum score, required documents
* Actions: Approve SMEs, request documents, trigger notifications

#### **2.5 Admin Portal**

* Questionnaire Management: Create/edit sector-specific questions
* Analytics: Track SME submissions, payments, engagements, matches
* Investor Onboarding: Add investors and configure their matching profiles

---

### **3. Technology Stack**

| Layer         | Technology                                                                       |
| ------------- | -------------------------------------------------------------------------------- |
| **Frontend**  | React.js, Material-UI, Chart.js, PDF.js                                          |
| **Backend**   | Node.js, FastAPI (Python), Redis, RabbitMQ                                       |
| **APIs**      | Firebase Auth, SendGrid, WhatsApp API, MTN/Airtel APIs, Google Cloud Document AI |
| **Storage**   | PostgreSQL (Hostinger), Firebase Storage                                         |
| **Dev Tools** | Workbox, Axios, Redux Toolkit                                                    |

---

### **4. Database Design**

* **Users:** login, role, language preferences
* **SMEs:** business profile, sector, contact info
* **Assessments:** scores, gaps, sector data
* **Documents (Data Room):** file path, vetting status, extracted financial data
* **Investors:** preferences, criteria
* **Matches:** investor–SME matches with match score
* **Billing:** payments, transaction status
* **Notifications:** WhatsApp/Email alerts
* **Audit Logs:** all create/edit/delete actions

---

### **5. Security & Compliance**

* **Authentication:** Firebase Auth with JWTs
* **Data at Rest:** AES-256 encryption (incl. Firebase Storage)
* **Access Control:** Role-based (frontend + backend)
* **Audit Trail:** All actions logged with user_id, timestamp, action type
* **Privacy:** Rwanda Data Protection Law No. 058/2021
* **Breach Protocol:** Notify affected users within 72 hours via WhatsApp/email

---

### **6. Non-Functional Requirements**

| Requirement         | Specification                                 |
| ------------------- | --------------------------------------------- |
| **Performance**     | <3s load on low-end Android, <1s API response |
| **Availability**    | 99.9% uptime                                  |
| **Scalability**     | 5,000 SMEs, 10,000 documents (Year 1)         |
| **Backup**          | Daily cloud backups, 7-day retention          |
| **Multilingual**    | Kinyarwanda, English, French                  |
| **Accessibility**   | WCAG 2.1 AA (keyboard nav, contrast, ARIA)    |
| **Offline Support** | PWA caching, offline input queueing           |

---

### **7. SME Journey Summary**

1. Signup and Login
2. Create Profile
3. Complete Assessment
4. Download Readiness PDF
5. Opt-in and Pay
6. Access Dashboard
7. Upload Financials
8. Get Vetted
9. Matched with Investors
10. Engage or Request Deletion

---

### **8. Investor Journey Summary**

1. Investor Account Created by Admin
2. Create Investor Profile
3. Set Matching Criteria

   * sector focus
   * funding range
   * minimum readiness score
   * required documents
4. Browse matched SMEs (filters: sector, amount, score)
5. View SME Profiles & Documents
6. Approve SMEs or request more documents/details
7. Trigger Notifications via WhatsApp/email
8. Track match engagement analytics
9. Download or export SME lists

---
