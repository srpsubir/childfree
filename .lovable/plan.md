

## Add Back: "Why Are You Childfree?"

We removed the original pillar selection (Truth, Autonomy, Legacy) and replaced it entirely with partner-preference questions. But the "why" behind someone's childfree choice is a core identity signal -- it's what makes Kindred's matching meaningful.

### Approach

Add a **new screen between Audit and the current Pillar screen** that asks users directly why they are childfree. The current Pillar screen (partner values) stays as-is.

**New Screen: "The Why"**

Header: **"Why are you childfree?"**
Sub: **"No wrong answers. This is about your truth."**

Three options:

| Option | Title | Description |
|--------|-------|-------------|
| 1 | **By Design** | "I've always known. Kids were never part of my plan." |
| 2 | **By Realisation** | "I came to it over time. The more I lived, the clearer it became." |
| 3 | **By Priority** | "I chose freedom, career, or purpose -- and parenthood doesn't fit." |

Button: **"Continue"**

This value gets stored and displayed on the Ledger screen as a new row (e.g., "Why: By Design").

### Flow order update

The onboarding becomes 7 steps:
1. Audit (handle input)
2. **Why (new -- why childfree)**
3. Pillar (what you value in a partner)
4. Pledge (hold to confirm)
5. Pulse (verification animation)
6. Reveal (table assignment)
7. Ledger (summary)

### Technical details

**New file:**
- `src/components/screens/WhyScreen.tsx` -- new screen component, same card-selection pattern as PillarScreen

**Files to modify:**
- `src/pages/Index.tsx` -- add "why" step to the flow state, pass the "why" value through to Ledger
- `src/components/screens/LedgerScreen.tsx` -- add a "Why" row displaying the user's selection

No new dependencies.

