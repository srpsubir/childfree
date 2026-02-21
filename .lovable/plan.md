

## Remaining Overhaul: 8-Screen Integrity Protocol

The Kindred rebrand is done. Here's everything still outstanding from the approved plan.

---

### 1. New Screen: City Node (Screen 1)

Create `CityNodeScreen.tsx` -- a geo-gate that opens the flow.

- Header: "Select City Node" (Playfair)
- A stark dropdown with only "Berlin (Alpha)" selectable
- Selecting Berlin auto-advances to Audit (no button needed)

### 2. Rework: Audit Screen (Screen 2)

Currently the landing screen with "Est. 2026" / "Kindred" branding. Changes:

- Remove "Est. 2026", the gold divider line, and "Childfree Dating. Verified."
- Header becomes: "The Certainty Archive." (this is the protocol name, not the brand -- Kindred stays the brand)
  - *Alternative*: Use "Kindred" as header here too if you prefer consistency. Your call.
- Input restyled: bottom-border only (`border-b` instead of bordered card)
- Micro-copy changes to: "Identity verification required. Your handle is only revealed to your confirmed table members."
- Button stays "BEGIN AUDIT"

### 3. New Screen: OTP Verification (Screen 3)

Create `OTPScreen.tsx` -- ownership verification gate.

- Header: "Verify Ownership."
- 6-digit OTP input using the existing `input-otp` package (already installed)
- Subtext: "Enter the code sent to your connected device to verify identity ownership."
- Accept any 6 digits to proceed (no real backend validation)

### 4. Why Screen (Screen 4) -- Minor tweak

- Step label changes from "Step II" to "Step III" (new position in 8-screen flow)
- Everything else stays

### 5. Rework: Pillar Screen (Screen 5)

- Step label: "Step IV"
- Header changes to: "Define your lifestyle pillar."
- Pillar options change to **Truth**, **Autonomy**, **Legacy** (stark cards -- title only, no descriptions)
- Selecting a card highlights with 1px champagne border and auto-advances (remove the Confirm button)

### 6. Pledge Screen (Screen 6) -- Copy update

- Body copy changes to: "I AM CERTAIN. I confirm a child-free life is my final decision. Ambiguity ends here."
- Button label: "HOLD TO CONFIRM"
- Hold mechanic stays the same (3s long-press)

### 7. Pulse Screen (Screen 7) -- Text cycle update

- Dynamic text changes to cycle every 2.5s:
  1. "Authenticating intent..."
  2. "Filtering for ambiguity..."
  3. "Finalizing table placement..."
- Duration stays 7.5s

### 8. New Screen: Outcome (Screen 8) -- Replaces Reveal + Ledger

Create `OutcomeScreen.tsx` combining the old Reveal and Ledger into one final screen.

- Header: "The Berlin Table."
- Manifesto text: "For the architects of their own lives. You are matched with those who prioritize autonomy and vision over the expected path."
- Ledger Card: shows handle, pillar, why, and a gold badge "INTENT VERIFIED"
- Primary action: solid champagne gold button "CLAIM YOUR SEAT"

### 9. Index.tsx -- New flow + fade transitions

- Update the screen type and flow: `node -> audit -> otp -> why -> pillar -> pledge -> pulse -> outcome`
- Add 800ms opacity fade transition wrapper so each screen fades in smoothly
- Remove imports for `RevealScreen` and `LedgerScreen`

### 10. Global CSS

- Add a `screen-fade` transition utility class (opacity 0 to 1 over 800ms) in `index.css`

---

### Files summary

| Action | File |
|--------|------|
| Create | `src/components/screens/CityNodeScreen.tsx` |
| Create | `src/components/screens/OTPScreen.tsx` |
| Create | `src/components/screens/OutcomeScreen.tsx` |
| Modify | `src/components/screens/AuditScreen.tsx` |
| Modify | `src/components/screens/WhyScreen.tsx` (step label) |
| Modify | `src/components/screens/PillarScreen.tsx` (pillars + auto-advance) |
| Modify | `src/components/screens/PledgeScreen.tsx` (copy) |
| Modify | `src/components/screens/PulseScreen.tsx` (text cycle) |
| Remove | `src/components/screens/RevealScreen.tsx` |
| Remove | `src/components/screens/LedgerScreen.tsx` |
| Modify | `src/pages/Index.tsx` (new flow + fade wrapper) |
| Modify | `src/index.css` (fade transition utility) |

No new dependencies needed.

