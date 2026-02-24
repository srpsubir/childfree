

# Add Verified Badge to Outcome Screen

## Change

Add a small verified indicator next to the "Seat Confirmed" badge on the Outcome screen. When the user's profile has `verified: true`, show a "✓ Identity Verified" micro-label beneath the status badge, using the existing `gallery-micro` style with `text-primary` color to match the design language.

## Implementation

### `src/components/screens/OutcomeScreen.tsx`

1. Add a `verified` prop to the `Props` interface:
   ```ts
   interface Props {
     matchCount?: number | null;
     verified?: boolean;
     onSignOut?: () => void;
   }
   ```

2. Below the "Seat Confirmed" badge (line ~73), conditionally render:
   ```tsx
   {verified && (
     <span className="inline-flex items-center gap-1.5 gallery-micro text-primary">
       <span className="w-1.5 h-1.5 bg-primary rounded-full" />
       Identity Verified
     </span>
   )}
   ```

### `src/pages/Index.tsx`

Pass the `verified` state from the profile data down to `OutcomeScreen`:
```tsx
<OutcomeScreen matchCount={matchCount} verified={profile?.verified} onSignOut={signOut} />
```

This requires storing the profile's `verified` field in state, which is already selected in the profile query.

### Files changed

| File | Change |
|---|---|
| `src/components/screens/OutcomeScreen.tsx` | Add `verified` prop, render badge |
| `src/pages/Index.tsx` | Pass `verified` to OutcomeScreen |

