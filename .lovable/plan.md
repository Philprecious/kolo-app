
## Goal

Move KÒLÓ off local React state onto Lovable Cloud with real auth, a real data model, and a working contributions engine. Payments provider integration, KYC, and SMS stay out of scope — flagged as follow-ups.

## 1. Enable Lovable Cloud

Turn on Cloud so we get Postgres + Auth + storage.

## 2. Auth (email + password, profiles table)

- Email/password sign-up + sign-in + password reset page at `/reset-password`.
- `profiles` table (`id → auth.users`, `display_name`, `phone`, `avatar_url`, `created_at`) with RLS + auto-create trigger on signup.
- `user_roles` table + `app_role` enum (`admin`, `member`) — **per circle**, so roles table is `circle_members` (see §3).
- Replace the current cosmetic `auth.login` with real Supabase auth; route `/auth` becomes the real sign-in/up screen; onboarding completion just flips a profile flag.
- `_authenticated` route group gates the app (Cloud integration ships the layout).

## 3. Data model (migration)

```text
profiles(id pk → auth.users, display_name, phone, avatar_url, onboarded, created_at)

circles(id, name, description, target_amount, contribution_amount,
        frequency: 'daily'|'weekly'|'monthly', start_date, payout_order: uuid[],
        created_by → auth.users, created_at)

circle_members(id, circle_id, user_id, role: 'admin'|'member',
               position int, joined_at, unique(circle_id,user_id))

cycles(id, circle_id, cycle_number, due_date, payout_user_id, status:
       'upcoming'|'active'|'completed', created_at, unique(circle_id,cycle_number))

contributions(id, cycle_id, member_id → circle_members, amount, status:
              'pending'|'paid'|'late'|'missed', paid_at, note)

activity(id, circle_id, actor_id, kind: 'created'|'joined'|'paid'|'payout'|'notified'|'invited',
         payload jsonb, created_at)

notifications(id, user_id, circle_id, kind, title, body, read_at, created_at)

invitations(id, circle_id, code unique, created_by, expires_at, used_at, used_by)
```

- RLS: members see their circles; only admins mutate circle config, generate cycles, or send notify-to-pay.
- `has_role_in_circle(circle_id, role)` security-definer function to keep policies non-recursive.
- Grants for `authenticated` on every public table, `service_role` for all.
- Trigger on `circles` insert: creator becomes admin member at position 0.
- Function `generate_cycles(circle_id)` computes due dates from `start_date` + `frequency` and pre-creates `cycles` + `contributions` rows in `pending` for each member.
- Seed migration: on first sign-in, if the user has zero circles, insert one demo circle + 2 mock members + first cycle's contributions (all still owned by the user so RLS holds).

## 4. Server functions (`createServerFn`)

- `listMyCircles`, `getCircle(id)`, `createCircle`, `joinCircleByCode`, `leaveCircle`.
- `markContributionPaid(contributionId)` — member marks own; admin can mark any.
- `notifyUnpaidMembers(circleId, cycleId)` — **admin only** (verified with `has_role_in_circle`); inserts `notifications` rows for every member with status `pending`/`late` in the current cycle and logs an `activity` row.
- `getActivityDetail(id)` for the activity detail route.
- `getMyNotifications`, `markNotificationRead(id)`.

All privileged fns use `requireSupabaseAuth`, verify role via `context.supabase.rpc('has_role_in_circle', ...)` before any `supabaseAdmin` use.

## 5. Client rewiring

- Replace `useApp` local store with TanStack Query calls to the server fns; keep the same hook name/shape so components change minimally.
- Admin/member split already exists in UI — just read `role` from `circle_members`.
- Bell icon → real notifications list, unread count, mark-read on open.
- Recent activity `>` already routes to `/activity/$id` — swap it to server data.
- Circle counts (1 admin / N members) driven by real `circle_members` rows so the "you created it, count it" bug is gone.
- Profile settings pages: notifications toggle → column on `profiles`, security/PIN → column (hashed) on `profiles`, account settings → edit `profiles`, help & support already static content.

## 6. Out of scope (called out to user, not built)

- Real payments (Nomba/Paystack webhooks) — needs your merchant account.
- KYC / BVN checks — needs provider.
- SMS / email delivery of notifications — needs provider; in-app notifications work.
- Audit log for admin actions — can add after payments.

## Verification

- Sign up → land on onboarding → complete → home shows empty state + seeded demo circle.
- Create a circle → you appear as admin, count reads "1 admin, 1 member".
- Invite code → second account joins → count updates for both users on refresh.
- Only admin sees "Notify" button; hitting it creates rows in `notifications` for unpaid members.
- Activity `>` opens detail from DB.
- Sign out → protected routes redirect to `/auth`.
