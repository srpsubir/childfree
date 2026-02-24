# Kindred — UX Flow Summary

## Overview

Kindred is an invitation-only, curated matchmaking experience for people who are childfree by conviction. The UX is designed to feel like an editorial publication — spare, intentional, high-trust. Every screen earns the next one.

---

## User Journeys

### 1. New User — Onboarding to Seat Confirmation

```
Landing → Why → Pillar → Filter → Stack → Auth → Verify → Pulse → Outcome
```

Each step builds a conviction profile before revealing any social context. Users do not browse, swipe, or search — they declare, then receive.

---

#### Landing

**Hold to Enter** interaction (3 second hold). Forces intentionality from the first gesture. No passive scrolling in.

---

#### Profiling (Steps 1–4)

| Step | Screen | Question | Selection Mode | Min Required |
|------|--------|----------|---------------|--------------|
| 1/4 | **Why** | Why are you childfree? | Single | 1 |
| 2/4 | **Pillar** | Define your lifestyle pillar | Single | 1 |
| 3/4 | **Filter** | What you refuse to tolerate | Multi-select | 2 |
| 4/4 | **Stack** | Rank what matters most | Ordered (top 3) | 3 |

**Why options:** By Design · By Realisation · By Priority
**Pillar options:** Truth · Autonomy · Legacy
**Filter options:** 8 boundary statements (social, relational, professional)
**Stack options:** Freedom · Financial Independence · Solitude · Mobility · Purpose

---

#### Auth

Google OAuth only. Positioned after the profiling is complete so users are already invested before being asked for credentials.

---

#### Verify

Selfie upload → AI face detection (`verify-identity` edge function). Framing: "Prove You're Real." This is about trust establishment, not surveillance. States: idle → uploading → verifying → success/error.

---

#### Pulse

Three-phase animated loading screen (pulsing concentric rings). Runs `compute-matches` in the background. Duration: ~7.5s with progressive messages:

1. "Reading your signal..."
2. "Finding your people..."
3. "Preparing your Table..."

---

#### Outcome

Seat confirmation screen. Shows:
- Status badges: **Seat Confirmed** + **Identity Verified**
- Event card with date, time, venue, Google Maps link
- Match count (if available) or "Your table is being assembled"
- Add to Google Calendar CTA
- Link to My Tables (`/account`)

---

### 2. Returning User

```
Landing → Outcome (direct)
```

If the user is authenticated and verified, the onboarding flow is skipped entirely. They land on their seat confirmation.

---

### 3. Account — Post-Invitation Management (`/account`)

```
/account
  ├── Upcoming Events
  │     ├── Pending: Confirm / Decline
  │     └── Confirmed: Add to Calendar
  └── Past Events
        ├── Connect → MutualConnectDialog
        └── Report → SafetyReportDialog
```

#### Upcoming Events

Each invitation card shows event details. Users can confirm or decline. Confirmed invitations show an "Add to Calendar" button.

#### Past Events

After attending, each event card reveals two social interactions:

**Connect** — Opens MutualConnectDialog. Shows all tablemates (people at the same assigned table). For each:
- **Not connected:** "Connect" button sends a connect request
- **Pending:** "Requested" badge (awaiting their response)
- **Mutual:** Handle + email revealed. "Mutual ✓" badge

Emails and handles are only revealed when both parties have connected. Requests cannot be withdrawn. This is stated upfront.

**Report an Issue** — Opens SafetyReportDialog (3-step flow):
1. Select tablemate (dropdown, pre-filters already-reported)
2. Select category: Harassment · Misrepresentation · Boundary Violation · Other
3. Optional description (500 char limit)

On submit, creates a `safety_reports` record. Description field is optional to reduce barrier to reporting.

---

### 4. Admin — Event Operations (`/admin`)

Access restricted by `user_roles` table (role = "admin").

**Table Assignment**
- Select event from dropdown
- "Assign Tables" runs the `assign-tables` edge function
- Result: tables created, profiles assigned, invitations sent
- Profiles table updates with assigned Table IDs

**Safety Report Review**
- All reports listed with: reporter, reported user, event, category, description, status, date
- Status: `pending` (default) → `reviewed` or `dismissed`
- Action buttons on pending reports only

---

## Screen States Reference

### Onboarding

| Screen | States |
|--------|--------|
| Landing | idle → holding (progress fill) → complete |
| Why / Pillar | unselected → selected |
| Filter | multi-toggle (min 2 to unlock Continue) |
| Stack | unranked → ranked 1, 2, 3 (exactly 3 to unlock Continue) |
| Auth | idle → loading → redirected |
| Verify | idle → uploading → verifying → success / error (retake) |
| Pulse | phase 0 → 1 → 2 (timed, 2.5s per phase) |
| Outcome | loading → confirmed |

### Account

| Section | States |
|---------|--------|
| Invitations | pending · confirmed · declined |
| Connect dialog | not_requested · pending · mutual |
| Report dialog | step 1 → 2 → 3 → submitted |

---

## Design Language

**Typography**
- Display / headings: Playfair Display (serif)
- Body / labels: Inter (sans-serif)

**Colour**
- Background: near-black
- Foreground: off-white
- Accent: warm gold (HSL 36 71% 88%)

**Motion**
- Screen transitions: `screen-fade` (opacity + slight translate)
- Element entrance: `animate-fade-up`
- Pulse screen: `integrity-pulse` (concentric rings, staggered delay)

**Vocabulary conventions**
- "Table" not "date" or "event"
- "Seat" not "reservation" or "spot"
- "Conviction" not "preference"
- "Prove You're Real" not "Verify your identity"

---

## Data Model (UX-relevant)

| Table | Purpose |
|-------|---------|
| `profiles` | why, pillar, filters, stack, table_id, verified |
| `events` | title, date, time, venue, address, maps_link, max_seats |
| `invitations` | user ↔ event, status (pending/confirmed/declined) |
| `connect_requests` | requester_id, target_id, event_id |
| `safety_reports` | reporter_id, reported_user_id, category, description, status |
| `user_roles` | admin access control |

---

## Edge Functions (UX touchpoints)

| Function | Triggered when |
|----------|---------------|
| `send-welcome-email` | User completes signup |
| `verify-identity` | Selfie uploaded on VerificationScreen |
| `compute-matches` | Profile saved on PulseScreen |
| `assign-tables` | Admin clicks "Assign Tables" |
| `notify-mutual-match` | User sends connect request |

---

## Open UX Considerations

- **Decline flow:** Declined invitations disappear from Upcoming but don't appear in Past Events — the user loses visibility on what they declined.
- **Verification failure:** Error state prompts retake but gives no guidance on what caused the failure (lighting, face not detected, etc.).
- **Match count = 0:** OutcomeScreen falls back to "Your table is being assembled" — no indication of timeline.
- **No notification layer:** Users must return to `/account` to check invitation status; there is no push/email notification for new invitations (only for mutual matches).
