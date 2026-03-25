# HotText Club MVP (Hyperlocal SMS Deals)

Production-minded MVP for a Phoenix-first, cluster-based SMS daily deals product.

## Stack
- Next.js 14 (App Router)
- Prisma + SQLite (local MVP mode) or PostgreSQL (future prod mode)
- Twilio SMS (with dev fallback)
- QR code generation (`qrcode`)

## What’s included (MVP)
### Public flows
- Home + market landing pages (`/`, `/m/[slug]`)
- Signup + explicit consent + double opt-in (`/signup`, `/confirm`)
- Preference update page (`/preferences`)
- Offer landing page with click tracking + redemption action (`/offer/[campaignId]/[subscriberId]`)
- Unsubscribe page (`/unsubscribe`)

### Admin flows
- Login (`/admin/login`)
- Dashboard (`/admin`) with core KPIs
- Restaurants CRUD-lite page (`/admin/restaurants`)
- Deals create/list + market targeting + QR preview (`/admin/deals`)
- Campaign compose + segment by market + optional zip filter + send-now (`/admin/campaigns`)
- Subscribers list (`/admin/subscribers`)
- Redemptions list + manual log (`/admin/redemptions`)
- Reports with partner-facing summary + ROI proxy (`/admin/reports`)
- Settings: quiet hours, templates, Twilio placeholders (`/admin/settings`)

## Compliance implemented
- Double opt-in status lifecycle (`PENDING -> ACTIVE`)
- Explicit consent capture in signup UX
- Consent logging table (`ConsentLog`)
- STOP / HELP / START handling endpoint (`/api/twilio/inbound`)
- Unsubscribe suppression logic (active+consented recipients only)
- Quiet hours enforcement in send service (`src/lib/sms.ts`)
- Message history logging (`MessageEvent`)
- No sends to unsubscribed users via segmentation query

> Note: Twilio signature verification is recommended before production launch.

## Data model
Main tables:
- `AdminUser`
- `Subscriber`
- `SubscriberPreference`
- `Market`
- `Restaurant`
- `Deal`
- `Campaign`
- `CampaignRecipient`
- `MessageEvent`
- `ClickEvent`
- `RedemptionEvent`
- `ConsentLog`
- `Setting`

See full schema in `prisma/schema.prisma`.

## Local setup (SQLite MVP)
1. Install deps
   ```bash
   npm install
   ```
2. Configure env
   ```bash
   cp .env.example .env
   ```
3. Run Prisma
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
4. Start app
   ```bash
   npm run dev
   ```

SQLite DB file is `dev.db` in the project root.
For production later, switch Prisma datasource back to PostgreSQL and update `DATABASE_URL` accordingly.

## Seed data
`prisma/seed.ts` creates demo-ready data:
- 5 markets/clusters (West Phoenix, Central Phoenix, Scottsdale, Glendale, Peoria/Surprise)
- 10 restaurants
- 32 subscribers
- 12 deals
- 6 campaigns
- baseline message events and consent logs

## Twilio setup
- Fill `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- Configure webhook for inbound replies:
  - `POST /api/twilio/inbound`
- Outbound sends happen from campaign send action (`send now`)

If Twilio credentials are missing, app runs in dev-simulated mode and still logs events.

## Architecture notes
- Hyperlocal segmentation is first-class via `Market` + `DealMarkets` + subscriber market assignment.
- Campaign recipient selection is deterministic and query-driven.
- Event tracking is internal (DB first), no third-party analytics dependency.

## MVP vs future roadmap
### MVP included now
- Manual admin operations for restaurants/deals/campaigns
- Segmented sends by market/zip
- Click and redemption tracking
- Basic ROI reporting

### Future (not built in this MVP)
- Restaurant self-serve portal
- Radius targeting
- Twilio delivery status callbacks
- Rich export formats and BI integrations
- AI beyond simple copy suggestion helper

## Scheduled send hardening
A secured endpoint is included for due scheduled campaigns:
- `POST /api/cron/send-scheduled`
- Header required: `x-cron-secret: <CRON_SECRET>`

You can run it via system cron / Vercel cron every minute.

## Twilio webhook security
Inbound webhook now verifies `X-Twilio-Signature` when `TWILIO_AUTH_TOKEN` is set.
In local dev without Twilio credentials, verification is permissive for testing only.

## Ambiguities handled simply
- Campaign scheduling is stored but send-now is the only execution path in-app.
- AI copy helper is deterministic template generation for predictable ops.
- Estimated CPA uses a simple placeholder spend model in reports for MVP demo speed.
