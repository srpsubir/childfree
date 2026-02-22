

# Redesign Outcome Screen as a Table Invitation Card

## The Problem

The current Outcome screen is a database dump disguised as UX. It shows users their own answers (Why, Pillar, Filters, Stack) back to them in a "Kindred Ledger" -- information they already know because they just entered it. This adds no value and feels clinical.

## The TimeLeft Insight

TimeLeft's post-booking screen works because it answers the only questions users actually have after signing up:

- **When** is this happening?
- **Where** will it be?
- **Who** will be there?

They reveal these details progressively (date first, venue on the day), creating anticipation. The screen feels like an **invitation**, not a confirmation receipt.

## The New Outcome Screen

Replace the Ledger with a minimal, elegant **Table Invitation Card**. Since Kindred doesn't yet have real scheduling, the card uses a "pending" state that builds mystery and anticipation.

### Layout (top to bottom)

1. **Status badge** -- small label at top: "Seat Confirmed"
2. **Headline** -- "The Berlin Table" (keep this, it's strong)
3. **Tagline** -- "One table. Six strangers. No small talk."
4. **Invitation card** -- a bordered card with three rows:
   - **Date** -- "TBA" with a subtle "You'll be notified" note (placeholder until real scheduling exists)
   - **Location** -- "Berlin" with a lock icon and "Revealed 24h before"
   - **Seats** -- "6" with "Matched by conviction"
5. **Countdown/status line** -- "Your table is being assembled" or match count if available
6. **CTA button** -- "Claim Your Seat" (keep)

### What Gets Removed

- The entire "Kindred Ledger" section (handle, why, pillar, filters, stack display)
- All label maps (`pillarLabels`, `whyLabels`, `filterLabels`, `stackLabels`)
- The `handle`, `why`, `pillar`, `filters`, `stack` props -- the component no longer needs them

### What Gets Simplified

**Props** shrink from 6 fields to just `matchCount`:
```
interface Props {
  matchCount?: number | null;
}
```

**Index.tsx** stops passing handle/why/pillar/filters/stack to OutcomeScreen.

### The Invitation Card Design

The card uses the existing design language (border, gallery-label, font-body) but feels like an event ticket rather than a form summary:

- Three horizontal rows with an icon/label on the left and value on the right
- Divider lines between rows
- Locked items show a subtle lock indicator and "revealed soon" text
- Clean, centered, aspirational

## Technical Changes

| File | Change |
|------|--------|
| `OutcomeScreen.tsx` | Complete rewrite: remove all label maps and data props, replace Ledger with invitation card layout |
| `Index.tsx` | Remove handle/why/pillar/filters/stack props from OutcomeScreen render, pass only matchCount |

## Design Details

The invitation card keeps the existing aesthetic:
- `border border-border bg-card` container
- `gallery-label` for field labels
- `font-body text-sm` for values
- Subtle animations with `animate-fade-up` variants
- A calendar icon, map-pin icon, and users icon from lucide-react for the three rows

The overall feel shifts from "here's your profile data" to "here's your invitation -- stay tuned."

