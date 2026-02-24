

# Feature Gap Analysis — Kindred V2.1 (Updated 2026-02-24)

## Feature Status Matrix

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Safety Report + Mutual Connect (tables, dialogs, Account UI) | ✅ Done | Build error fixed, `as any` casts removed |
| 2 | Admin Event Selection for Table Assignment | ✅ Done | Select dropdown + event_id passing implemented |
| 3 | Admin Safety Reports Review | ✅ Done | Table with Reviewed/Dismissed actions, profile lookup fixed to `user_id` |
| 4 | Email Notifications for New Invitations | ✅ Done | `assign-tables` sends emails via Resend inline |
| 5 | `send-welcome-email` dynamic event support | ✅ Done | Accepts `event` payload, falls back to default |
| 6 | `RESEND_API_KEY` secret | ✅ Done | Configured |
| 7 | Mobile Viewport Polish | ⚠️ Partial | Admin.tsx header made responsive (`flex-col sm:flex-row`, `w-full sm:w-64`). Other screens already OK. |

---

## Completed Fixes (this session)

1. **Build error** — `SafetyReport.category` changed from union type to `string` in Admin.tsx
2. **Profile lookup bug** — Changed `.in("id", userIds)` to `.in("user_id", userIds)` in Admin.tsx
3. **`as any` casts removed** — Account.tsx now uses typed `supabase.from("safety_reports")` and `supabase.from("connect_requests")`
4. **RESEND_API_KEY** — Secret configured and available to edge functions
5. **Admin.tsx mobile** — Header controls wrapped in `flex-col sm:flex-row`, select changed to `w-full sm:w-64`

---

## Remaining Gaps

### None blocking.

All features from Memory.md are implemented and the build compiles. The only optional improvement is a full mobile audit across all screens, but individual screen review found them already responsive.

---

## Optional Future Enhancements

- Full end-to-end test of email sending via `assign-tables` with a real event
- Resend domain verification for custom "from" address (currently limited to `onboarding@resend.dev`)
- Admin.tsx: pagination for profiles/reports if data grows large
- Accessibility audit (focus management, aria labels)
