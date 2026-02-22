
# Beta Launch: Google Auth, Calendar Invite, Admin, Email

## Overview

Five changes to make this launchable for 50 users by Saturday 1 March, 7 PM at QBA (Oranienburger Str. 45, 10117 Berlin).

---

## 1. Google Sign-In (replace handle/phone)

Add Google Auth via Lovable Cloud's managed OAuth. Users sign in with Google on the Landing screen before starting the onboarding flow.

**Flow change:**
```text
Landing (hold to enter)
  --> Google Sign-In prompt
    --> Why --> Pillar --> Filter --> Stack --> Pulse --> Outcome
```

- After "hold to enter" completes, user is prompted to sign in with Google (if not already signed in)
- Their Google email becomes the profile identifier (replaces `handle`)
- `phone` field is no longer collected

**Database migration:**
- Add `user_id UUID` column to `profiles` (references auth.users, nullable for now)
- Add `email TEXT` column to `profiles`
- Make `handle` nullable (since new users won't have one)

**Files changed:**
- `Index.tsx` -- add auth state listener, redirect to Google sign-in after landing, use email/user_id instead of handle
- `LandingScreen.tsx` -- no change (hold-to-enter stays)
- New: `src/hooks/useAuth.ts` -- auth state hook
- New: `src/components/AuthGate.tsx` -- Google sign-in prompt component

**Removed from flow:** `AuditScreen.tsx` and `OTPScreen.tsx` stay in codebase but are not used.

---

## 2. "Claim Your Seat" -- Google Calendar Link

The CTA button opens a pre-filled Google Calendar event in a new tab. No API needed -- uses Google's public calendar URL scheme.

**Event details:**
- Title: "Kindred -- The Berlin Table"
- Date: Saturday 1 March 2025, 7:00 PM -- 10:00 PM CET
- Location: QBA, Oranienburger Str. 45, 10117 Berlin
- Description: "One table. Six strangers. No small talk. Your seat has been confirmed."
- Link to Google Maps: https://maps.app.goo.gl/mg9rYYWWQdxF83ey8

**Update OutcomeScreen invitation card:**
- Date row: "Sat, 1 March" / "7:00 PM CET"
- Location row: "QBA, Berlin" with link to Google Maps (clickable)
- Keep the lock icon but change text to "Oranienburger Str. 45"

**Files changed:** `OutcomeScreen.tsx`

---

## 3. Admin Page (`/admin`)

A simple protected admin page showing all signups and their onboarding data.

**Features:**
- Table view of all profiles (email, why, pillar, filters, stack, created_at, table_id)
- Count of total signups
- Button to manually trigger `assign-tables` edge function
- Protected by role check (admin role in `user_roles` table)

**Database setup:**
- Create `app_role` enum and `user_roles` table (per security guidelines)
- Create `has_role` security definer function
- Your user ID gets an admin role inserted

**Files created:**
- `src/pages/Admin.tsx` -- admin dashboard
- Route added in `App.tsx`

---

## 4. Post-Signup Welcome Email

New edge function `send-welcome-email` that fires after profile save. Sends a simple welcome/confirmation email to the user's Google email address.

**Challenge:** We need an email service API key (e.g., Resend). No email service is currently configured.

**Approach:**
- Create `send-welcome-email` edge function
- Set up Resend (free tier: 100 emails/day, more than enough for 50 users)
- I'll walk you through getting a Resend API key and adding it as a secret
- The function sends a minimal email: event confirmation + date + venue + calendar link

**Files created:** `supabase/functions/send-welcome-email/index.ts`

---

## 5. Clean Up SMS/OTP

- Remove OTP-related edge function invocations from the flow
- `send-otp` and `verify-otp` functions stay deployed but are no longer called
- Remove `phone` state from `Index.tsx`

---

## Technical Summary

| Change | Files | Type |
|--------|-------|------|
| Google Auth | `Index.tsx`, new `useAuth.ts`, new `AuthGate.tsx` | Frontend + Cloud config |
| Calendar CTA | `OutcomeScreen.tsx` | Frontend |
| Admin page | New `Admin.tsx`, `App.tsx` | Frontend + DB migration |
| Welcome email | New `send-welcome-email/index.ts` | Edge function (needs Resend API key) |
| DB migration | `profiles` (add user_id, email; handle nullable), `user_roles`, `app_role` enum, `has_role` function | Database |
| Cleanup | `Index.tsx` (remove phone/handle state) | Frontend |

## Sequencing

1. Database migration (user_id, email, user_roles)
2. Google Auth setup + auth hook
3. Update Index.tsx flow (remove handle/phone, use auth)
4. Update OutcomeScreen with real event details + calendar link
5. Build admin page
6. Set up Resend + welcome email function
