# Study Roadmap: Full Stack Breakdown

This is your prioritized roadmap to mastering this Next.js project. We have successfully categorized all 36 `.tsx` React components and 20 `route.ts` Express-style endpoints into distinct "Features". 

Read this in order from top to bottom. Start your study session by opening the files in Feature 1!

---

## Priority 1: Authentication & Onboarding
**Focus:** How users get into the system and how sessions are managed.

**Backend API Endpoints (`route.ts`)**
1.  `src/app/api/auth/login/route.ts` (Handles `POST`: Validates credentials and sets JWT cookies)
2.  `src/app/api/partner/register/route.ts` (Handles `POST`: Inserts new Partner into SQLite)

**Frontend Component Pages (`page.tsx`)**
1.  `src/app/(partner)/login/page.tsx` (React form for Partner login)
2.  `src/app/(partner)/register/page.tsx` (React form for Partner sign-up)
3.  `src/app/(admin)/admin/login/page.tsx` (React form for Admin login)

---

## Priority 2: The Core Mechanic (Guest Registration & QR Code)
**Focus:** How a partner refers a guest, and how that guest receives their digital QR pass.

**Backend API Endpoints**
1.  `src/app/api/guest/register/route.ts` (Handles `POST`: Registers guest and generates DB Secret)
2.  `src/app/api/guest/lookup/route.ts` (Handles `GET`: Searches for existing guests)
3.  `src/app/api/whatsapp/send/route.ts` (Handles `POST`: Triggers a message to the guest with their pass link)
4.  `src/app/api/guest/[guestId]/route.ts` (Handles `GET`: Fetches guest data for the pass view)
5.  `src/app/api/guest/[guestId]/qr/route.ts` (Handles `GET`: Specifically serves the QR generation data)

**Frontend Component Pages**
1.  `src/app/(partner)/referrals/page.tsx` (Dashboard page where Partner inputs guest details)
2.  `src/app/pass/[guestId]/page.tsx` (Very important! The public React component the Guest opens on their phone to see the QR code)

---

## Priority 3: The Admin Mechanic (Scanning & Processing)
**Focus:** How the cafe/venue scans the guest and records money.

**Backend API Endpoints**
1.  `src/app/api/admin/verify-qr/route.ts` (Handles `POST`: Receives scanned QR data, validates expiration and secret)
2.  `src/app/api/admin/incoming/route.ts` (Handles `POST`: Processes the final bill, calculates discount, deposits commission)

**Frontend Component Pages**
1.  `src/app/(admin)/admin/scan/page.tsx` (React component housing the camera scanner UI)
2.  `src/app/(partner)/scan/page.tsx` (Secondary scan layout for specific partner types)

---

## Priority 4: Partner Dashboard & Tracking
**Focus:** What the partner sees to track their money and metrics.

**Backend API Endpoints**
1.  `src/app/api/partner/details/route.ts` (Handles `GET`: Fetch partner DB profile)
2.  `src/app/api/partner/stats/route.ts` (Handles `GET`: Fetch wallet balance and total scan count)
3.  `src/app/api/partner/[id]/commission/route.ts` (Handles `GET`: Check their current tier percentage)

**Frontend Component Pages**
1.  `src/app/(partner)/dashboard/page.tsx` (Main layout)
2.  `src/app/(partner)/transactions/page.tsx` (Ledger of incoming money)
3.  `src/app/(partner)/settings/page.tsx` & `support/page.tsx` (Preferences and help)

**Frontend Reusable Modules**
1.  `src/components/EarningsCalculator.tsx` (Interactive calculator)
2.  `src/components/MilestoneTracker.tsx` (UI for showing tiers)
3.  `src/components/PerformanceInsights.tsx` (UI for graphs)

---

## Priority 5: Admin Management & Payouts 
**Focus:** How admins review the system, modify tiers, and send real money to partners.

**Backend API Endpoints**
1.  `src/app/api/admin/stats/route.ts` & `logs/route.ts` (Handles `GET`: Fetch massive company-wide data)
2.  `src/app/api/admin/partners/route.ts` & `search/route.ts` (Handles `GET`: List all partners)
3.  `src/app/api/admin/partner/[id]/status/route.ts` (Handles `PUT`: Approve/Reject partner)
4.  `src/app/api/admin/partner/[id]/commission/route.ts` (Handles `PUT`: Change a partner's slab rate)
5.  `src/app/api/admin/payouts/run/route.ts` (Handles `POST`: Deducts DB wallet entirely to simulate sending bank transfer)

**Frontend Component Pages**
1.  `src/app/(admin)/admin/dashboard/page.tsx` 
2.  `src/app/(admin)/admin/partners/page.tsx` (Table of partners)
3.  `src/app/(admin)/admin/slabs/page.tsx` (Forms to edit rate % levels)
4.  `src/app/(admin)/admin/payouts/page.tsx` (List of pending bank transfers)
5.  `src/components/GlobalSearch.tsx` (The Navbar search bar module)

---

## Priority 6: Marketing & Public Interface
**Focus:** The landing pages used to attract new partners.

**Backend API Endpoints**
1.  `src/app/api/marketing/stats/route.ts` (Handles `GET`: Exposes public stats for the landing page)

**Frontend Component Pages**
1.  `src/app/page.tsx` (The absolutely main domain page `www.site.com/`)
2.  `src/app/(marketing)/marketing/dashboard/page.tsx`, `login/page.tsx`, `onboard/page.tsx` 
3.  `src/app/p/[partnerId]/page.tsx` (Potentially a referral link structure)

---

## Priority 7: Shared Architecture Components (Do these last!)
**Focus:** These are wrappers and reusable generic buttons across the whole app.

**Frontend Wrapper Files**
1.  `src/app/layout.tsx` (The master HTML wrapper for Next.js)
2.  `src/app/(admin)/layout.tsx`, `src/app/(partner)/layout.tsx`, `src/app/(marketing)/layout.tsx` (These render the sidebars! If you want to change the sidebar, look here.)
3.  `src/components/Header.tsx`, `src/components/LayoutWrapper.tsx`

**Atomic UI Modules**
*Located in `src/components/ui/`*
*   `Button.tsx`
*   `Card.tsx`
*   `Input.tsx`
*   `Skeleton.tsx` (Loading state visual)
*   `StatusBadge.tsx`
