# Walkthrough: Restructured Partner Onboarding Authorization (MSG91 WhatsApp OTP)

We have restructured the partner onboarding authorization flow across the entire HOPE Cafe Partner platform. Email OTP has been completely removed and replaced with MSG91 WhatsApp OTP, mobile number is strictly mandatory, email is optional, and all partner registration forms across all panels now unify into a single 3-step WhatsApp verification page.

---

## What Has Changed

### 1. Database & Schema Updates
- **`"PartnerOTP"` table**:
  - Added `mobile text` column in Neon PostgreSQL database.
  - Made `email` column nullable (`DROP NOT NULL`).
- **Prisma Schema** (`prisma/schema.prisma`):
  - Updated `PartnerOTP` model with `mobile String?` and `email String?`.
  - Updated `@prisma/client` schema.

---

### 2. Services & Integration
- **MSG91 WhatsApp OTP Service** (`src/lib/msg91.ts`):
  - Created `sendWhatsAppOTP(rawMobile, otp)`: Formats mobile into international Indian format (`91XXXXXXXXXX`) and calls MSG91's Send OTP API (`https://control.msg91.com/api/v5/otp`).
  - Added `retryWhatsAppOTP(rawMobile)`: Handles WhatsApp retry via MSG91.
  - Built-in graceful development & simulation mode: If `MSG91_OTP_TEMPLATE_ID` is not yet set in `.env`, it logs the OTP in the server console without crashing.
- **Email Service** (`src/lib/email.ts`):
  - Removed `sendPartnerOTPEmail` completely.
  - Replaced with `sendPasswordResetOTPEmail` for account recovery.
- **Environment Configuration** (`.env`):
  - Configured `MSG91_AUTHKEY`, `MSG91_WIDGET_ID`, `MSG91_WIDGET_TOKEN_AUTH`, and added `MSG91_OTP_TEMPLATE_ID=`.

---

### 3. API Routes

| Endpoint | Method | Key Changes |
| :--- | :--- | :--- |
| `/api/partner/send-otp` | `POST` | Accepts `mobile`, looks up partner, invalidates prior unused OTPs, generates 6-digit OTP, saves in `PartnerOTP`, and delivers via MSG91 WhatsApp OTP. |
| `/api/partner/verify-otp` | `POST` | Accepts `mobile` and `otp`, checks expiry, attempts (<5), and match in `PartnerOTP`, marks as used, and returns short-lived JWT `verificationToken`. |
| `/api/partner/set-password` | `POST` | Accepts `token`, `mobile`, `password`, `confirmPassword`. Validates token, hashes password, saves password, activates account (`status: "ACTIVE"`), and credits welcome bonus. |
| `/api/partner/register` | `POST` | Email is now optional, mobile is required (10 digits). Removed pre-registration OTP requirement. Saves partner as `PENDING` and returns `redirectUrl: /verify-partner?mobile=...`. |
| `/api/admin/partner/onboard` | `POST` | Email is optional, mobile is required. Removed approval email. Saves partner and returns `redirectUrl: /verify-partner?mobile=...`. |

---

### 4. Single Unified Partner Verification Page
- **Route**: [`/verify-partner`](file:///d:/AGOC/hope-master/src/app/verify-partner/page.tsx)
- Added to `src/proxy.ts` public partner routes.
- **Flow**:
  1. **Step 1: Request OTP**: Shows partner's mobile (+91 XXXXX XXXXX), button **"Request WhatsApp OTP"** (with WhatsApp branding & icon). Triggers `/api/partner/send-otp`.
  2. **Step 2: Enter & Verify OTP**: 6-digit auto-advancing, paste-friendly OTP boxes with 60s resend timer and "Verify & Continue" button. Triggers `/api/partner/verify-otp`.
  3. **Step 3: Set Password & Confirm Password**: Password & Confirm Password inputs with visibility toggles, strength meter, and validation. Triggers `/api/partner/set-password`.
  4. **Step 4: Activation & Redirection**: Confirms activation and automatically redirects to `/login`.

---

### 5. Unified Navigation Across All Panels

1. **Public / Volunteer Register Route** (`/register`):
   - Removed inline email OTP step.
   - Mobile is required; Email is marked as optional.
   - Form submission automatically redirects to `/verify-partner?mobile=${mobile}`.
2. **Super Admin Panel** (`/super-admin/partners`):
   - Onboard Partner modal updated with optional email and required mobile.
   - Submitting onboards the partner and navigates directly to `/verify-partner?mobile=${mobile}`.
3. **Marketing Member Panel** (`/marketing/onboard`):
   - Removed email OTP verification step from step 1.
   - Streamlined into 4 steps: Basic Details -> Location -> Settlement UPI -> Review.
   - Submitting onboards the partner and navigates directly to `/verify-partner?mobile=${mobile}`.
4. **Cafe Admin Panel** (`/admin/partners`):
   - Added **"+ Onboard Partner"** button and slide-over modal matching the super admin flow.
   - Submitting onboards the partner and navigates directly to `/verify-partner?mobile=${mobile}`.

---

## Verification Results

### Database & Queries Verification
```
=== Testing Partner WhatsApp Authorization Flow ===
1. Partner Creation without email... -> Partner created with status: PENDING, mobile: 9840012345, email: null
2. OTP Generation & Storage...       -> PartnerOTP created: mobile: 9840012345, otp: 654321, isUsed: false
3. OTP Verification query...          -> OTP successfully matched!
4. Setting Password & Activating...   -> Partner status: ACTIVE, password hashed
🎉 All verification flow tests PASSED!
```

### TypeScript Compilation Check
```
Running tsc --noEmit...
TSC passed with 0 errors!
```
