# Community and visual update — 15 November 2026

## Implemented

- Shortened homepage linking to dedicated creator, business and community pages.
- Shared navigation with mobile menu and current-page indication.
- Three equal creator/community/brand features. FIZA has a small founder credit, using the photo supplied by the user unchanged. Display framing uses CSS.
- FIZA's Temu and Game experience is based on the user's statement. It is not described as a platform partnership.
- Ten-logo continuous slideshow with pause control, hover pause, duplicate content hidden from screen readers, and static scrolling under reduced-motion preferences.
- Community circles, collaboration calls and knowledge sharing presented as planned features. Accounts and messaging are not implemented by this update.

## Asset provenance

`public/images/fiza-founder.jpg`: original user-supplied portrait, authorised for this website as FIZA and founder. No face edits or external video upload.

`public/images/creator-community.png`: original image generated using the built-in image generation tool, depicting fictional adults. Prompt:

> Use case: photorealistic-natural. Original wide editorial photograph for Mzansi Collab community website. Four fictional adult South African content creators, diverse women and men, gathered in a warm contemporary creative studio, reviewing a camera together and exchanging ideas over coffee. A candid peer mentoring moment, people listening and laughing naturally, no posed boardroom handshake. Visible camera, laptop, sketchbook. Natural skin detail, warm sunlight, restrained cream, charcoal and gold palette. Wide cinematic 16:9, subjects well spaced, visually strong at small sizes. No text, no logos, no flags, no watermarks. These are illustrative fictional people, not actual members.

The existing creator studio and business collaboration illustrations remain in use. Generated people are identified as illustrations, not actual members.

Brand icons are from [Simple Icons](https://simpleicons.org), stored under `public/brands`. The inspiration strip does not claim partnerships, endorsements or live campaigns. Names and marks belong to their owners; package availability is not partnership permission.

Source URL pattern: `https://cdn.jsdelivr.net/npm/simple-icons@VERSION/icons/SLUG.svg`.

| Version | Slugs |
| --- | --- |
| v16 | adidas, samsung, spotify, netflix, youtube, puma |
| v13 | nike, apple, lg, underarmour |

## Still outstanding

- OpenArt video generation previously reached the account/sign-in step; no video has been generated or added.
- YouTube sections are upcoming-content placeholders, not playable videos.
- GitHub push previously failed with HTTP 403 for the authenticated account. Local development is not a public deployment.

## Validation

- `npm run lint`, `npm run build`, and `git diff --check` passed.
- Browser reviewed the desktop homepage and equal-sized creator cards, plus the community and business mobile layouts at 390px. Home and creator pages also checked for horizontal overflow at 390px; none detected.
- Slideshow pause changed the computed animation state to paused. Mobile menu opened, navigated to business, and closed correctly.
- `docs/community-preview.jpg` records the desktop creator section. Reduced-motion behavior is implemented in CSS; browser preference emulation was not tested.
