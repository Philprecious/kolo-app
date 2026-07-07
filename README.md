# KÒLÓ — Digital Savings Circles

<div align="center">

### DevCareer × Nomba Forward Hackathon 2026
**Track · Build &nbsp;|&nbsp; Focus Area · Virtual Accounts as Infrastructure &nbsp;|&nbsp; Role · Product Designer &nbsp;|&nbsp; Mode · Solo**

### 🔗 [Live Demo → kolo-app.lovable.app](https://kolo-app.lovable.app)

</div>

---

## What is KÒLÓ?

The word **kòló** is Yoruba for a piggy bank — a small clay pot where you drop coins every day, trusting that small consistent actions add up to something meaningful. That is exactly what this app does, but at scale.

KÒLÓ digitizes the **ajo and esusu** — rotating savings circles that have existed across West Africa and its diaspora for generations. A group of trusted people contribute a fixed amount on a regular schedule. Each cycle, one member receives the full pot. The rotation continues until everyone has been paid once.

Today, most of these circles run entirely on WhatsApp messages, verbal trust, and screenshots as proof of payment. Disputes happen. Money gets lost. Trust breaks down.

**KÒLÓ fixes this.** Every member gets a unique Nomba virtual account number. When they transfer money into it, the system automatically detects the payment, matches it to the right person and cycle, and updates their status — no screenshots, no "I sent it," no manual tracking.

---

## The Problem It Solves

| Without KÒLÓ | With KÒLÓ |
|---|---|
| "I sent the money" with no proof | Every transfer auto-recorded to a unique account |
| Admin manually tracks payments | System reconciles payments automatically |
| Disputes over who paid what | Full transaction history with timestamps |
| WhatsApp reminders go ignored | Built-in reminder system with live member status |
| No visibility into group progress | Live dashboard showing collected vs. expected |
| Payout based on verbal agreement | Transparent fixed rotation everyone can see |
| One payment channel for the whole group | Each member has their own unique account number |

---

## Who It Is Built For

KÒLÓ was designed for savings groups — cooperatives, market associations, church groups, family circles, and friend groups who already run rotating savings informally and want to bring it online without losing the community trust that makes it work.

The product is built around a universal savings behaviour. The infrastructure underneath it — Nomba virtual accounts, webhooks, and automated reconciliation — makes it work reliably at any scale.

---

## Two Users, One Account

A single KÒLÓ account can hold multiple roles across multiple groups simultaneously.

**Group Admin** — the person who creates and organizes the circle. They set up the group, invite members, monitor payments, send reminders, and approve payouts. When you create a group, you are automatically also a contributing member of it. Your admin dashboard and your personal contribution view live side by side in a single tab-based interface.

**Group Member** — anyone contributing to a circle. They get a unique virtual account number, pay into it via any bank app, and track their own contribution status and payout position in real time.

---

## Key Features

**For Members**

- Unique virtual account number tied exclusively to their contribution — no shared accounts, no ambiguous transfers
- Automatic payment reconciliation the moment a transfer lands — status updates instantly
- Clear payment flow showing exactly how much is due and where to transfer it
- Payout tracker showing their position in the rotation and expected payout date
- Full contribution history per cycle
- Optional auto-debit via Nomba Mandates so they never miss a cycle

**For Admins**

- Live dashboard showing total members, how many have paid, how many are pending, and total collected vs. expected this cycle
- Members list with per-member payment status and inline reminder buttons for members who are short or overdue
- Webhook event log showing every inbound payment with security verification status and reconciliation outcome
- Payout queue showing the full rotation timeline — past recipients, current recipient with live collection progress, and upcoming members
- Account name verification before every disbursement — transfers are irreversible, so verification always comes first
- The disburse button only unlocks when 100% of the cycle is collected

**For Both**

- One account that shows admin controls and personal contribution status side by side for any group where both roles apply
- Notifications for payment confirmations, cycle openings, payout disbursements, and late payment reminders

---

## Nomba Integration

All 14 criteria from the Nomba API judging specification are addressed in the product — surfaced visually in the UI so the financial logic is transparent to users and reviewers alike.

| # | Criterion | How KÒLÓ Addresses It |
|---|---|---|
| 1 | Webhook Idempotency | Every event stores a unique requestId. Duplicate events are blocked and shown as "DUPLICATE — BLOCKED" in the webhook log |
| 2 | Underpayment & Overpayment | Four statuses: Paid, Partially Paid (deficit shown), Overpaid (surplus credited forward), Overdue (balance stacks, never resets) |
| 3 | HMAC-SHA256 Webhook Security | Every event in the webhook log shows a verified or failed HMAC badge |
| 4 | client_credentials OAuth2 | Server-to-server auth flow with no user interaction required |
| 5 | Token Caching | Live token countdown badge on the admin dashboard, refreshes before the 55-minute mark |
| 6 | Sub-account Isolation | Each member backed by a Nomba sub-account with a stable reference mapped to their internal member ID |
| 7 | Kobo Currency Units | Every amount processed and displayed in kobo alongside the naira equivalent |
| 8 | Account Resolution Before Transfer | Nomba's bank lookup endpoint called before every disburse — recipient name confirmed first |
| 9 | Mandates for Recurring Payments | Optional auto-debit on join, active mandates visible on the profile screen |
| 10 | merchantTxRef for Reconciliation | Generated internally and shown on every payment receipt as the reconciliation anchor |
| 11 | Mandate Limit Changes | Profile screen notes that a contribution amount increase requires a fresh mandate for re-consent |
| 12 | Sandbox Environment | Persistent sandbox badge across all admin screens |
| 13 | Core HTTP Headers | Authorization and accountId headers displayed in the admin auth panel |
| 14 | BNPL Architecture | Mandates + Direct Debits + Transactions pipeline implemented for the auto-collection feature |

---

## Product Rules

These rules are built into the product logic and cannot be bypassed.

- A payout only unlocks when 100% of the cycle's expected total is collected — no partial disbursements
- Rotation order is fixed by join date — no lottery, no randomization
- When a cycle closes, the next one opens automatically and all members reset to Pending
- Underpaid balances carry forward and stack onto the next cycle — they never silently reset to zero
- Overpaid surplus is credited to the next cycle by default, with a refund option available
- Duplicate webhook events are blocked and logged — not silently dropped
- Account name verification is called before every payout without exception
- The merchantTxRef is always generated internally to remain stable across payment retries

---

## Screens

The app contains 17 screens across the full user journey.

**Entry** — Splash, Onboarding (4 illustrated slides), Auth (Sign Up / Sign In)

**Home** — Dual-role dashboard showing all groups, roles, and current statuses at a glance

**Admin** — Create Group, Invite Members, Admin Dashboard, Members List, Webhook Event Log, Payout Queue, Disburse Confirmation

**Member** — Join Group Preview, Pay Flow, Payment Success

**Shared** — Group Hub, Profile, Notifications

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Design | Figma |
| API Target | Nomba Virtual Accounts API (Sandbox) |
| State | React useState with simulated webhook payloads |

---

## Hackathon Details

| | |
|---|---|
| Event | DevCareer × Nomba Forward Hackathon 2026 |
| Track | Build |
| Focus Area | Virtual Accounts as Infrastructure |
| Primary Role | Product Designer |
| Mode | Solo |
| Build Sprint | July 1 – 7, 2026 |
| Demo Day | July 19, 2026 |

---

## Designer

**Precious Philip** — Lead Product Designer

Built KÒLÓ as a solo submission, owning the full product lifecycle from research and information architecture through high-fidelity UI design and front-end implementation. The goal was not just to build something that looks good — but to design something that solves real trust and accountability problems in savings circles, and makes the financial infrastructure underneath it visible and legible to every person who uses it.

---

<div align="center">

*"Kòló means piggy bank. In this context, it means trust at scale."*

</div>
