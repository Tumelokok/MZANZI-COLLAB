# Phase 1 — Brand integration and public website

**Status:** TESTED

## Delivered

- Integrated the approved horizontal logo, mark, favicon, Apple touch icon and social preview artwork without redesigning those assets.
- Replaced the Next.js starter screen with a responsive public landing page.
- Added creator and business value propositions, platform workflow, creative categories, future feature states, trust principles, CTA and footer.
- Added responsive mobile navigation, semantic anchors, focusable links/buttons and reduced-motion handling.
- Set Mzansi Collab metadata, Open Graph metadata and South African English document language.
- Set the Turbopack root to the `web` app, addressing the outer empty lockfile’s root-detection warning.

## Deliberately not implemented

- Authentication, registration and account onboarding.
- Creator directory, real profiles, media kit builder and opportunity publishing.
- Real analytics, verification, messaging, payments, legal pages or contact information.

The landing page labels the product as in development and marks future capabilities as `PLANNED`, `IN DEVELOPMENT` or `FUTURE`; it does not represent static mockup content as functioning product features.

## Asset provenance

Runtime assets are copied from the approved `../mzansi-collab-brand-kit/website-nextjs` package:

- `public/branding/logo-dark-header.png`
- `public/branding/mark.png`
- `public/branding/og-image.png`
- `src/app/favicon.ico`
- `src/app/icon.png`
- `src/app/apple-icon.png`

## Verification record

Completed from `web/` after the final source change:

```bash
npm run lint
npm run build
npm audit --omit=dev
```

All checks completed successfully. The `build` script intentionally uses Next.js's webpack compiler: the default Turbopack production compiler reached the application but failed in this environment while binding an internal local CSS-worker port. Webpack completed the full TypeScript and production prerender validation successfully.

The production dependency audit returned zero vulnerabilities. `npm audit` still reports seven moderate `minimatch` findings through `typescript-eslint` development dependencies; `npm audit fix` is available, but should be evaluated with a focused dependency update and lint/build regression check rather than a forced update.
