

# Merge Pledge into Landing CTA

## The Insight

With Google Sign-In now serving as the "prove you're real" gate, the separate Pledge screen (hold for 3 seconds) becomes redundant -- two trust barriers back-to-back. Instead, move the hold gesture to the Landing screen's CTA. This way, the very first interaction signals commitment: you don't just *click* "Enter Kindred," you *hold* to enter.

## New Screen Flow (8 screens, down from 10)

1. **Landing** -- hold CTA replaces "Enter Kindred" button
2. Why
3. Pillar
4. Filter
5. Stack
6. **Identity** (Google Sign-In)
7. Pulse
8. Outcome

The separate `PledgeScreen` is removed entirely.

## Landing Screen Changes

Replace the current simple button with the hold-to-confirm ring from `PledgeScreen.tsx`. The copy adapts:

- **Current button:** "Enter Kindred" (click)
- **New interaction:** A 3-second hold ring with "Hold to Enter" label
- On completion, text changes to "Entered" and auto-advances after 600ms
- Subtext below: "For the certain. By conviction only." (replaces "For the certain. By audit only.")

The progress ring SVG and hold logic from `PledgeScreen` moves into `LandingScreen`.

## What Gets Removed

- `PledgeScreen.tsx` -- deleted
- `pledge` removed from the screen type union and flow in `Index.tsx`
- All pledge-related routing and back-button wiring removed

## What Gets Modified

### `LandingScreen.tsx`
- Import the hold logic (interval-based progress tracking) from the current Pledge implementation
- Replace the `<button>` CTA with the circular progress ring + hold interaction
- Keep existing headline, manifesto copy, and fade-up animations
- Update bottom tagline from "By audit only" to "By conviction only"

### `Index.tsx`
- Remove `pledge` from the `Screen` type
- Remove `PledgeScreen` import and rendering
- Update flow: `stack` advances directly to `identity` (the new Google Sign-In screen)
- Remove back-button wiring for the pledge step

## Technical Details

The hold mechanic is already built in `PledgeScreen.tsx` (lines 14-30):
- 3000ms hold duration, 30ms tick interval
- `onMouseDown`/`onTouchStart` starts the timer
- `onMouseUp`/`onMouseLeave`/`onTouchEnd` resets if incomplete
- SVG circle with `strokeDashoffset` for the progress ring
- On completion: state flips to "complete," 600ms delay, then `onNext()`

This logic transfers directly into `LandingScreen` with only copy changes.

