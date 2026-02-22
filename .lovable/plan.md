

# Kindred: Table Context, Navigation, and Multi-Event Architecture

---

## 1. Introduce "Table" Context from Step 4 (Stack) Onwards

Right now, users don't learn they're being matched to a real-world dinner until the very end. We should tease the concept progressively:

**StackScreen (Step 4)** -- Add a subtle footer line below the Continue button:
> "Your answers shape the table you'll be seated at."

**AuthGate** -- Update the subtitle from "Sign in with Google to secure your seat" to:
> "Sign in to reserve your place at the table. Six people. One evening. No small talk."

**PulseScreen** -- The phase 2 message already mentions "your Table." Strengthen the earlier phases:
- Phase 0: "Reading your signal..." (keep atmospheric)
- Phase 1: "Finding your people..." (hint at matching)
- Phase 2 (existing): "Preparing your Table -- a private circle matched to your conviction. You'll meet in person."

**OutcomeScreen** -- Already strong. No changes needed.

This creates a reveal arc: **hint (Stack) -> commitment (Auth) -> anticipation (Pulse) -> payoff (Outcome)**.

---

## 2. Add Back/Return Buttons Across the Full Flow

Current state: Back buttons exist on Why, Pillar, Filter, Stack, and Auth. Missing from Pulse and Outcome.

**Add to these screens:**

| Screen | Back Button Target | Notes |
|--------|-------------------|-------|
| Pulse | None -- intentionally locked | This is a processing moment, adding Back would break the ritual. Keep it as-is. |
| Outcome | Add a sign-out + "Start Over" option | Not a "Back" button per se, but an escape hatch. Small text link at the bottom: "Sign out" which calls `signOut()` and returns to Landing. |

**Implementation:**
- Pass `signOut` from `useAuth()` down to `OutcomeScreen` as a prop
- Add a subtle footer link: "Sign out" styled as `gallery-label text-muted-foreground hover:text-foreground`

---

## 3. Returning User Flow

Currently, a returning authenticated user lands on the Landing screen and must redo the entire flow. This needs fixing.

**Logic in `Index.tsx` on load:**
1. If `user` exists and `!loading`, query `profiles` for their record
2. If profile exists with `table_id` (already assigned) -> skip straight to Outcome, fetch their table event(s)
3. If profile exists without `table_id` (completed onboarding, waiting for assignment) -> skip to Outcome with "table is being assembled" state
4. If no profile -> start fresh from Landing

**Technical changes:**
- Add a `useEffect` in `Index.tsx` that runs after auth loads
- Query: `supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()`
- If found: populate `why`, `pillar`, `filters`, `stack` from the profile, then `goTo("outcome")`
- Show a brief "Welcome back" loading state during the check

---

## 4. Multiple Table Events Architecture

This is the biggest structural change. Currently, `OutcomeScreen` hardcodes a single event. To support multiple invitations:

### Database Changes

**New `events` table:**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| title | text | e.g. "The Berlin Table" |
| date | timestamptz | Event date/time |
| venue | text | e.g. "QBA, Berlin" |
| address | text | Full address |
| maps_link | text | Google Maps URL |
| city | text | City name |
| max_seats | integer | Default 6 |
| status | text | "upcoming", "past", "cancelled" |
| created_at | timestamptz | |

**New `invitations` table:**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid | References auth.users |
| event_id | uuid | References events |
| status | text | "pending", "confirmed", "declined" |
| invited_at | timestamptz | |
| responded_at | timestamptz | Nullable |

RLS policies: Users can read/update their own invitations. Admins can CRUD all.

**Migrate existing `tables` table:** The current `tables` table tracks table groupings (who sits with whom). This stays separate from `events`. An event contains multiple tables. Add `event_id` to the `tables` table as a foreign key.

### New Route: `/account` (My Tables)

A dedicated page showing the user's invitations:
- List of upcoming events they're invited to, each as a card similar to the current Outcome invitation card
- Status badge per invitation: "Confirmed", "Pending", "Declined"
- Action buttons: "Confirm" / "Decline" / "Add to Calendar"
- Past events section (collapsed by default)

### Updated Outcome Screen

After onboarding, instead of showing one hardcoded event:
- Query `invitations` joined with `events` for the user
- Show the next upcoming invitation
- Add a "View All Invitations" link that navigates to `/account`

### Navigation

- Add a minimal top nav or floating button on Outcome/Account screens: user avatar + "My Tables" link
- The Outcome screen becomes the "latest invitation" view; `/account` becomes the full history

### Flow Summary

```text
First-time user:
  Landing -> Why -> Pillar -> Filter -> Stack -> Auth -> Pulse -> Outcome (first invitation)
                                                                    |
                                                              "View All" -> /account

Returning user:
  Landing -> (auto-detect profile) -> /account (all invitations)
                                        or
                                   -> Outcome (if only one invitation)

Admin invites to new event:
  Admin creates event -> assign-tables clusters for that event -> invitations created -> users see new card in /account
```

---

## Technical Summary

### Files to create:
- `src/pages/Account.tsx` -- My Tables / invitations list page

### Files to modify:
- `src/pages/Index.tsx` -- returning user check, pass signOut to Outcome
- `src/components/screens/StackScreen.tsx` -- add table context hint
- `src/components/screens/PulseScreen.tsx` -- update phase messages
- `src/components/AuthGate.tsx` -- update subtitle copy
- `src/components/screens/OutcomeScreen.tsx` -- dynamic events from DB, sign-out link, "View All" link
- `src/App.tsx` -- add `/account` route
- `supabase/functions/assign-tables/index.ts` -- accept `event_id`, link tables to events

### Database migrations:
- Create `events` table with RLS
- Create `invitations` table with RLS
- Add `event_id` column to existing `tables` table
- Seed the Berlin event as the first row in `events`

### No new dependencies required.

