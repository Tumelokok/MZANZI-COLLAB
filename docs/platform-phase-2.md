# Accounts, creator economy and discovery

Implemented 15 November 2026. This supersedes the earlier proposed-only architecture for the account/profile layer: Next.js + Supabase Auth, PostgreSQL and Storage.

## Working application paths

- `/signup`: creator or business registration, email confirmation, optional creator referral code.
- `/login`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/auth/confirm`: managed password authentication and recovery. Passwords are never stored in the application database.
- `/dashboard`: authenticated role-specific workspace; creators get profiles, image uploads, platform rates, follower snapshots, rewards, wallet history and review requests. Businesses get profile management and creator discovery, never a token wallet.
- `/chart`: Top 20, Top 100 and verified filters, labelled featured placements, and emerging creators.
- `/members/[id]`: complete published creator profiles, portfolio links, social URLs, starting rates, available follower counts and ratings.
- `/dashboard/admin`: manually assigned reviewers can check ownership evidence, approve/decline requests and moderate abusive ratings. Admin status is not a signup role and cannot be set through user metadata.

## Economy and scoring defaults

| Action | Rule |
| --- | --- |
| Complete profile | 40 tokens once; verified email, 50-character bio, photo, category, city, sample work, social profile(s), positive rate for each, and publication |
| Qualified referral | 30 tokens to the inviter once; invited creator must confirm email, finish profile and be at least 7 days old |
| Featured placement | Spend 60 tokens for 7 days; clearly labelled promotion above the organic chart, no star/rank change |
| Profile verification | 100 tokens charged only on approval; complete profile and independent ownership review required; badge expires after 90 days or profile/link changes |
| Rating | 1–5 stars plus feedback; verified email, a bio and account age >=24h; no self-rating; one editable rating per reviewer/creator |
| Chart rank | Mean stars; at least 3 eligible reviewers. Ties: rating count, then stable account ID. Followers and token spend do not affect score |

Tokens have no cash value and cannot be purchased, transferred or withdrawn. Earned-token verification does not by itself produce monetary revenue. A future paid brand plan is a separate product decision. Account-age gates and uniqueness reduce simple reward farming; they do not establish that every signup is a unique human. Add production abuse detection/rate limits and review suspicious referrals before scaling.

The badge means **profile completeness and account ownership reviewed**, not a background check, platform endorsement or guarantee of content quality/conduct. Reviewers must independently inspect proof for every linked account. Screenshots or claims alone must not automatically award a badge. Verification evidence is private and should contain public links, never passwords or identity documents.

## Social integrations: implemented vs pending

All six profile-link/rate fields are implemented. Arbitrary counts cannot be entered by users. The trusted server has a YouTube Data API refresh action, gated behind `YOUTUBE_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. The provider key must be restricted to the YouTube Data API. The refresh is rate-limited to one attempt per account per 15 minutes; values are rounded provider snapshots. Linking a channel is not OAuth verification of ownership.

Instagram/TikTok/Facebook/X/Snapchat counts still require their respective approved provider integrations. No universal real-time tracking is claimed. Unknown counts stay unknown, never zero; total followers is a sum of available snapshots and is not deduplicated audience reach. The oldest available snapshot timestamp is exposed in the public projection.

Social-follow token rewards are disabled. A click is not proof. Instagram can expose follow status in a consented messaging workflow with approved permissions, but that workflow and a nonce-based identity link are not implemented here. YouTube policies prohibit incentivised subscriptions. See [official-source capability matrix](social-platform-capabilities.md).

## Database and security

Migration: `supabase/migrations/202611150001_platform.sql`. Run once, transactionally, against a new Supabase project. It creates tables, RLS, explicit privileges, an Auth signup trigger, transactional reward/spend RPCs, admin checks and a public avatar bucket. Photo URLs are public and the form explicitly tells users. Images are limited to JPG/PNG/WebP and 3 MB; owner paths are checked both by storage policy and profile mutation.

Every mutation re-verifies the server session, then the database checks the authenticated principal. Clients cannot directly edit wallets, ledger amounts, roles, follower counts, admin membership or badge fields. Ledger event keys are unique and wallets are locked before reward/spend to prevent duplicate claims and negative balances. Private referral data, wallet data and verification evidence are excluded from the public creator projection.

To appoint the founder as a reviewer, first create and confirm the intended app account, then run in the Supabase SQL Editor (substitute the exact account email locally):

```sql
insert into public.platform_admins(user_id)
select id from auth.users where email = 'YOUR_ACCOUNT_EMAIL' and email_confirmed_at is not null
on conflict do nothing;
```

Never grant admin status through a public form or signup metadata.

## Supabase setup

Project: Mzansi Collab, `zzbgxvcnuipebrliwkll`, Free / Nano, Frankfurt. The user created and retained the database password. `.env.local` contains only the project URL, publishable key and local site URL and is ignored by Git. It must not be committed.

The initial migration was applied successfully through the SQL Editor on 15 November 2026 after founder approval. The live public `creator_directory` RPC returned an empty array successfully. This manual SQL application is not registered in the Supabase CLI migration-history table. Site URL is `http://localhost:3000`; the exact signup and recovery callback URLs below are saved in the redirect allow list. Supabase GitHub sign-in is connected; a project-to-repository integration has not been configured.

`202611150002_existing_members.sql` was also applied successfully. It provisions profiles and creator-only wallets for accounts registered before the signup trigger existed, preserving any existing profile and balance. The repeatable backfill is covered by the database test. Existing credentials are unchanged; no admin privileges or verification badges were assigned.

Set Auth Site URL to `http://localhost:3000` for local development and allow `http://localhost:3000/auth/callback` (including the password recovery callback). Keep email confirmation enabled. Before production, configure the actual HTTPS site URL and exact redirects, a production SMTP provider, provider rate limits/CAPTCHA, privacy/terms and content/reporting moderation. Do not disable email confirmation to bypass setup.

For cross-browser email links, the optional templates can point at:

```text
Confirm signup: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
Reset password: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
```

Otherwise the default PKCE confirmation uses `/auth/callback` and must be opened in the same browser that started the request. The reset callback only allows the fixed `/reset-password` destination; external redirects are rejected.

## Validation

`npm run lint`, `npm run test:db` and `npm run build` passed with the project environment configured. Browser checks confirmed business signup selection, the live empty creator chart and unauthenticated dashboard redirect. Full confirmed-email login, uploads and recovery still require a real account walkthrough.

Desktop home/business and 390px mobile home/business layouts were inspected; the mobile menu works and both pages have no horizontal overflow. The business hero switches to a separate image below the text on mobile so both collaborators remain visible.

`npm run test:db` runs the actual migration in isolated PostgreSQL (PGlite), with mocked Supabase auth/storage plumbing. It verifies role protections, private wallets, completion requirements, unique rewards, referral age gates, negative-balance protection, promotion duplication, verification approval permissions/charges, rating limits, self-rating rejection, one rating per member, count-independent score and badge invalidation. It does not replace a live Supabase email-delivery/OAuth integration test.
