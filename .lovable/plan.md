

# Fix: Create Database Tables and Resolve TypeScript Errors

## Root Cause
The `safety_reports` and `connect_requests` tables were never created in the database. The generated Supabase types don't include them, causing all the TypeScript errors.

## Step 1: Database Migration
Create both tables with RLS policies:

**`safety_reports`** — reporter_id, reported_user_id, event_id, category, description, status, unique constraint on (reporter_id, reported_user_id, event_id). RLS: users insert/select own, admins select/update, no delete.

**`connect_requests`** — requester_id, target_id, event_id, unique constraint on (requester_id, target_id, event_id). RLS: users insert own, select where requester or target, admins select, no update/delete.

## Step 2: Fix TypeScript in 3 Files
After migration, the types file auto-regenerates. But to be safe and handle the interim, cast the supabase `.from()` calls using `as any` for the new table names in:

| File | Lines | Fix |
|---|---|---|
| `src/components/SafetyReportDialog.tsx` | 78 | `supabase.from("safety_reports" as any)` |
| `src/components/MutualConnectDialog.tsx` | 43 | `supabase.from("connect_requests" as any)` |
| `src/pages/Account.tsx` | 116-134 | Cast all `.from("safety_reports"/"connect_requests")` calls and data arrays with `as any` |

Once the types regenerate after migration, the `as any` casts can be removed.

## Files Changed

| File | Change |
|---|---|
| **SQL Migration** | Create `safety_reports` and `connect_requests` tables with RLS |
| `src/components/SafetyReportDialog.tsx` | Cast `.from()` call |
| `src/components/MutualConnectDialog.tsx` | Cast `.from()` call |
| `src/pages/Account.tsx` | Cast `.from()` calls and data arrays |

