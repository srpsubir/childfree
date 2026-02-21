

## Messaging Overhaul: Clarity on Childfree Dating + In-Person Tables

Three core problems to fix:

### 1. Screen 1 (Audit) -- Make it clear this is childfree dating

**Current:** "The Certainty Archive" + "Lifestyle Verification" -- too vague.

**Updated copy:**
- Tagline changes from "The Certainty Archive" to **"Childfree Dating. Verified."**
- Sub-label changes from "Lifestyle Verification" to **"We verify you're childfree. Then we seat you at a table."**
- Bottom text becomes: **"Your handle is your proof of lifestyle. We check it so your dates don't have to."**

### 2. Screen 2 (Pillar) -- Reframe as a simple "What matters most to you in dating?"

**Current:** Abstract pillar names (Truth, Autonomy, Legacy) with manifesto-style descriptions users won't relate to.

**Updated approach -- rename to "What matters most?"** with clear, relatable options:

| Option | Title | Description |
|--------|-------|-------------|
| 1 | **Freedom** | "I want a partner who values spontaneity, travel, and living on our own terms." |
| 2 | **Ambition** | "I want a partner who's building something -- career, craft, or purpose -- without compromise." |
| 3 | **Connection** | "I want deep partnership. All the intimacy, none of the parenthood." |

Header: **"What do you value most in a partner?"**
Sub: **"This helps us seat you with the right people."**
Button: **"Confirm"**

This also introduces the "seating" concept early so it doesn't come out of nowhere later.

### 3. Screens 3-5 (Pulse, Reveal, Ledger) -- Contextualise the "table" as an in-person dinner date

**Pulse screen messages updated to:**
1. "Checking your profile..." (2s)
2. "Matching you with verified childfree singles..." (2.5s)
3. "Reserving your seat at the table." (3s)

Sub-label: "Verification in progress"

**Reveal screen updated:**
- Label: "You're verified"
- Title stays: "The Mitte Table"
- Manifesto replaced with a clear explanation: **"You've been matched to an intimate dinner table with 5 other verified childfree singles. Real people. Real conversation. No ambiguity about where they stand."**
- Below: date/location placeholder -- "Berlin -- Date announced soon"
- Button stays: "Claim Your Seat"

**Ledger screen updated:**
- Bottom text changes to: **"Your seat is reserved. We'll notify you when your table date is confirmed."**
- "Track: Architects" row removed (confusing). Keep Handle, Status (Vetted), Value (the pillar they picked), and Table.

### 4. Pledge screen -- minor tweak

Update the pledge text to be more direct:
**"I confirm: I am childfree by choice. This is not a phase."**

---

### Technical summary

Files to modify:
- `src/components/screens/AuditScreen.tsx` -- updated copy
- `src/components/screens/PillarScreen.tsx` -- new pillar options, new header/sub copy
- `src/components/screens/PledgeScreen.tsx` -- updated pledge statement
- `src/components/screens/PulseScreen.tsx` -- updated phase messages
- `src/components/screens/RevealScreen.tsx` -- rewritten manifesto card with dinner context
- `src/components/screens/LedgerScreen.tsx` -- remove "Track" row, update pillar labels, update bottom text

No new files, no new dependencies. Pure copy/content changes across 6 files.
