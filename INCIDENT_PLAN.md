# INCIDENT_PLAN.md

Security & Data Breach Incident Response Plan.
Prepared under the Digital Personal Data Protection Act (DPDP Act) and technical best practices.

---

## 1. Roles and Responsibilities

- **Data Fiduciary:** The Cafe Owner / Management entity (determines the purpose and means of data processing). The Cafe holds ultimate legal responsibility for decisions on notifying the Data Protection Board of India (DPBI) and affected Data Principals (customers).
- **Data Processor:** The Website Developer / Technical Operator (processes data strictly according to the Cafe's instructions and maintains technical security measures).

---

## 2. Emergency Contact Order (Call Immediately)

1. **Lead Developer / Technical Support:**
   - Name: [[CLIENT_TO_PROVIDE: developer business name]]
   - Phone: [[CLIENT_TO_PROVIDE: developer emergency phone]]
   - Email: [[CLIENT_TO_PROVIDE: developer emergency email]]
2. **Cafe Grievance / Privacy Officer:**
   - Name: [[CLIENT_TO_PROVIDE: grievance contact name]]
   - Phone: [[CLIENT_TO_PROVIDE: grievance phone]]
   - Email: [[CLIENT_TO_PROVIDE: grievance email]]

---

## 3. Incident Response Protocol (Step-by-Step)

### Step 1: Identification & Immediate Containment
- If unauthorized access or anomaly is suspected, immediately determine the scope.
- If compromised credentials or keys are suspected, revoke session tokens immediately via Supabase Auth dashboard.

### Step 2: What to Preserve (Forensic Integrity)
- **Do not wipe systems or delete server instances before preserving evidence.**
- Save and export database audit logs, HTTP access logs, and timestamps.
- Note the exact UTC / IST timestamps of suspicious activities.
- Preserve snapshots of affected database tables and logs in secure, read-only storage.

### Step 3: Key Rotation Procedures
- **Supabase Anon / Service Keys:**
  1. Access the Supabase Project Settings -> API.
  2. Generate a new API Secret / Service Role Key.
  3. Deploy updated environment variables to the hosting platform (Cloudflare / Netlify / Vercel).
  4. Invalidate all previous sessions in Supabase Auth.
- **Staff Passwords:**
  - Force password resets for all Staff accounts (`kitchen` and `owner`).

### Step 4: Backup Verification
- Ensure automated daily Supabase point-in-time recovery (PITR) backups are operational.
- Do not overwrite existing backups during an incident investigation.

### Step 5: Notification Assessment (DPDP Act Compliance)
- Under the DPDP Act, the Data Fiduciary (the Cafe) must evaluate the breach severity.
- If personal data of customers was compromised:
  1. The Cafe determines whether intimation to the Data Protection Board of India is required.
  2. The Cafe determines communications to affected customers (name and phone records).
  3. Any intimation must include description of the nature of the breach, measures taken, and safety recommendations for data principals.
