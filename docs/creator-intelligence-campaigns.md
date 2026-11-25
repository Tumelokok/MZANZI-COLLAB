# Creator Intelligence: private campaign tracker

Implemented locally on 23 November 2026. No deployment, Git push, hosted migration, paid service, or new application dependency is needed for this feature.

## What a creator can do

- Open **Dashboard → Campaign tracker** and record a private brand deal with a brand, title, agreed fee, currency, optional payment deadline and notes.
- Add deliverables with calendar deadlines, mark them published, or undo a mistaken publication mark.
- Record separate payments already received. The deal shows the agreed fee, total received and outstanding balance.
- See the earliest five unpublished deadlines (including overdue work) and unpaid totals on the dashboard. Unpaid totals include amounts not due yet and remain separate for each currency.

Supported currencies are ZAR, USD, EUR, GBP, AUD, CAD, NZD, CHF (two decimal places), JPY (whole units) and KWD (three decimal places). There is no currency conversion. Dates use Africa/Johannesburg; a deliverable is due by the end of its selected calendar day.

The first version keeps the fee and currency fixed. Payment correction/deletion, refunds, attachments, invoices, reminders and payment collection are not included. Payments are records, not bank transfers. No social API or AI calls run for this feature.

## Project locations and privacy

The Next.js app is `web/src/app`. The feature uses the existing `requireAccount`, cookie-based Supabase client and `ActionForm` conventions:

- `src/app/dashboard/campaigns/page.tsx`: deal list and creation.
- `src/app/dashboard/campaigns/[id]/page.tsx`: deliverables and payments.
- `src/app/dashboard/campaigns/actions.ts`: authenticated server actions and validation.
- `src/components/campaign-dashboard.tsx`: creator-only dashboard summary.
- `supabase/migrations/202611220001_creator_campaigns.sql`: tables, row-level security and checked write functions.

Confirmed creator accounts can read only their own campaigns and child records. Businesses, anonymous visitors and other creators cannot access them. Platform admin status does not grant access to other creators’ records. A guessed deal URL returns not found. Nothing is added to public profiles, charts or business views.

Direct table writes are denied. Every write function checks the authenticated creator; the server never accepts a submitted owner ID. Payments inherit the parent deal’s currency, use integer minor units, reject future receipt dates and cannot exceed the remaining fee. A parent-row lock serializes payment writes, and a unique form request ID prevents the same submission being counted twice. The maximum fee is 1,000,000,000,000 minor units.

## Run the automated checks now

From `web/`, with dependencies installed and Node 22.18+ (validated with Node 26):

```bash
npm run lint
npm run test:db
npm run test:campaigns
npm run build
```

The database tests use the existing PGlite dependency, create disposable in-memory PostgreSQL databases, apply the real SQL migrations, and switch database roles/JWT subjects. They do not connect to your `.env.local` Supabase project and need neither Docker nor a Supabase account.

Coverage includes owner lifecycle, known-ID and unfiltered reads across creators, private payment access, forged writes through both SQL and RPCs, business/anonymous/unconfirmed/admin restrictions, payment retries, overpayments, exact minor-unit accounting and published/undo deadline changes. Pure tests cover decimal parsing, currency-separated totals and South African date boundaries. PGlite tests do not simulate simultaneous PostgreSQL connections or the browser session/cookie flow.

## Run the app against a local Supabase database

Keep the existing `.env.local` untouched: it points to the hosted project. The dedicated `dev:campaigns` command reads `.env.campaign-local`, refuses a hosted Supabase URL and overrides the connection only for that process. Stop another Next development server in this checkout first because both use the same build directory.

The included `supabase/config.toml` configures local Auth, Storage, email capture and database migrations. Email confirmation remains enabled. No hosted project link or Supabase login is required.

For this Apple silicon Mac, Supabase CLI 3.2.0 supports an experimental native runtime without Docker. The CLI and service archives download on first use; there are no Supabase usage charges. See the official [native runtime guide](https://supabase.com/docs/guides/local-development/docker-and-native-runtimes). These commands keep service files in an ignored local directory:

```bash
cd "/Users/tumelo/MY CAREER/DEVELOPMENT/MZANZI-COLLAB/web"
export SUPABASE_HOME="$PWD/.supabase-local"
npx --yes supabase@3.2.0 start --runtime native --preparation on-demand
npx --yes supabase@3.2.0 migration up
npx --yes supabase@3.2.0 status
```

With this CLI version, `migration up` targets the local database by default. Do not add `--remote`, link a hosted project, or run `db push` for this local milestone. See the official [CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-up).

If using Docker instead, start a Docker-compatible engine and replace `--runtime native` with `--runtime docker` **before creating the local stack**. An existing stack cannot change runtimes in place. See [Supabase local development](https://supabase.com/docs/guides/local-development).

Create `web/.env.campaign-local` (already ignored by Git) with the **local** API URL and publishable/anon key shown by `status`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:YOUR_LOCAL_API_PORT
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_LOCAL_PUBLISHABLE_OR_ANON_KEY
```

Replace the placeholders. Use the URL printed by the CLI: native stacks may allocate their own ports. Do not use a service-role key or the hosted project’s keys. Then:

```bash
npm run dev:campaigns
```

Open [the local app](http://127.0.0.1:3001). Use **127.0.0.1**, including when opening confirmation links, so the auth cookies and redirect address match. If a service archive download fails, resolve that download before attempting browser testing; the offline database tests still run independently.

## One deal from start to finish

1. Open `/signup`, choose **Creator**, and create a local test account with a new password of at least 12 characters. Use a test address such as `creator-one@example.test`; local messages are captured, not delivered externally. Open the local mail viewer URL printed by Supabase, follow the confirmation link in the same browser, then log in.
2. In **Dashboard → Campaign tracker**, record brand **Demo Brand**, title **Summer launch**, currency **ZAR**, fee **3000.00**, and a payment due date one week from today. Add a private note, then choose **Create private deal**. Expect agreed **ZAR 3,000.00**, received **ZAR 0.00**, outstanding **ZAR 3,000.00** (thousands separators may vary by locale).
3. Add **Instagram Reel** with yesterday’s deadline and **YouTube review** with tomorrow’s deadline. Back on the dashboard, the Reel should appear first and be labelled **Overdue**.
4. Open the deal and record **1000.00**, today’s received date and reference **Deposit**. Expect received **ZAR 1,000.00** and outstanding **ZAR 2,000.00**, also reflected in the dashboard’s **Still unpaid** total.
5. Mark the Reel **Published**. It stays in the deal history, while the dashboard’s next item becomes the YouTube review. **Undo published** returns the Reel to the due list. Mark it published again.
6. Try recording **2000.01**. It must be rejected and the balance must stay **ZAR 2,000.00**. Record **2000.00** with reference **Final payment** instead. Expect two payment records, received **ZAR 3,000.00**, outstanding **ZAR 0.00**, and **Fully paid**. The payment form closes and the deal drops out of unpaid totals.
7. Mark the YouTube review published. The dashboard should have no remaining deadlines for this deal. Refresh the page to confirm the records persist.
8. Copy the private deal URL. In another browser profile, create/confirm a second local creator account. Opening the copied URL must show not found, and this creator’s dashboard must not show the first creator’s deal or payment amounts. The automated database tests independently prove this isolation below the page layer.

Optional currency check: create a USD 300 deal with a USD 100 payment. Its USD 200 balance appears separately from any ZAR balance, without conversion or addition across currencies.

To stop the local services, in the same terminal with `SUPABASE_HOME` still set:

```bash
npx --yes supabase@3.2.0 stop
```

Keep the local data directory to resume later; do not use `db reset` unless you intend to erase your local test data.
