# Restructure Partner Onboarding Authorization (MSG91 WhatsApp OTP & Unified Verification)

## Overview
We will restructure the partner onboarding authorization flow across the entire platform:
1. **Remove email OTP completely** and replace it with **MSG91 WhatsApp OTP**.
2. **Make email optional** and **mobile number strictly required** across all partner registration/onboarding forms.
3. **Unify partner onboarding navigation**: Submitting any partner registration form from **any panel** (Super Admin panel, Marketing Member panel, Cafe Admin panel, or public `/register` route) will redirect the user to a **single partner verification page** (`/verify-partner?mobile=...`).
4. **Single Partner Verification Page Flow (3 Steps)**:
   - **Step 1: Request OTP**: User requests an OTP to be sent to their WhatsApp number via MSG91.
   - **Step 2: Enter & Verify OTP**: User inputs the 6-digit OTP received on WhatsApp to verify their identity.
   - **Step 3: Set Password & Confirm Password**: User sets and confirms their account password. Upon saving, their account is activated and ready for login.

---

## User Review Required

> [!IMPORTANT]
> **MSG91 WhatsApp API Configuration**:
> - We will create a robust MSG91 WhatsApp OTP service in `src/lib/msg91.ts`.
> - The service will read `MSG91_AUTH_KEY` and `MSG91_OTP_TEMPLATE_ID` (and optional `MSG91_INTEGRATED_NUMBER`) from `.env`.
> - If `MSG91_AUTH_KEY` is not present in `.env` (or in test mode), it gracefully operates in development simulation mode (logging the OTP to console and allowing verification), ensuring local development, QA, and builds never fail.
> - Please ensure your MSG91 dashboard has a WhatsApp OTP template approved with the `##OTP##` variable.

> [!NOTE]
> **Cafe Admin Panel Enhancement**:
> - The Cafe Admin panel (`/admin/partners`) currently only has a list view of partners. We will add an **"Onboard Partner"** button and modal (matching Super Admin's design), allowing cafe administrators to onboard partners, which also navigates to `/verify-partner?mobile=...`.

---

## Proposed Changes

### 1. Database Schema & Prisma

#### [MODIFY] [schema.prisma](file:///d:/AGOC/hope-master/prisma/schema.prisma)
- Update `PartnerOTP` model:
  - Add `mobile String?`
  - Make `email String?` (optional)
- Run database update on Neon PostgreSQL to add `mobile` column to `"PartnerOTP"` table and make `email` nullable.

---

### 2. Services & Utilities

#### [NEW] [msg91.ts](file:///d:/AGOC/hope-master/src/lib/msg91.ts)
- Create helper functions:
  - `sendWhatsAppOTP(mobile: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>`:
    - Formats mobile with 91 prefix (removes spaces, symbols, leading 0 or 91).
    - Calls MSG91 Send OTP endpoint: `https://control.msg91.com/api/v5/otp` with `template_id`, `mobile`, `authkey`, `otp`.
    - Handles dev/mock fallback if credentials are unset or in test environments.
  - `retryWhatsAppOTP(mobile: string): Promise<{ success: boolean; error?: string }>`:
    - Calls MSG91 retry endpoint with `retrytype=whatsapp`.

#### [MODIFY] [email.ts](file:///d:/AGOC/hope-master/src/lib/email.ts)
- Remove `sendPartnerOTPEmail` completely.
- Clean up any email OTP references.

#### [MODIFY] [.env](file:///d:/AGOC/hope-master/.env)
- Add placeholders for:
  - `MSG91_AUTH_KEY=`
  - `MSG91_OTP_TEMPLATE_ID=`

---

### 3. API Routes

#### [MODIFY] [route.ts](file:///d:/AGOC/hope-master/src/app/api/partner/send-otp/route.ts)
- Accept `mobile` instead of requiring `email`.
- Check if partner exists with this mobile number.
- Generate 6-digit OTP, invalidate prior active OTPs for this mobile, store in `PartnerOTP`.
- Dispatch OTP via `sendWhatsAppOTP` in `src/lib/msg91.ts`.

#### [MODIFY] [route.ts](file:///d:/AGOC/hope-master/src/app/api/partner/verify-otp/route.ts)
- Accept `{ mobile, otp }`.
- Find latest active `PartnerOTP` record for `mobile`.
- Verify expiry (10 mins), attempts limit (5 max), and match.
- Mark as used and return a short-lived signed JWT `verificationToken` authorizing password setup.

#### [MODIFY] [route.ts](file:///d:/AGOC/hope-master/src/app/api/partner/set-password/route.ts)
- Accept `{ token, mobile, password, confirmPassword }`.
- Verify the verification JWT for `mobile` and partner ID.
- Hash password with SHA-256.
- Update partner password, set `status: "ACTIVE"`, credit welcome bonus (if first-time setup and per system config).
- Return success.

#### [MODIFY] [route.ts](file:///d:/AGOC/hope-master/src/app/api/partner/register/route.ts)
- Make `email` optional and `mobile` strictly required.
- Remove pre-registration OTP requirement from this route (since verification occurs on the dedicated verification page right after submission).
- Create the partner in `Partner` table (with `status: "PENDING"`, `password: null`).
- Associate `registeredByMarketingRepId` if registered by marketing rep.
- Remove email approval sending.
- Return `{ success: true, partnerCode: newPartner.partnerCode, mobile: newPartner.mobile }`.

#### [MODIFY] [route.ts](file:///d:/AGOC/hope-master/src/app/api/admin/partner/onboard/route.ts)
- Update validation: `email` is optional, `mobile` is required.
- Remove approval email sending.
- Create partner (status PENDING/ACTIVE, no password).
- Return `{ success: true, partnerCode: partner.partnerCode, mobile: partner.mobile }`.

---

### 4. Routing & Middleware

#### [MODIFY] [proxy.ts](file:///d:/AGOC/hope-master/src/proxy.ts)
- Add `/verify-partner` to public partner routes (`isPublicPartnerRoute`) so unauthenticated users can access it.
- Ensure `/api/partner/send-otp`, `/api/partner/verify-otp`, `/api/partner/set-password`, `/api/partner/register` remain in `isPublicApi`.

---

### 5. UI Panels & Pages

#### [NEW] [page.tsx](file:///d:/AGOC/hope-master/src/app/verify-partner/page.tsx)
- The **Single Partner Verification Page**:
  - Automatically reads `?mobile=...` from search params. If not provided or user wants to change, allows entering the registered 10-digit mobile number.
  - **Step 1: Request WhatsApp OTP**:
    - Displays partner phone number and verification notice.
    - Prominent **"Send WhatsApp OTP"** button with WhatsApp icon and loading spinner.
    - Calls `/api/partner/send-otp`.
  - **Step 2: Enter & Verify OTP**:
    - 6-digit PIN input with auto-advance, paste handler, and backspace navigation.
    - 60s countdown timer before allowing "Resend WhatsApp OTP".
    - "Verify OTP" button (and auto-submits on 6th digit).
    - Calls `/api/partner/verify-otp`.
  - **Step 3: Set Password & Confirm Password**:
    - New Password and Confirm Password inputs with visibility toggles.
    - Real-time password strength meter and validation (min 8 characters).
    - "Set Password & Complete Setup" button.
    - Calls `/api/partner/set-password`.
    - Celebratory success state with automatic redirect to `/login`.

#### [MODIFY] [page.tsx](file:///d:/AGOC/hope-master/src/app/(partner)/register/page.tsx)
- Remove the inline email OTP step and state.
- Make email optional (`email?: string`), mobile required.
- On form submit:
  - Validates fields.
  - Calls `/api/partner/register`.
  - Navigates immediately to `/verify-partner?mobile=${encodeURIComponent(formData.mobile)}`.

#### [MODIFY] [page.tsx](file:///d:/AGOC/hope-master/src/app/(marketing)/marketing/onboard/page.tsx)
- Remove the inline email OTP step from step 1.
- Make email optional, mobile required.
- Simplify stepper: Details -> Address -> Financials/UPI -> Review & Submit.
- On submit:
  - Calls `/api/partner/register`.
  - Navigates immediately to `/verify-partner?mobile=${encodeURIComponent(formData.mobile)}`.

#### [MODIFY] [page.tsx](file:///d:/AGOC/hope-master/src/app/(super-admin)/super-admin/partners/page.tsx)
- In "Onboard Partner" modal:
  - Mark email input as `(Optional)`.
  - Update validation so email is optional (only validate format if provided).
  - On submission:
    - Calls `/api/admin/partner/onboard`.
    - Closes modal, refreshes table, and navigates / redirects to `/verify-partner?mobile=${encodeURIComponent(newPartner.mobile)}`.

#### [MODIFY] [page.tsx](file:///d:/AGOC/hope-master/src/app/(cafe-admin)/admin/partners/page.tsx)
- Add **"Onboard Partner"** button in header.
- Add Onboard Partner modal with the exact same fields:
  - Partner Name, Contact Name, Mobile (Required), Email (Optional), Business Type, Address, City, Pincode, UPI ID.
  - On submission:
    - Calls `/api/admin/partner/onboard`.
    - Closes modal, refreshes table, and navigates to `/verify-partner?mobile=${encodeURIComponent(mobile)}`.

---

## Verification Plan

### Automated & Unit Tests
1. **Schema Check**:
   - Run DB migration/alter query to verify `"PartnerOTP"` table has `mobile` column and `email` is nullable.
2. **API Endpoint Testing**:
   - Test `/api/partner/register` with mobile only (without email) and verify partner is created in database.
   - Test `/api/partner/send-otp` with mobile and verify MSG91 WhatsApp OTP is triggered (mock or API).
   - Test `/api/partner/verify-otp` with the OTP and verify JWT `verificationToken` is returned.
   - Test `/api/partner/set-password` with token, mobile, and password, verify password is saved and partner status is `ACTIVE`.

### Manual & Flow Verification
1. **Public Register (`/register`)**:
   - Enter partner details without email, submit form.
   - Verify page automatically navigates to `/verify-partner?mobile=...`.
   - Complete Step 1 (Request WhatsApp OTP), Step 2 (Verify OTP), Step 3 (Set Password).
   - Verify redirect to `/login` and ability to log in with new credentials.
2. **Super Admin Onboard (`/super-admin/partners`)**:
   - Open Onboard Partner modal, fill in mobile and details (leave email empty), submit.
   - Verify navigation to `/verify-partner?mobile=...`.
3. **Marketing Member Onboard (`/marketing/onboard`)**:
   - Complete steps without email, submit.
   - Verify navigation to `/verify-partner?mobile=...`.
4. **Cafe Admin Onboard (`/admin/partners`)**:
   - Click "+ Onboard Partner", fill in details, submit.
   - Verify navigation to `/verify-partner?mobile=...`.
