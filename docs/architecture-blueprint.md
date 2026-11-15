# Mzansi Collab architecture blueprint (proposal)

**Status:** PROPOSED — founder approval required before implementation.

This document separates confirmed product needs from an implementation direction for Phase 2. It is not a commitment to any provider, pricing model or irreversible schema.

## Confirmed requirements

- Two account types: creators and businesses, with future business team members and role-based permissions.
- Public creator profiles, portfolios, social links and shareable media kits.
- Discovery and filtering, campaign briefs, applications, invitations, collaboration tracking and later payments.
- Secure handling of personal, organisation and portfolio data in a South African context.

## Recommended MVP direction

| Concern | Proposal | Rationale |
| --- | --- | --- |
| Application | Keep Next.js App Router + TypeScript | Already established; supports public pages and authenticated workspaces. |
| Authentication | Managed auth provider with email verification, password reset and social sign-in optional | Avoids custom credential storage and supports role-aware onboarding. |
| Database | PostgreSQL with an ORM and migration history | Strong relational model for users, organisations, campaigns and permissions. |
| File storage | Private object storage with signed upload/download URLs | Suitable for portfolio media, logos and later generated media-kit PDFs. |
| Background work | Provider queue or worker jobs | Needed later for image processing, media-kit generation, notifications and reporting imports. |
| Observability | Error tracking, structured server logs and uptime monitoring | Necessary before production launch; choose a provider during readiness work. |

## Domain outline

Core initial entities: `User`, `CreatorProfile`, `BusinessOrganisation`, `OrganisationMember`, `CreativeCategory`, `PortfolioItem`, `SocialAccount`, `Campaign`, `CampaignApplication`, `CampaignInvitation`, `Collaboration`, `Deliverable` and `AuditEvent`.

Keep public profile data separate from private account/contact data. Permission checks should be server-side and scoped by user and organisation membership, never inferred solely from client routes.

## Suggested sequencing

1. Approve the authentication, database and storage providers.
2. Implement account creation, verified email, creator/business onboarding and protected workspaces.
3. Implement creator profiles and portfolio uploads with public visibility controls.
4. Add creator discovery with indexed, privacy-aware filters.
5. Add campaigns, applications and invitation workflows.

## Decisions requiring approval

- Specific authentication, database, file storage and hosting providers.
- Whether agencies are a distinct account type or a business organisation subtype.
- Creator profile visibility defaults and data retention policy.
- Verification criteria and review workflow.
- Monetisation model, paid tiers and any payment provider.
- POPIA/privacy policy, terms and consent wording reviewed by appropriate counsel.

## Security baseline for the next phase

- Enforce verified email before sensitive workflows.
- Use server-side authorisation for every read/write action.
- Validate uploads by type, size and ownership; store private media behind signed URLs.
- Keep secrets in deployment-managed environment variables; never commit them.
- Add audit events for permission and campaign state changes.
- Establish backups, migration rollback procedures and incident reporting before production data is accepted.
