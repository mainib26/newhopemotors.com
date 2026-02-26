# New Hope Motors — Product Design & Requirements

**Date:** 2026-02-26
**Status:** Approved
**Business:** New Hope Motors, 3343 FM1827, McKinney, TX 75071

---

## 1. Overview

A modern, warm, conversion-focused website for New Hope Motors — an independent used car dealership in McKinney, Texas. The site pulls inventory from DealerCenter via FTP/SFTP feed, manages leads and appointments internally, and pushes leads back to DealerCenter in ADF/XML format. An AI chatbot ("Hope") handles 24/7 visitor engagement.

### Goals
- Replace the broken existing site with a fast, beautiful, SEO-optimized storefront
- Automate inventory sync with DealerCenter (manual fallback for day 1)
- Capture and manage leads with a Payload CMS-style admin panel
- Serve the affluent McKinney/Collin County market (median HHI $120K)

### Success Criteria
- Sub-2s LCP, 95+ PageSpeed score
- Lead capture on every page (forms + chatbot)
- Inventory live and searchable within 24 hours of launch
- Admin panel usable by 2-3 non-technical staff

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| Image Storage | Supabase Storage (upgrade to Cloudinary later) |
| Hosting | Cloudflare Pages + Workers |
| AI Chatbot | Claude API (Haiku) |
| Dev Flow | Local first, then push to production |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    CLOUDFLARE                              │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              SvelteKit App                             │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  │ │
│  │  │  Public Site  │  │  Admin UI  │  │  API Routes  │  │ │
│  │  │  /            │  │  /admin    │  │  /api         │  │ │
│  │  │  /inventory   │  │  /admin/*  │  │  /api/leads   │  │ │
│  │  │  /vehicle/*   │  │            │  │  /api/inventory│  │ │
│  │  │  /contact     │  │  Dashboard │  │  /api/chat    │  │ │
│  │  │  /finance     │  │  Vehicles  │  │  /api/cron/*  │  │ │
│  │  │               │  │  Leads     │  │               │  │ │
│  │  │  AI Chatbot   │  │  Calendar  │  │               │  │ │
│  │  │  Widget       │  │  Users     │  │               │  │ │
│  │  └──────────────┘  └────────────┘  └──────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Cloudflare Cron Triggers                                  │
│  - Inventory sync from DealerCenter (hourly)               │
│  - Lead push ADF/XML to DealerCenter (every 5 min)         │
│  - Stale lead alerts (daily)                               │
│  - Appointment reminders (24hr + 1hr before)               │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
  ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────────┐
  │ PostgreSQL  │ │  Supabase   │ │  DealerCenter   │
  │ (local dev, │ │  Storage    │ │  (FTP/SFTP)     │
  │  cloud prod)│ │  (photos)   │ │                 │
  │             │ │             │ │  Feed IN  ───►  │
  │             │ │             │ │  Leads OUT ◄──  │
  └─────────────┘ └─────────────┘ └─────────────────┘
```

---

## 4. Data Model

### Vehicle
- `id`, `vin` (unique), `stockNumber`
- `year`, `make`, `model`, `trim`
- `bodyType` (SEDAN | SUV | TRUCK | WAGON | COUPE | VAN)
- `exteriorColor`, `interiorColor`
- `mileage`, `engine`, `transmission`, `drivetrain`
- `price`, `internetPrice`, `bookValue`, `monthlyPaymentEstimate`
- `condition` (EXCELLENT | GOOD | FAIR)
- `status` (ACTIVE | INCOMING | IN_RECON | SOLD | DELETED)
- `description`, `features` (JSON array)
- `carfaxUrl`, `autoCheckUrl`
- `dealerCenterId` (for sync matching)
- `createdAt`, `updatedAt`, `soldAt`

### VehiclePhoto
- `id`, `vehicleId` (FK)
- `url`, `supabasePath`
- `sortOrder`, `isPrimary`
- `alt`

### Lead
- `id`, `firstName`, `lastName`
- `email`, `phone`
- `source` (WEBSITE | CHAT | PHONE | WALKIN | CARGURUS | FACEBOOK)
- `status` (NEW | CONTACTED | APPOINTMENT_SET | SHOWED | SOLD | LOST)
- `assignedTo` (FK -> User)
- `vehicleInterest` (FK -> Vehicle, optional)
- `adfPushed` (boolean), `adfPushedAt`
- `createdAt`, `updatedAt`

### LeadNote
- `id`, `leadId` (FK), `authorId` (FK -> User)
- `content`, `createdAt`

### Appointment
- `id`, `leadId` (FK), `vehicleId` (FK, optional)
- `type` (TEST_DRIVE | CONSULTATION | FINANCE_REVIEW)
- `date`, `startTime`, `endTime`
- `status` (SCHEDULED | CONFIRMED | COMPLETED | NO_SHOW | CANCELLED)
- `reminderSentAt`, `createdAt`

### FinanceApplication
- `id`, `leadId` (FK)
- `firstName`, `lastName`, `email`, `phone`
- `dateOfBirth`, `ssn` (encrypted AES-256)
- `employmentStatus`, `monthlyIncome`
- `housingStatus`, `monthlyHousingPayment`
- `vehicleInterest` (FK -> Vehicle, optional)
- `status` (SUBMITTED | UNDER_REVIEW | APPROVED | DENIED)
- `createdAt`

### User
- `id`, `email`, `name`
- `role` (ADMIN | SALES | VIEWER)
- `passwordHash`, `avatar`, `isActive`
- `createdAt`, `lastLoginAt`

### Page
- `id`, `slug`, `title`, `content` (rich text)
- `metaTitle`, `metaDescription`, `publishedAt`

### ChatConversation
- `id`, `sessionId`, `leadId` (FK, optional)
- `createdAt`

### ChatMessage
- `id`, `conversationId` (FK)
- `role` (USER | ASSISTANT)
- `content`, `createdAt`

---

## 5. Public Site — Pages & UX

### Visitor Journey
```
Landing (/) → Inventory (/inventory) → Vehicle Detail (/vehicle/[vin])
                                              │
                                    ┌─────────┼─────────┐
                                    ▼         ▼         ▼
                              Test Drive   Contact   Pre-Approve
                              (modal)      (modal)   (/finance)
```

### Pages
1. **Homepage (/)** — Hero + search bar, quick body-type filters, featured vehicles (6 cards), trust pillars (100% Inspected, Fair Pricing, Personal Service), payment calculator, Google reviews, "Meet Daniel" section, contact/map, footer
2. **Inventory (/inventory)** — Faceted filters (make, model, year, price, mileage, body type), sort (price, mileage, newest), vehicle cards (photo, year/make/model, price, monthly estimate, mileage), pagination
3. **Vehicle Detail (/vehicle/[vin])** — Photo gallery (lightbox/swipe), price + monthly calculator, specs/features/condition, history badge, CTAs (Schedule Test Drive, Make Offer, Ask Question), similar vehicles
4. **Finance (/finance)** — Payment calculator, pre-qualification form (multi-step), FAQ accordion
5. **About (/about)** — Daniel's story, team photos, values, Google reviews, "Why New Hope Motors"
6. **Contact (/contact)** — Form (name, phone, email, message), Google Maps, hours/address/phone, directions from nearby cities

### AI Chatbot Widget (every page)
- Name: "Hope"
- Quick replies: Browse Inventory, Schedule Test Drive, Financing Options, Talk to Daniel's Team
- Capabilities: search inventory, capture leads, schedule appointments
- Claude Haiku, capped at 50 messages/session
- After-hours: captures contact info, confirms next-day callback

### Lead Capture
- All forms: 3 fields max (name, phone, email)
- Vehicle context auto-attached
- Submit → save Lead → notify salesperson → queue ADF push

---

## 6. Design System — Warm & Approachable

| Element | Value |
|---|---|
| Background | Warm white #FAFAF7 with cream sections |
| Primary | Deep forest green #2D5F3E |
| Accent | Warm amber #D4943A |
| Text | Charcoal #2A2A2A (light bg), warm white (dark bg) |
| Headings | Plus Jakarta Sans |
| Body | Inter |
| Border radius | 12px cards, 8px buttons |
| Tone | "We're your neighbor, not a sales floor" |

---

## 7. Admin Panel — Payload CMS-Style in Svelte

### Layout
- Collapsible sidebar: Dashboard, Vehicles, Leads, Appointments, Finance, Chat Logs, Pages, Settings
- Header: global search, notifications bell, profile dropdown

### Views
- **Dashboard** — stat cards (inventory count, new leads, today's appointments, monthly sold), lead pipeline (NEW → CONTACTED → APPT SET → SHOWED → SOLD), recent activity feed, inventory health alerts
- **Vehicles** — table with filters/sort/bulk actions, detail view with photo manager (drag-reorder, set primary), VIN decode for manual entry, sync status indicator
- **Leads** — table + kanban toggle, detail view with notes/history/chat transcript, quick actions (call, SMS, email, schedule), lead assignment (manual or round-robin)
- **Appointments** — calendar (week/day) + list view, SMS reminder triggers
- **Finance Applications** — review queue, SSN masked in display
- **Chat Logs** — conversation list, full transcript, "Convert to Lead" action
- **Pages** — rich text editor (Tiptap), SEO fields
- **Settings** — dealership info, DealerCenter sync config, user management, notifications

### Role-Based Access

| Feature | Admin | Sales | Viewer |
|---|---|---|---|
| Dashboard | Full | Own leads | Read only |
| Vehicles | CRUD + sync | Read | Read |
| Leads | All + assign | Own assigned | Read |
| Appointments | All | Own leads | Read |
| Finance Apps | All | None | None |
| Pages/Settings | Full | None | None |
| Users | Manage | None | None |

---

## 8. DealerCenter Integration

### Inventory Sync (Inbound)
- Cloudflare Cron (hourly) → FTP/SFTP download → parse CSV/XML → match on VIN/dealerCenterId
- New vehicle → INSERT (status=ACTIVE)
- Existing vehicle → UPDATE changed fields
- Missing from feed → mark SOLD (never delete)
- Photos downloaded → uploaded to Supabase Storage
- Errors logged, admin alerted if threshold exceeded

### Lead Push (Outbound)
- Cloudflare Cron (every 5 min) → query leads where adfPushed=false → format as ADF/XML → upload to DealerCenter SFTP
- Mark adfPushed=true on success
- Retry up to 3x on failure, then flag for manual review

### Day 1 (Before Feed Setup)
- Manual vehicle entry via admin (VIN decode auto-fills)
- Manual photo upload (drag-and-drop)
- Leads captured and stored, ADF push disabled until SFTP credentials configured
- Toggle in Settings: DealerCenter Sync Enabled/Disabled

---

## 9. SEO & Performance

### Schema.org Markup
- Vehicle pages: @type Vehicle
- Homepage/Contact: @type AutoDealer + LocalBusiness
- Reviews: @type AggregateRating
- FAQ: @type FAQPage

### URL Structure
- `/inventory`, `/inventory/suv`, `/inventory/toyota`
- `/vehicle/2022-toyota-tundra-sr5-[vin]`
- `/finance`, `/about`, `/contact`

### Local SEO (Phase 2)
- Landing pages: /used-cars-mckinney-tx, /used-trucks-mckinney-tx, /used-cars-frisco-tx, /used-cars-allen-tx, /used-cars-plano-tx

### Auto-Generated
- XML sitemap (updates on inventory change)
- robots.txt
- og:image per vehicle
- Canonical URLs

### Sold Vehicle Handling
- VDP stays 30 days with "Sold" banner + similar vehicle recommendations
- After 30 days → 301 redirect to /inventory

### Core Web Vitals Targets
| Metric | Target |
|---|---|
| LCP | < 2.0s |
| FID | < 50ms |
| CLS | < 0.05 |

---

## 10. Texas Compliance

### Required Disclosures
- Dealer license number (footer)
- Physical address and hours
- "Prices exclude tax, title, license & dealer doc fee ($150)"
- As-Is / warranty status per vehicle (on VDP)
- Finance disclaimer on payment estimates

### Finance Application Security
- SSN encrypted at rest (AES-256, Prisma middleware)
- HTTPS enforced (Cloudflare)
- Finance form with CSP headers
- SSN never displayed back, masked in admin

### Privacy
- Privacy Policy page
- Cookie consent banner (CCPA)
- Chat data retention policy disclosed

---

## 11. Phases

### Phase 1 (MVP)
- SvelteKit project setup + Tailwind + Prisma + PostgreSQL
- Public site: all 6 pages + chatbot widget
- Admin panel: all views (dashboard, vehicles, leads, appointments, finance, pages, settings)
- DealerCenter: manual inventory management + ADF push when ready
- Auth: role-based (admin, sales, viewer)
- SEO: schema markup, sitemaps, clean URLs
- Deploy: Cloudflare Pages

### Phase 2
- DealerCenter FTP/SFTP inventory sync (automated)
- Trade-in value estimator
- Financing pre-qualification (lender partner integration)
- Local SEO landing pages
- Saved searches with email alerts
- Blog/content section
- Google Business Profile deep integration
