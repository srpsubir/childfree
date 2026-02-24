

# Responsiveness Audit + Build Error Fix

## Build Error (blocking)

The `assign-tables` edge function has a TypeScript error on line 375. The `sendInvitationEmail` function signature on line 211 declares `supabase: ReturnType<typeof createClient>`, but the `createClient` from `@supabase/supabase-js@2` returns a generic type that doesn't match the actual instantiated client. 

**Fix:** Change the parameter type to `any` (consistent with the existing `// deno-lint-ignore no-explicit-any` comment on line 209):

```typescript
// Line 211: change
supabase: ReturnType<typeof createClient>,
// to
supabase: any,
```

---

## Responsiveness Analysis

I reviewed all screens at 375px (iPhone SE/13 mini). Here's what I found:

### Screens that fit well (no issues)
- **LandingScreen** — centered content, `px-6`, `max-w-md`, responsive text. Fits on one viewport.
- **PulseScreen** — minimal content, centered. Fine.
- **AuthGate** — centered, `max-w-sm`. Fine.
- **OTPScreen** — `max-w-md`, centered. Fine.

### Screens with scrolling issues

1. **FilterScreen** — 8 selection cards + header + button. Uses `min-h-screen` with `items-center justify-center`, which vertically centers the content. On short phones (667px like iPhone SE), 8 cards overflow the viewport and the centering pushes content up off-screen, making the top cards inaccessible or the bottom button cut off.

2. **StackScreen** — 5 cards + header + button + footer text. Same centering issue on small screens.

3. **WhyScreen** — 3 cards with descriptions. Borderline on very small screens, but generally fits.

4. **PillarScreen** — 3 cards with longer descriptions. Same as WhyScreen, borderline.

5. **OutcomeScreen** — Badge + title + description + invitation card (3 rows) + status + CTA + footer links, all with `space-y-14`. Heavy vertical spacing causes overflow on phones. The `space-y-14` (3.5rem gaps) is excessive for mobile.

6. **VerificationScreen** — Generally fits, but `px-6 py-16` uses generous vertical padding.

7. **Account page** — Uses scrollable layout (`max-w-lg mx-auto px-6 py-12`), no `justify-center`. This one is fine since it's meant to scroll.

### Root cause pattern

The problem is `min-h-screen flex-col items-center justify-center` on content-heavy screens. When content exceeds viewport height, `justify-center` pushes the top off-screen instead of letting the user scroll from the top.

### Proposed fixes

**For all onboarding screens (Why, Pillar, Filter, Stack, Verification, Outcome):**
- Change `justify-center` to `justify-start` on mobile, `justify-center` on desktop: replace with `justify-start sm:justify-center`
- Reduce vertical padding on mobile: change `py-16` to `py-10 sm:py-16`
- Add top padding to compensate for removing center on mobile: `pt-20 sm:pt-16`

**For OutcomeScreen specifically:**
- Reduce `space-y-14` to `space-y-8 sm:space-y-14` on mobile

**For FilterScreen and StackScreen:**
- Reduce card padding on mobile: `p-4 sm:p-5` instead of `p-5`

**Screens to update (8 files):**

| Screen | Changes |
|--------|---------|
| `WhyScreen` | `justify-start sm:justify-center`, `py-10 sm:py-16`, `pt-20 sm:pt-16` |
| `PillarScreen` | Same pattern |
| `FilterScreen` | Same pattern + smaller card padding on mobile |
| `StackScreen` | Same pattern + smaller card padding on mobile |
| `VerificationScreen` | Same pattern |
| `OutcomeScreen` | Same pattern + reduce `space-y-14` to `space-y-8 sm:space-y-14` |
| `LandingScreen` | Same pattern (preventative) |
| `AuthGate` | Same pattern (preventative) |
| `AuditScreen` | Change `px-10` to `px-6 md:px-10` (currently missing mobile padding reduction) |

**Edge function fix (1 file):**

| File | Change |
|------|--------|
| `assign-tables/index.ts` line 211 | Change parameter type to `any` |

### Technical detail

The core CSS change on each screen wrapper is:
```
- className="flex min-h-screen flex-col items-center justify-center px-6 md:px-10 py-16"
+ className="flex min-h-screen flex-col items-center justify-start sm:justify-center px-6 md:px-10 pt-20 sm:pt-16 pb-10 sm:pb-16"
```

This ensures on mobile the content starts from the top (scrollable), while on larger screens it remains vertically centered.

