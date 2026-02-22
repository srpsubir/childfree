

# Generate Updated Memory.md

Replace the outdated `src/assets/Memory.md` with a comprehensive, current snapshot of the entire project.

## What the new Memory.md will cover

**Product Vision** -- Updated to reflect V2 "Certainty Archive" with the Table dinner concept (Timeleft-style) and women-first strategy.

**Onboarding Flow** -- Documented 8-screen sequence:
1. Landing (3s hold-to-enter)
2. Why (3 options: Design / Realisation / Priority)
3. Pillar (Truth / Autonomy / Legacy)
4. Filter (8 aversions, min 2)
5. Stack (5 values, rank top 3, table context hint)
6. Auth (Google OAuth via Lovable Cloud)
7. Pulse (7.5s, 3 phases, table reveal)
8. Outcome (dynamic event card from DB)

**Design System** -- Fonts (Playfair Display / Inter), colors (HSL variables for charcoal/champagne), 0px radius, CSS utility classes (`gallery-heading`, `gallery-body`, `gallery-label`), animations.

**Database Schema** -- Tables: `profiles`, `tables`, `events`, `invitations`, `otp_codes`, `user_roles`. Key relationships and RLS summary.

**Backend Functions** -- 5 edge functions: `assign-tables`, `compute-matches`, `send-otp`, `verify-otp`, `send-welcome-email`.

**Routes** -- `/` (onboarding), `/account` (invitations), `/admin` (table assignment).

**Returning User Flow** -- Auto-detect profile on load, skip to Outcome.

**Changelog** -- V2 Rebirth + V2.1 Table Context & Multi-Event additions.

## Technical details

- Overwrite `src/assets/Memory.md` with the full updated content
- No other files changed
- No dependencies added

