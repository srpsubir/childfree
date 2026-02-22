
# UI Polish: Landing Screen + Screen Scaling Audit

## 1. Remove "One table. Six seats. No screens." from Landing

Delete lines 55-57 in `LandingScreen.tsx` (the table-mention paragraph).

## 2. Fix vertical spacing on Landing

The current `space-y-16` (4rem gaps) creates too much vertical spread, especially once we remove the table line. Change to `space-y-10` and reduce the CTA area padding (`py-4` to `py-0`) so content distributes evenly within the viewport.

## 3. Fix "Hold to Enter" text overflow

The button text "Hold to Enter" with `tracking-[0.2em]` and `text-xs` can overflow the 128px circle on small screens. Fix by:
- Reducing letter-spacing to `tracking-[0.15em]`
- Adding `text-[10px]` instead of `text-xs` (which is 12px)
- Adding `whitespace-nowrap` to prevent wrapping

## 4. Audit and fix "zoomed in" feel across screens

The issue is that some screens use `space-y-12` or `space-y-10` with `text-4xl` headings inside `min-h-screen justify-center`, which can feel oversized on smaller viewports. Consistent fixes:

| Screen | Current | Fix |
|--------|---------|-----|
| **WhyScreen** | `space-y-12`, heading `text-4xl` | Reduce to `space-y-10`, heading `text-3xl sm:text-4xl` |
| **PillarScreen** | `space-y-12`, heading `text-4xl` | Same: `space-y-10`, heading `text-3xl sm:text-4xl` |
| **FilterScreen** | `space-y-10`, heading `text-4xl` | Heading `text-3xl sm:text-4xl`, add `py-8` to outer div for scroll safety |
| **StackScreen** | `space-y-10`, heading `text-4xl` | Heading `text-3xl sm:text-4xl` |
| **AuthGate** | `space-y-10`, heading `text-3xl md:text-4xl` | Already good, no change |
| **PulseScreen** | Fine as-is (minimal content) | No change |

Additionally, all screens use `min-h-screen` with `justify-center` but no vertical padding beyond `px-6`. Adding `py-12` to the outer flex container on each screen ensures content doesn't press against viewport edges on short screens, which is what creates the "zoomed in" illusion.

## Technical Details

**Files modified:**
- `src/components/screens/LandingScreen.tsx` -- remove table line, adjust spacing, fix button text overflow
- `src/components/screens/WhyScreen.tsx` -- reduce heading size on mobile, add vertical padding
- `src/components/screens/PillarScreen.tsx` -- same
- `src/components/screens/FilterScreen.tsx` -- same, plus `min-h-screen` to `min-h-0` with `py-8` since content can exceed viewport
- `src/components/screens/StackScreen.tsx` -- same
- `src/components/screens/PulseScreen.tsx` -- add `py-12` for consistency

No database changes. No new dependencies.
