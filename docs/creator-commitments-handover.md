# Resuming the creator commitments pilot

## User task

A creator promises a video and a link placement to the same brand. From the creator dashboard, record the two deliverables separately. Reschedule the video, mark it delivered and check that the placement still appears among the open commitments. Reopen the video if the brand requests another edit.

## Where the work lives

| Question | Entry point |
| --- | --- |
| How does a creator reach the list? | `src/app/dashboard/page.tsx` links to `/dashboard/commitments`. |
| Who may read and change a record? | `supabase/migrations/202611220001_creator_commitments.sql` defines ownership policies and column grants. The server actions also require a creator account. |
| How are duplicates handled? | Each new form has a server-generated ID. A replay of the same submission hits the primary key. A fresh form can record another deliverable for the same brand. |
| How do I check the change? | Run `npm run test:db`, `npm run lint` and `npm run build`. The database suite applies the migrations to a temporary PostgreSQL-compatible database and checks account isolation. |

## Pilot evidence still needed

Apply the migration after the existing account migrations in a development Supabase project. Sign in as a creator, complete the example above, reload the page and confirm that both records retain their separate states. Sign in with a business account and confirm the route returns to the dashboard.

Ask a creator to try this on a collaboration and observe whether they return for a second one. Record the follow-up they could complete, the information they still had to look up and any friction entering a second deliverable. Anonymise the notes. Fee tracking, proof-of-post and payment reconciliation are candidates for a later iteration.
