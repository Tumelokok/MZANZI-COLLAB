# Mzansi Collab web

The public web experience for **Mzansi Collab** — a South African platform in development for creators, brands and businesses to discover meaningful creative collaboration.

## Current status

The public website and Phase 2 account foundation are implemented. Creator/business registration, login, profile dashboards, creator-only tokens, reviewed verification and community-rated discovery connect to Supabase. Campaign management and direct messaging remain planned. No public deployment has been made.

## Run locally

From this `web` directory:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For production checks, run:

```bash
npm run lint
npm run test:db
npm run build
```

## Included in this milestone

- Approved Mzansi Collab logo, browser icons and social sharing image.
- Responsive public landing page with creator and business journeys.
- Dedicated [`/creators`](src/app/creators/page.tsx) and [`/business`](src/app/business/page.tsx) experiences with original campaign imagery.
- YouTube-ready learning and campaign-story placements for future Mzansi Collab video content.
- Mobile navigation and meaningful in-page navigation.
- Accessible focusable controls, semantic sections and reduced-motion support.
- SEO metadata and Open Graph/Twitter metadata.
- Explicit product states so planned platform capabilities are not presented as launched.

## Project notes

- Approved assets live in `public/branding`; their originals remain in the repository-level `mzansi-collab-brand-kit` directory.
- `turbopack.root` points at this app to avoid the parent placeholder lockfile affecting root detection. The production build uses webpack because Turbopack's CSS worker cannot bind its internal local port in this environment.
- Supabase Auth, PostgreSQL and Storage power the account layer. Copy `.env.example` to an ignored `.env.local` for local configuration. See [`docs/platform-phase-2.md`](docs/platform-phase-2.md) for migration, setup, token rules and remaining integration work.

## Documentation

- [`docs/platform-phase-2.md`](docs/platform-phase-2.md) — implemented account layer, setup and validation.
- [`docs/social-platform-capabilities.md`](docs/social-platform-capabilities.md) — follower-sync and task-verification capabilities and provider restrictions.
- [`docs/platform-media-assets.md`](docs/platform-media-assets.md) — original hero and inclusive business imagery, with generation prompts.

- [`docs/phase-1-progress.md`](docs/phase-1-progress.md) — current delivery status and validation record.
- [`docs/architecture-blueprint.md`](docs/architecture-blueprint.md) — proposed next milestone, decisions and approval gates.
- [`docs/media-content-plan.md`](docs/media-content-plan.md) — image and short-form video direction for the public website.
