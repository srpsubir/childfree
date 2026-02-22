
# Three Changes: Pillar Descriptions, Landing CTA Padding, IRL Surfacing, and Matching Brain

## 1. PillarScreen -- Add Descriptions to Options

The three pillar options ("Truth", "Autonomy", "Legacy") currently show only titles with no context. Add a `desc` field to each, matching the pattern already used in `WhyScreen`.

**Proposed descriptions:**

| Pillar | Description |
|--------|-------------|
| Truth | You live unfiltered. No performance, no pretense -- just radical honesty about who you are. |
| Autonomy | Your life, your rules. You design every day without permission or compromise. |
| Legacy | What you leave behind is defined by impact, not bloodline. |

Each option button will show the title and a subtitle line beneath it, identical to how `WhyScreen` renders its options.

## 2. LandingScreen -- Fix CTA Padding

The hold-to-enter ring sits inside `space-y-16` with the tagline directly below. The ring area itself has no extra bottom padding, which may feel cramped. Will add vertical padding/margin around the ring container to give it breathing room (e.g., `py-4` or adjusting the parent spacing).

## 3. Surface IRL Meetup Expectation

The user currently has no idea they're signing up for an in-person meetup until... never. This needs to be introduced gradually across three touchpoints:

**A. Landing Screen (subtle hint)**
Add a line to the manifesto section:
> "One table. Six seats. No screens."

This plants the seed without explaining it.

**B. Pulse Screen (explicit reveal)**
The Pulse screen already shows progressive messages. Update the final phase message (phase 2) to make the IRL nature clear:
> "Preparing your Table -- a private circle of people matched to your conviction and values. You'll meet in person."

**C. Outcome Screen (confirmation)**
Add a line below "The Berlin Table" heading:
> "Your table is being set. You'll receive a date, a location, and five names."

This confirms the IRL expectation and builds anticipation.

## 4. The Matching Brain -- Table Placement Engine

The current `compute-matches` function does pairwise scoring but doesn't form groups (tables). A real table placement system needs to assemble groups of ~6 compatible people, not just rank individuals.

### New Edge Function: `assign-tables`

This function runs periodically (or is triggered after enough users onboard) and:

1. **Fetches all unassigned profiles** (profiles without a `table_id`)
2. **Scores all pairs** using the existing weighted algorithm
3. **Forms tables of 6** using a greedy clustering approach:
   - Pick the highest-scoring unmatched pair as seeds
   - Iteratively add the person with the highest average compatibility to the growing group
   - Stop at 6 members per table
   - Repeat until no more valid tables can be formed (remaining users wait)
4. **Writes table assignments** back to the database

### Database Changes

**New `tables` table:**
- `id` UUID (primary key)
- `name` TEXT (e.g., "Berlin -- Alpha")
- `city` TEXT
- `created_at` TIMESTAMP
- `status` TEXT (forming / ready / scheduled / completed)
- `max_seats` INTEGER (default 6)

**Add to `profiles` table:**
- `table_id` UUID (nullable, references `tables.id`)
- `assigned_at` TIMESTAMP (nullable)

### Updated `compute-matches`

Keep this function for showing match counts during onboarding (real-time feedback). It stays as-is but will later query by `user_id` instead of `handle` (part of the Google Sign-In migration).

### Clustering Algorithm (inside `assign-tables`)

```text
1. Load all profiles WHERE table_id IS NULL
2. Compute NxN compatibility matrix using existing score function
3. While unassigned pool >= 6:
   a. Find highest-scoring pair -> seed a new table
   b. Repeat 4 times:
      - For each remaining candidate, compute avg score vs current table members
      - Add the candidate with highest avg score
   c. Create table record, assign all 6 profiles
4. Remaining users (<6) stay in pool for next run
```

### Constraints (future iterations)
- Geographic clustering (city field on profiles -- not yet collected)
- Gender balance (not yet collected)
- Scheduling preferences (not yet collected)

For now, the algorithm is conviction-based only, using the four existing signals. Geography and demographics can be layered in later.

## Technical Summary

| Change | Files |
|--------|-------|
| Pillar descriptions | `PillarScreen.tsx` |
| Landing CTA padding | `LandingScreen.tsx` |
| IRL hint on Landing | `LandingScreen.tsx` |
| IRL reveal on Pulse | `PulseScreen.tsx` |
| IRL confirm on Outcome | `OutcomeScreen.tsx` |
| New `tables` table | Database migration |
| `table_id` on profiles | Database migration |
| New `assign-tables` function | `supabase/functions/assign-tables/index.ts` |
