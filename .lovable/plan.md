

## Three UX Improvements (Revised)

### 1. Landing Page (new screen before Audit)

Create `src/components/screens/LandingScreen.tsx` -- a marketing entry point for cold traffic (ads, referrals, shares). Tone: relief, finality, "the search is over."

**Content:**
- "Kindred" wordmark (large, Playfair Display)
- Tagline: "Done explaining. Done compromising. Done searching."
- 3 short value props (stacked vertically, text only):
  - "Find childfree partners who mean it."
  - "Matched by conviction, not luck."
  - "No ambiguity. No bait-and-switch."
- Single CTA button: "Enter Kindred"
- Footer micro-text: "For the certain. By audit only."

**Style:** Same Gallery aesthetic -- charcoal background, champagne accents, Playfair headings, Inter body, sharp 0px corners. Full-viewport centered layout.

**Flow change in `Index.tsx`:**
- Add `"landing"` to the `Screen` type
- Set initial state to `"landing"`
- Landing `onNext` navigates to `"audit"`
- No back button on Landing (root screen)
- Audit gets a back button pointing to Landing

---

### 2. Stack Screen -- Add Childfree Context

Update `src/components/screens/StackScreen.tsx`:

- Heading: "Rank what matters most." becomes **"Rank what matters most for your childfree life."**
- Subtext: "Tap to select your top 3, in order." becomes **"What drives your decision? Tap your top 3, in order."**

Two string changes only.

---

### 3. Pulse Screen -- Table Teaser

Update `src/components/screens/PulseScreen.tsx`:

- During the final phase (phase 2, when message reads "Finalizing table placement..."), show an additional line below the "Kindred verification in progress" label:
- **"Preparing your Table -- a private circle of people matched to your conviction and values."**
- This fades in with the phase 2 transition so users understand what "table placement" means before the Outcome screen reveals it.

---

### Updated Flow (10 screens)

```text
0. Landing (marketing entry -- "the search is over")
1. Audit (handle)
2. OTP (verification)
3. Why (conviction origin)
4. Pillar (identity axis)
5. Filter (aversions)
6. Stack (ranked values -- now with childfree context)
7. Pledge (3s hold)
8. Pulse (integrity check + table teaser)
9. Outcome (table assignment + ledger)
```

### Files Changed

| Action | File |
|--------|------|
| Create | `src/components/screens/LandingScreen.tsx` |
| Modify | `src/components/screens/StackScreen.tsx` (2 string changes) |
| Modify | `src/components/screens/PulseScreen.tsx` (add teaser line at phase 2) |
| Modify | `src/pages/Index.tsx` (add landing screen to flow, wire navigation) |

