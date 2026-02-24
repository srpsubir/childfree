

# Implementation Plan: Identity Verification Flow

## Overview

Three changes to ship: a database migration (storage bucket + profile columns), a new `VerificationScreen.tsx` UI component, and wiring it into `Index.tsx`. Plus a quick fix for the build error in `send-welcome-email`.

## Build Error Fix

The `send-welcome-email/index.ts` line 73 has `e.message` where `e` is `unknown`. Will cast it: `(e instanceof Error ? e.message : "Unknown error")`.

## Edge Function Fix

The Claude Code-written `verify-identity` function updates profiles matching on `id` (line 105), but the app uses `user_id` as the identifier. Will fix `.eq("id", user_id)` → `.eq("user_id", user_id)`.

## Database Migration

```sql
-- Add verified columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Create private storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-photos', 'verification-photos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: users upload their own photo
CREATE POLICY "Users can upload own verification photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-photos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: users read their own photo
CREATE POLICY "Users can read own verification photo"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-photos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## New Component: `VerificationScreen.tsx`

Editorial-styled screen matching the existing aesthetic:

- **Header:** "Prove You're Real." (Playfair Display, `gallery-heading`)
- **Subtext:** "One photo. No filters. This is how trust begins." (`gallery-body`)
- **Upload zone:** Large square area with champagne faint border (`border-primary/20`), shows preview when photo selected
- **Input:** Hidden file input accepting `image/*` with `capture="user"` for mobile camera
- **Flow:**
  1. User taps upload zone or "Take a Photo" button
  2. Photo preview appears in the square
  3. User taps "Verify" (`editorial-btn-filled`)
  4. Photo uploads to `verification-photos/{user_id}/selfie.jpg`
  5. Edge function is invoked → AI checks for human face
  6. Success: checkmark + "Verified" badge, auto-advances to Pulse after 1.5s
  7. Failure: error message, option to retry
- **Loading state:** `gallery-label animate-pulse` "Verifying..." while processing
- **Skip option:** None — verification is mandatory for trust

## Index.tsx Wiring

1. Add `"verify"` to the `Screen` type union
2. Import `VerificationScreen`
3. After Auth completes → go to `"verify"` instead of `"pulse"`
4. After Stack completes with existing user → go to `"verify"` instead of `"pulse"` (but skip if already verified)
5. After verify succeeds → go to `"pulse"`
6. Returning user check: if profile has `verified === true`, skip verify screen (go straight to outcome as before)
7. Render verify screen with BackButton pointing to auth

## File Changes Summary

| File | Change |
|---|---|
| `supabase/functions/send-welcome-email/index.ts` | Fix `e.message` type error |
| `supabase/functions/verify-identity/index.ts` | Fix `.eq("id")` → `.eq("user_id")` |
| `src/components/screens/VerificationScreen.tsx` | New file — editorial verification UI |
| `src/pages/Index.tsx` | Add verify screen to flow |
| Database migration | Add columns + storage bucket + RLS |

