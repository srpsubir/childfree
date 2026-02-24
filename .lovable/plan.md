

# Issue: Verification Screen Not Visible to Returning Users

## What's happening

You're a returning user — you already have a profile with a `why` value. The current `Index.tsx` logic on line 51-56 detects this and sends you straight to the **Outcome** screen, completely skipping the Verification screen.

The Verification screen only appears for **new users** going through onboarding for the first time (after the Auth step). Since your profile already exists with `verified: false`, you'd never see it.

Additionally, the app is stuck on "Loading…" which may indicate the profile check query is hanging.

## The flow today

```text
Returning user (has profile with why):
  Loading → Outcome  (skips everything, including verify)

New user:
  Landing → Why → Pillar → Filter → Stack → Auth → Verify → Pulse → Outcome
```

## Fix

Update the returning-user check (lines 50-57 in `Index.tsx`) to route unverified returning users to the Verification screen instead of straight to Outcome:

```text
Returning user (verified):
  Loading → Outcome

Returning user (NOT verified):
  Loading → Verify → Pulse → Outcome

New user:
  Landing → Why → Pillar → Filter → Stack → Auth → Verify → Pulse → Outcome
```

### Code change in `Index.tsx`

In the `.then(({ data })` callback, change the logic from:

```js
if (data && data.why) {
  // restore state...
  goTo("outcome");
}
```

To:

```js
if (data && data.why) {
  // restore state...
  if (data.verified) {
    goTo("outcome");
  } else {
    goTo("verify");  // send unverified returning users to verification
  }
}
```

This single change ensures you (and any returning user who hasn't yet verified) will see the Verification screen.

### Files changed

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Route unverified returning users to `"verify"` instead of `"outcome"` |

