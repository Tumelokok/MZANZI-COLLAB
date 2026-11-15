# Final C logo integration

The founder-selected C logo replaces the previous M-shaped branding. The corrected wordmark reads MZANSI. `public/branding/mzansi-c-transparent.png` is the shared PNG with an alpha channel; no white background, tile or enclosing border is added in the interface.

The shared `BrandLogo` component is used in the marketing header/footer, authentication screens and dashboard. A readable Mzansi Collab wordmark sits alongside the mark at navigation sizes. The original black C and cyan/lime edging remain, so the dark body is naturally less pronounced on dark surfaces.

Browser and Apple icons and the Open Graph preview are rendered from the same asset through Next.js image routes. Previous public branding files have been removed; prior versions remain in Git history. The approved white-background source remains in the project design folder outside the web repository.

## Transparency edit

Validation: lint and production build passed. Desktop, 390px mobile and 900px tablet layouts were checked in Chrome; no horizontal overflow was observed. The PNG alpha channel is present. Generated browser/Apple icons return PNGs at 64×64 and 180×180 with transparency. The social preview was visually checked. The authenticated dashboard uses the shared logo component; a live signed-in dashboard was not re-tested for this branding-only change.

Built-in image generation tool, 15 November 2026. Source: corrected founder logo. Final prompt:

Create a production-clean transparent PNG of this EXACT approved logo. Match the reference: oversized thick black tilted C with cyan edging along upper-left outer curve and lower inner curve, lime-green edging along lower-right outer curve and upper inner curve. Same angular ends, same proportions. Exact central bold multicoloured text MZANSI. Remove the white background completely, including inside the C. The result must have perfectly clean vector-like edges and SOLID OPAQUE fills for every letter and the black C. All non-logo pixels must have alpha zero. Absolutely no speckles, stray coloured pixels, flecks, noise, fuzzy residue, wisps or semitransparent white haze. Do not use any texture. Preserve exact approved colours and arrangement. No white panel, no shadow, no new text, no added elements. Transparent background, clean flat logo suitable for placement directly on a dark website.
