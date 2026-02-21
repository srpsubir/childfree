

## Remove City Node Screen

Strip the City Node geo-gate from the current flow. It's a post product-market fit feature that belongs after the Pulse screen once geo-location and multi-city expansion are ready.

### Changes

**`src/pages/Index.tsx`**
- Remove `CityNodeScreen` import
- Remove `"node"` from the `Screen` type
- Change initial state from `"node"` to `"audit"` (Audit becomes the entry point)
- Remove the `CityNodeScreen` render block

**`src/components/screens/CityNodeScreen.tsx`**
- Delete file (no longer used)

### Resulting 7-screen flow

```text
1. Audit --> 2. OTP --> 3. Why --> 4. Pillar --> 5. Pledge --> 6. Pulse --> 7. Outcome
```

No other screens or step labels need updating -- they already reference their correct positions.
