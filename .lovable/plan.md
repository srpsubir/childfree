

## Rebrand to "Kindred" + Fix Step Labels

Update all screen copy to use "Kindred" as the brand name, replacing any "Certainty Archive" references, and fix the step numbering so Why = Step II and Pillar = Step III.

### Changes by file

**AuditScreen.tsx** -- Already says "Kindred", no changes needed. The landing screen is good as-is.

**WhyScreen.tsx**
- Step label stays "Step II" (correct position)
- No other changes needed

**PillarScreen.tsx**
- Change step label from "Step II" to "Step III"

**PledgeScreen.tsx**
- Change label from "The Pledge" to "The Kindred Pledge"
- Body copy stays the same (already strong)

**PulseScreen.tsx**
- Update cycling messages to reference Kindred:
  - "Checking your profile..." stays
  - "Matching you with verified childfree singles..." stays
  - "Reserving your seat at the table." stays
- Change footer label from "Verification in progress" to "Kindred verification in progress"

**RevealScreen.tsx**
- Change subtitle label from "You're Verified" to "Kindred Verified"

**LedgerScreen.tsx**
- Change label from "Membership Ledger" to "Kindred Ledger"
- Change heading from "Welcome, Architect." to "Welcome to Kindred."
- Change table name display to "The Kindred Table — Berlin"

### What stays the same
- All screen layouts, animations, and interaction logic unchanged
- Color system, typography, and design tokens unchanged
- The "Kindred" title on the Audit landing screen already exists

