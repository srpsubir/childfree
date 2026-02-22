# 🧠 Project Memory: Kindred (V2.1)

## 🎯 Product Vision

Kindred is a high-integrity, childfree community platform designed as a **"Certainty Archive"**—a tool for women to find partners and community without the risk of "the bait-and-switch."

- **Core Strategy:** Women-first marketplace. Build the "Sanctuary of Certainty" for women; men follow for the high-value community.
- **Model:** Timeleft-style curated dinner tables. Users are matched into 6-person tables at real-world events based on compatibility scoring.
- **Aesthetic:** "The Gallery." Minimalist, high-end editorial. Sharp 0px corners, Charcoal & Champagne palette.

---

## 🏗️ Onboarding Flow (8 Screens)

| # | Screen | Key Mechanic |
|---|--------|-------------|
| 1 | **Landing** | 3-second hold-to-enter (SVG ring progress) |
| 2 | **Why** | Choose reason: Design · Realisation · Priority |
| 3 | **Pillar** | Choose pillar: Truth · Autonomy · Legacy |
| 4 | **Filter** | Select ≥2 of 8 aversions/tolerances |
| 5 | **Stack** | Rank top 3 of 5 values (shapes table assignment) |
| 6 | **Auth** | Google OAuth via Lovable Cloud |
| 7 | **Pulse** | 7.5s integrity pulse, 3 phases: "Reading your signal" → "Finding your people" → "Preparing your Table" |
| 8 | **Outcome** | Dynamic event card from DB, Google Calendar link, navigation to Account |

**Returning Users:** `Index.tsx` checks for existing profile on load. If `why` field exists, skips directly to Outcome screen.

---

## 🛠️ Design System ("The Gallery")

### Typography
- **Headers:** `Playfair Display` (serif) → `font-display`
- **Body:** `Inter` (sans-serif) → `font-body`

### Colors (HSL in `:root`)
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `0 0% 7.1%` | Deep Charcoal (#121212) |
| `--foreground` | `240 4.8% 95.9%` | Off-White (#F5F5F7) |
| `--primary` | `38 60% 88%` | Champagne Gold (#F7E7CE) |
| `--primary-foreground` | `0 0% 7.1%` | Dark text on gold |
| `--muted` | `0 0% 14.9%` | Subtle dark surface |
| `--accent` | `0 0% 14.9%` | Interactive highlight |

### Corners
`--radius: 0px` — dead sharp, no rounding.

### CSS Utility Classes
- `.gallery-heading` — Playfair Display, tracking-tight
- `.gallery-body` — Inter, leading-relaxed
- `.gallery-label` — Inter, uppercase, letter-spacing 0.12em, text-xs

### Animations
- `animate-fade-up` / `animate-fade-up-delay` / `animate-fade-up-delay-2` — staggered entrance
- `animate-text-reveal` — clip-path text reveal
- `.screen-fade` — screen transition fade-in
- `integrity-pulse` / `integrity-ring` — Pulse screen heartbeat effect

---

## 🗄️ Database Schema

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User onboarding data | `user_id`, `handle`, `why`, `pillar`, `filters[]`, `stack[]`, `table_id`, `email`, `phone` |
| `tables` | Curated dinner groups | `name`, `city`, `max_seats` (6), `status`, `event_id` |
| `events` | Real-world dinners | `title`, `date`, `venue`, `address`, `city`, `maps_link`, `max_seats`, `status` |
| `invitations` | User ↔ Event link | `user_id`, `event_id`, `status` (pending/confirmed/declined) |
| `otp_codes` | Phone verification | `phone`, `code_hash`, `expires_at`, `verified` |
| `user_roles` | RBAC | `user_id`, `role` (admin/moderator/user) |

### Key Relationships
- `profiles.table_id` → `tables.id`
- `tables.event_id` → `events.id`
- `invitations.event_id` → `events.id`

### RLS Summary
- Profiles: users read/update own; admins read all; no delete
- Events: public read; admin-only write
- Invitations: users read/update own; admin insert/delete
- Tables: public read; no public write
- User roles: self or admin read; no public write

---

## ⚡ Backend Functions (Edge)

| Function | Purpose |
|----------|---------|
| `assign-tables` | Clusters unassigned profiles into 6-person tables by compatibility score. Accepts optional `event_id` to auto-generate invitations. |
| `compute-matches` | Scores a user against all other profiles (weighted: filter 0.4, stack 0.3, why 0.2, pillar 0.1). Returns top 20. |
| `send-otp` | Sends SMS OTP via Twilio Verify |
| `verify-otp` | Verifies SMS OTP via Twilio Verify |
| `send-welcome-email` | Sends "seat confirmed" email via Resend with calendar link |

---

## 🗺️ Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Index.tsx` | Onboarding flow (8 screens) + returning user detection |
| `/account` | `Account.tsx` | View invitations, confirm/decline, add to calendar |
| `/admin` | `Admin.tsx` | View all profiles, trigger table assignment (admin-gated) |

---

## 📜 Changelog

### [2026-02-22] — V2.1: Table Context & Multi-Event
- **ADDED:** `events` and `invitations` tables with RLS
- **ADDED:** `/account` page for invitation management
- **ADDED:** Dynamic event card on Outcome screen (fetches from DB)
- **ADDED:** Google Calendar integration on Outcome + Account
- **ADDED:** Back buttons on all onboarding steps
- **ADDED:** Returning user detection (skip to Outcome if profile exists)
- **REFINED:** StackScreen footer hint: "Your answers shape the table you'll be seated at"
- **REFINED:** PulseScreen phases: signal → people → table
- **REFINED:** AuthGate copy for six-person dinner context
- **UPDATED:** `assign-tables` supports `event_id` and auto-creates invitations

### [2026-02-21] — V2 Rebirth: "The Certainty Archive"
- **SCRAPPED:** All "Sanctuary" branding and generic dating app features
- **ADDED:** The Pledge Screen (3s hold-to-enter)
- **ADDED:** The Audit (IG handle as lifestyle verification)
- **REFINED:** Tone from "Grindset/Empire" to "Architects/Visionaries"
- **REFINED:** Design to "The Gallery" — 0px corners, champagne accents, charcoal backgrounds
- **REMOVED:** Status-based vetting scores (simplified to "Vetted" on Pulse completion)

---

## 📍 Current Status: V2.1 Live

- Full onboarding flow operational
- Google OAuth authentication active
- Database seeded with "The Berlin Table" event
- Admin panel functional for table assignment
- **Next:** Mobile viewport polish, admin event selection, email notifications for new invitations
