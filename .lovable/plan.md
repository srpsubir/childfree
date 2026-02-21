

## Matching Brain: 5 Layers, 2 New Screens

### The Insight

All 5 matching layers get captured, but only 2 new screens are added to onboarding. The rest comes from data we already collect (Why + Pillar) and a post-onboarding feature (Friction Question).

---

### Layer Mapping

| Layer | Where it lives | User effort |
|-------|---------------|-------------|
| Conviction Spectrum (Why-to-Why) | Already collected (Why + Pillar screens) | Zero -- free signal |
| Anti-List + Dealbreaker Mesh | New screen: "The Filter" | One multi-select tap |
| Non-Negotiables | New screen: "The Stack" | Rank top 3 from 5 |
| Friction Question | Post-onboarding (monthly prompt in-app) | Outside onboarding |

---

### New Screen 1: "The Filter" (Screen 5, after Pillar)

A combined Anti-List and Dealbreaker screen. One gesture, two layers of signal.

- Header: "What you refuse to tolerate."
- Subtext: "Select all that apply. Honesty sharpens your match."
- Display ~8 stark statement chips/cards, multi-select:
  1. "Timeline pressure from family"
  2. "Partners who say 'maybe someday'"
  3. "Friends who disappeared after kids"
  4. "Being told you'll change your mind"
  5. "Dates who treat childfree as a phase"
  6. "Workplaces that penalize the childless"
  7. "Social events built around children"
  8. "The assumption that purpose requires parenthood"
- Minimum 2 selections required to continue
- Continue button at the bottom
- Data stored as an array of selected IDs

**Matching logic (backend):** Users who share 4+ of the same aversions get a strong affinity boost. Users who share fewer than 2 get deprioritized. This is the highest-signal bonding layer -- shared rejection creates instant rapport.

---

### New Screen 2: "The Stack" (Screen 6, after Filter)

The Non-Negotiables ranking screen. Order reveals priority.

- Header: "Rank what matters most."
- Subtext: "Tap to select your top 3, in order."
- 5 lifestyle value cards displayed vertically:
  1. **Freedom** -- "No permission needed. Ever."
  2. **Financial Independence** -- "Your money. Your legacy."
  3. **Solitude** -- "Alone is not lonely."
  4. **Mobility** -- "Anywhere. Anytime."
  5. **Purpose** -- "Built for meaning, not obligation."
- Tap to select: first tap = rank 1, second tap on another = rank 2, third = rank 3
- Selected cards show their rank number (1, 2, 3) with champagne highlight
- Tap a selected card again to deselect
- Auto-advances after 3rd selection (no button needed)
- Data stored as ordered array of 3 IDs

**Matching logic (backend):** Weighted comparison. Sharing the same #1 is worth 3x. Same top 3 in any order is strong. Completely different stacks = low compatibility on this axis.

---

### Updated 9-Screen Flow

```text
1. Audit (handle)
2. OTP (verification)
3. Why (conviction origin)           -- Layer: Conviction Spectrum
4. Pillar (identity axis)            -- Layer: Conviction Spectrum
5. Filter (aversions + dealbreakers) -- Layers: Anti-List + Dealbreaker Mesh
6. Stack (ranked values)             -- Layer: Non-Negotiables
7. Pledge (3s hold)
8. Pulse (7.5s ritual)
9. Outcome (table assignment)
```

---

### Friction Question (Post-Onboarding, NOT part of this build)

This is a future in-app feature, not an onboarding screen. Documented here for completeness:

- One polarizing question rotates monthly (e.g., "Is it selfish to be childfree?", "Should childfree people date parents?")
- Binary answer (Yes / No) or short free-text
- Users who answer the same way on recent questions get a match boost
- Lives in a future dashboard/feed, not the onboarding flow

---

### Data Model (for your Claude Code backend)

Each completed onboarding produces a user profile with:

```text
{
  handle: string,
  why: "design" | "realisation" | "priority",
  pillar: "truth" | "autonomy" | "legacy",
  filters: string[],        // array of selected aversion IDs (2-8 items)
  stack: [string, string, string],  // ordered top-3 value IDs
}
```

The matching algorithm weights these layers:
- **Filter overlap** (highest weight) -- shared aversions bond hardest
- **Stack alignment** (high weight) -- same #1 = strong signal
- **Why-to-Why match** (medium weight) -- same conviction origin
- **Pillar match** (lower weight) -- complementary pillars can also work

---

### Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/components/screens/FilterScreen.tsx` |
| Create | `src/components/screens/StackScreen.tsx` |
| Modify | `src/pages/Index.tsx` (add screens 5+6, pass data, update flow) |

No new dependencies needed. Total new user input: ~10 seconds across both screens.
