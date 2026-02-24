

# Feature Gap Analysis — Kindred V2.1

After reviewing the full codebase, here is the status of every feature listed in Memory.md and the build state.

---

## Active Build Error

**File:** `src/pages/Admin.tsx` line 169
**Issue:** The `SafetyReport` interface defines `category` as a union type (`"harassment" | "misrepresentation" | "boundary_violation" | "other"`), but the data returned from Supabase is typed as `string`. The `enriched` array spread fails the type check.
**Fix:** Change line 30 from the union type to `string`, or cast `category` explicitly in the mapping at line 169.

---

## Feature Status Matrix

| # | Feature | Status | Gap |
|---|---------|--------|-----|
| 1 | Safety Report + Mutual Connect (tables, dialogs, Account UI) | **Done** | Build error on Admin.tsx (type cast) |
| 2 | Admin Event Selection for Table Assignment | **Done** | Select dropdown + event_id passing implemented |
| 3 | Admin Safety Reports Review | **Done** | Table with Reviewed/Dismissed actions implemented |
| 4 | Email Notifications for New Invitations | **Done** | `assign-tables` sends emails via Resend inline |
| 5 | `send-welcome-email` dynamic event support | **Done** | Accepts `event` payload, falls back to default |
| 6 | Mobile Viewport Polish | **Not started** | Multiple screens use fixed sizes that break on 360-414px |
| 7 | `RESEND_API_KEY` secret | **Missing** | Not configured — emails will silently skip |

---

## Detailed Gaps

### Gap 1: Build Error — Admin.tsx SafetyReport type (blocking)

Line 30 defines `category` as a string literal union. The Supabase query returns `string`. Fix: change the interface to use `string` for `category`, or cast at line 169.

### Gap 2: Missing RESEND_API_KEY Secret

The `assign-tables` and `send-welcome-email` edge functions check for `RESEND_API_KEY`. It is **not configured** in the project secrets. All email sending is silently skipped. Need to add this secret.

### Gap 3: Mobile Viewport Polish

Screens with responsive issues on 360-414px:

| Screen | Issue |
|--------|-------|
| `OutcomeScreen` | `p-10` on invitation card, `text-4xl` heading — already has `p-6 md:p-10` and `text-2xl md:text-4xl`, looks fine |
| `LandingScreen` | `text-5xl sm:text-6xl` — OK on mobile |
| `WhyScreen` | `p-6 md:p-8` cards — OK |
| `FilterScreen` | OK |
| `StackScreen` | `p-5 md:p-7` — OK |
| `VerificationScreen` | Already has `w-48 h-48 md:w-64 md:h-64` — OK |
| `Account.tsx` | Already has `flex-col sm:flex-row` on past event buttons — OK |
| `Admin.tsx` | Header flex layout (Select + button) may overflow on mobile — the `flex items-center gap-3` with `w-64` select will overflow on small screens |

The main remaining mobile issue is `Admin.tsx` header layout. The event select (`w-64`) plus the assign button won't fit on 360px screens.

### Gap 4: `as any` Casts in Account.tsx

Lines 116, 122, 128 use `(supabase.from as any)(...)` which is a workaround. The generated types file already includes `safety_reports` and `connect_requests` tables. These casts can be removed now and replaced with normal `supabase.from("safety_reports")` / `supabase.from("connect_requests")` calls.

### Gap 5: profiles lookup uses `id` instead of `user_id`

In `Admin.tsx` line 152, the batch profile lookup for safety reports does:
```
.in("id", userIds)
```
But `reporter_id` and `reported_user_id` in `safety_reports` store **auth user IDs**, not profile row IDs. The lookup should use `.in("user_id", userIds)` instead of `.in("id", userIds)`.

---

## Recommended Fix Order

1. **Fix build error** — Change `SafetyReport.category` to `string` in Admin.tsx (1 line)
2. **Fix profile lookup bug** — Change `.in("id", userIds)` to `.in("user_id", userIds)` in Admin.tsx line 152
3. **Remove `as any` casts** — Clean up Account.tsx lines 116, 122, 128 since types now include the tables
4. **Add RESEND_API_KEY** — Configure the secret so emails actually send
5. **Mobile fix for Admin.tsx** — Make header layout responsive with `flex-col sm:flex-row`

### Technical Details

**Fix 1 — Admin.tsx line 30:**
Change `category: "harassment" | "misrepresentation" | "boundary_violation" | "other"` to `category: string`

**Fix 2 — Admin.tsx line 152:**
Change `.in("id", userIds)` to `.in("user_id", userIds)`

**Fix 3 — Account.tsx lines 116, 122, 128:**
Replace `(supabase.from as any)("safety_reports")` with `supabase.from("safety_reports")` (same for `connect_requests`)

**Fix 4 — Admin.tsx header (lines 242-280):**
Wrap the header controls in `flex-col sm:flex-row` and change select from `w-64` to `w-full sm:w-64`

