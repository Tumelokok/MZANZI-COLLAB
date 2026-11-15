# Mzansi Collab web

The public web experience for **Mzansi Collab** — a South African platform in development for creators, brands and businesses to discover meaningful creative collaboration.

## Current status

Phase 1, the branded public website, is implemented. It includes a public landing page plus dedicated journeys for creators and businesses. Registration, authenticated creator discovery and campaign management are still to be built.

## Run locally

From this `web` directory:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For production checks, run:

```bash
npm run lint
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
- Architecture choices for the product backend require founder approval before implementation. See [`docs/architecture-blueprint.md`](docs/architecture-blueprint.md).

## Documentation

- [`docs/phase-1-progress.md`](docs/phase-1-progress.md) — current delivery status and validation record.
- [`docs/architecture-blueprint.md`](docs/architecture-blueprint.md) — proposed next milestone, decisions and approval gates.
- [`docs/media-content-plan.md`](docs/media-content-plan.md) — image and short-form video direction for the public website.
