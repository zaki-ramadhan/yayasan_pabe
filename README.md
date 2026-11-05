# Digital Philanthropy & Crowdfunding Platform

A full-stack web application designed for a charitable foundation to manage fundraising, Zakat, donations, and field distributions. The platform provides a modern, responsive interface for donors and a comprehensive back-office dashboard for administrators, with automated transaction processing and email-based notifications.

---

## Pages & User Interface

### Public Pages
- **Home (`/`):** Features emergency disaster banners, live donation statistics, program categories, featured campaigns, a field distribution feed, and an urgent disaster modal alert.
- **About Us (`/tentang-kami`):** Foundation profile, vision, mission, organizational structure, official legal permits, and registered bank accounts.
- **Campaign Catalog (`/program`):** Complete list of fundraising programs with category filtering (Education, Orphan Care, Economic Empowerment, Disaster Relief) and keyword search.
- **Campaign Detail (`/campaign/[slug]`):** Program overview, fundraising progress bar, target vs. collected amounts, donor counts, field distribution updates, and verified donor prayers.
- **Donation Checkout (`/campaign/[slug]/donate`):** Single-page checkout with preset and custom amounts, donor identity form with an anonymous ("Hamba Allah") option, and payment channel selection.
- **Invoice & Instructions (`/invoice/[id]`):** Dedicated payment page with dynamic QRIS, Virtual Account numbers, one-click copy buttons, bank-specific payment guides, and a 24-hour expiration countdown.
- **Zakat Calculator (`/kalkulator-zakat`):** 5-in-1 interactive calculator (Income, Savings/Maal, Gold, Corporate, and Trade Zakat) with automated Nisab evaluation and a one-click checkout transfer button.
- **Routine Donation (`/donasi-rutin`):** Registration form for recurring contributions (daily, weekly, or monthly) with automated email notifications and payment links.
- **Audit Reports (`/laporan`):** Public financial statements audited by independent accounting firms (KAP) with WTP ratings and downloadable PDF reports.
- **Field Distribution Feed (`/distribusi`):** Public log of direct aid deliveries, recipient breakdowns, and photo documentation.
- **Articles & News (`/artikel` & `/artikel/[slug]`):** Educational articles, charity updates, and activity announcements.
- **Photo Gallery (`/galeri`):** Multimedia gallery showcasing humanitarian activities and program execution.
- **Careers (`/karier`):** Job openings with position requirements, responsibilities, and an online application form with resume upload.
- **Volunteer Registration (`/volunteer`):** Volunteer signup form capturing skills, interests, and regional availability.
- **Legal & Terms (`/legalitas` & `/ketentuan-transaksi`):** Institutional permits, operational licenses, and donation policy details.

### Donor Portal (`/donatur`)
- **Dashboard:** Overview of personal lifetime donations, active recurring commitments, and submitted prayers.
- **Donation History:** Detailed transaction log with payment statuses and downloadable receipts.
- **Routine Donations:** Management view to check, pause, or update scheduled giving commitments.
- **Profile & Security:** Personal data settings, avatar customization, and password updates.
- **Volunteer Card:** Member area displaying an interactive 3D volunteer lanyard card and printable credentials.

### Authentication Pages
- **Sign In (`/login`):** Email and password login with social login support (Google and Facebook).
- **Registration (`/register`):** Account creation with email activation verification.
- **Password Reset (`/reset-password`):** Secure token-based password reset delivered via email.

### Admin Dashboard (`/admin`)
- **Dashboard Overview:** Key metrics on total funds raised, daily/monthly donation charts, and recent transactions.
- **Campaign Management:** Create, edit, and manage fundraising campaigns, target amounts, and banner images.
- **Distribution Management:** Record field disbursements, attach activity photos, and track aid delivery.
- **Transaction Ledger:** Monitor incoming payments, verify manual transfers, and export transaction records to CSV.
- **Routine Donation Supervision:** Track active recurring schedules and check automated email delivery logs.
- **Content Administration:** Manage articles, FAQ entries, photo galleries, and Instagram post embeds.
- **Beneficiary & Volunteer Management:** Maintain records of program beneficiaries, job applicants, and registered volunteers.
- **Organization Settings:** Configure foundation profiles, office contacts, bank account details, and gold price benchmarks.
- **Storage & System Health:** Cloud object storage usage overview and system status alerts.
- **User Roles & Audit Logs:** Role-based access control (Super Admin, Admin, Finance, Staff) and system activity logs.

---

## Core Features

- **End-to-End Crowdfunding:** Structured fundraising categories, real-time target tracking, and photo-documented distribution updates.
- **Streamlined Checkout:** Single-page payment flow with preset amount chips, custom inputs with thousand separators, and privacy toggles.
- **Integrated Payment Methods:**
  - Automated Virtual Accounts (BCA, Mandiri, BSI, BRI).
  - Dynamic QRIS for instant mobile scanning.
  - Official bank transfers with automated 3-digit verification codes.
- **Automated Email Communications:** Entirely email-driven system for donation invoices, payment confirmations, password resets, account activations, and scheduled recurring donation reminders.
- **Interactive Zakat Calculation:** Automatic calculation based on official Nisab benchmarks across 5 asset types, enabling immediate payment handoff.
- **Scheduled Recurring Giving:** Recurring donation scheduler allowing donors to automate their giving commitments on daily, weekly, or monthly intervals via email alerts.
- **Donor Community Engagement:** Public donor prayer board with community "Aamiin" reactions.
- **Public Transparency:** Access to certified annual audit reports (PDF), direct aid delivery feeds, and official foundation legal documents.
- **Interactive 3D Visuals:** Web-based 3D volunteer badge simulation built with Three.js.
- **Role-Based Administration:** Back-office permissions separating administrative, financial, and content management tasks, backed by activity logs.

---

## Technology Stack

| Category | Tools & Libraries |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19 |
| **Styling & Components** | Tailwind CSS v4, Radix UI Primitives, Lucide React (Icons), Sonner (Toasts) |
| **3D & Charts** | Three.js (3D badge), Recharts (financial graphs), QRCode.react |
| **Backend & API** | Next.js Route Handlers (Server Components & modular service layer) |
| **Database & ORM** | PostgreSQL, Prisma ORM 7 |
| **Media & Storage** | Cloudflare R2 / AWS S3 SDK (`@aws-sdk/client-s3`), Sharp (image processing) |
| **Payment Gateway** | Midtrans (Virtual Account, Dynamic QRIS, Bank Transfer) |
| **Email Service** | Resend (Transactional emails, receipts, reminders, and auth verification) |
| **Authentication** | Custom session authentication, Google OAuth 2.0, Facebook Login |
| **Testing** | Vitest (Unit & Integration tests), Playwright (End-to-End tests) |
| **Package Manager** | pnpm |

---

## Project Structure

```text
├── prisma/                      # Database schema and seed scripts
├── public/                      # Static assets, branding, and images
├── src/
│   ├── app/
│   │   ├── (admin)/admin/       # Administrative dashboard routes
│   │   ├── (auth)/              # Authentication and recovery routes
│   │   ├── (donor)/donatur/     # Donor portal and user account routes
│   │   ├── (invoice)/invoice/   # Dynamic invoice and payment instruction routes
│   │   ├── (public)/            # Public pages (home, campaigns, zakat, reports, careers)
│   │   └── api/                 # API route handlers and cron triggers
│   ├── components/              # Modular UI components grouped by feature
│   ├── lib/                     # Database client, formatters, storage, and utility helpers
│   ├── services/                # Business logic, database queries, and external integrations
│   └── templates/emails/        # Transactional email templates
└── tests/                       # Unit, integration, and E2E test suites
```

---

## Getting Started

### 1. Prerequisites
- Node.js 20 or later
- pnpm (or npm)
- PostgreSQL database

### 2. Setup Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```
Provide the required environment variables:
- `DATABASE_URL`: PostgreSQL connection string.
- `NEXT_PUBLIC_APP_URL`: Base application URL.
- `MIDTRANS_SERVER_KEY` & `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`: Payment gateway keys.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`: Cloudflare R2 storage credentials.
- `RESEND_API_KEY`: Email service API key.

### 3. Install & Initialize
Install dependencies and sync the database:
```bash
pnpm install
pnpm postinstall
pnpm db:seed
```

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Run Tests
```bash
# Unit & integration tests
pnpm test

# End-to-end tests
pnpm test:e2e
```

---

## License

This repository is maintained for internal organization and portfolio reference. All rights reserved.
