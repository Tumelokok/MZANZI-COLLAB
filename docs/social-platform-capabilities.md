# Social platform integration boundaries

Checked against official documentation on **15 November 2026**. This is an implementation plan, not a claim that any OAuth app, external connection or background sync is already configured.

## Capability matrix

| Platform | Follower metric and access | Can we verify a specific follow? | MVP decision |
| --- | --- | --- | --- |
| Instagram | Professional creator/business accounts can connect through Instagram Login; `instagram_business_basic` is the basic permission. IG User exposes `followers_count`. Personal-account coverage must not be promised through this professional API. Production access to third-party accounts needs the relevant Meta review/access approvals. | **Conditionally.** The separate Instagram Messaging User Profile API exposes `is_user_follow_business`, but only for a consenting messaging customer identified by an Instagram-scoped ID. This is not a generic username-to-follow-status endpoint. The documented Facebook Login/Page-token route needs messaging and Page permissions. | Accept profile links now; label counts unavailable until a working authorised connector exists. Do not award follow tokens from a click, a screenshot, or a count change. A future messaging integration would need a one-time account-linking nonce, trusted webhook verification and policy approval for the incentive. |
| TikTok | `/v2/user/info/` returns `follower_count` with approved `user.info.stats` scope and the creator's OAuth consent. Scopes must be approved for the app and separately granted by the user. | Ordinary Display API scopes expose totals, not a general following-list/status endpoint. Research or region-specific portability access is not a substitute for an ordinary commercial app's permissions. | Add links; enable automatic counts only after Login Kit/scopes approval and token storage are implemented. Keep follow-for-token tasks disabled. |
| YouTube | `channels.list` with `statistics` returns subscriber counts; public counts are rounded to three significant figures, and hidden/unavailable counts require distinct handling. Use OAuth to establish channel ownership; a public channel lookup alone does not prove ownership. | Technically, OAuth-authorised `subscriptions.list(mine=true, forChannelId=...)` can inspect the authenticated user's subscription to a target channel. **Do not turn that into a token reward:** YouTube's API policy explicitly prohibits rewards for subscribing, liking, sharing, commenting and other engagement. | Counts can be a scheduled API snapshot. No rewarded subscribe tasks. Public follower display must identify this as a subscriber metric. |
| Facebook | Graph API Page data includes `followers_count`. Page-owned data requires the relevant permissions/token and Page task access. Access to unrelated public Pages requires approved public-data features. Do not promise arbitrary personal-profile follower analytics. | Page likes and follows are not interchangeable. The Page count endpoint is not proof that a particular logged-in creator follows the Page. No general individual-follow check is established by the reviewed Page documentation. | Support creator-owned Facebook Page links, with counts pending app permissions and Page connection. No automatic follow reward without an approved supported mechanism. |
| X / Twitter | User lookup accepts `user.fields=public_metrics` and returns `followers_count`. Requires developer/project access and API credentials; availability, cost and quotas depend on the approved account/access plan. | Follows endpoints expose follower/following lists, allowing a server to check a target ID when permitted. Ownership still requires authorisation; someone typing a username is not identity proof. | Enable only with configured access and rate limits. Keep token-for-follow tasks disabled: X's authenticity rules prohibit coordinated engagement exchanges including follows. |
| Snapchat | Public Profile API exposes optional `subscriber_count`. Public endpoints need app-level access tokens; authorised endpoints need creator OAuth/opt-in. Current setup documentation says Public Profile API access is allowlist-only. | The reviewed Public Profile API documents aggregate subscriber data, not a general individual subscriber-membership check. | Support Public Profile links. No counts or follow verification claims until allowlisted integration exists. Preserve unavailable counts as unknown, not zero. |

## Official references

- Instagram: [Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login), [IG User fields](https://developers.facebook.com/docs/graph-api/reference/shadow-ig-user), [Messaging User Profile API and consent](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/user-profile), [Meta permissions and App Review](https://developers.facebook.com/documentation/development/permissions).
- TikTok: [Get User Info](https://developers.tiktok.com/docs/en/tiktok-api-v2-get-user-info), [Scopes and app/user authorisation](https://developers.tiktok.com/docs/en/scopes-overview), [TikTok's explanation of deceptive behaviour and artificial engagement](https://newsroom.tiktok.com/how-tiktok-counters-deceptive-behaviour?lang=en-150).
- YouTube: [Channel statistics](https://developers.google.com/youtube/data/reference/rest/v3/channels), [Subscription lookup](https://developers.google.com/youtube/data/reference/rest/v3/subscriptions/list?hl=en), [Developer policies, playback integrity and engagement rewards](https://developers.google.com/youtube/terms/developer-policies?hl=en), [Push notification events](https://developers.google.com/youtube/data/guides/push_notifications).
- Facebook: [Page fields and access requirements](https://developers.facebook.com/docs/graph-api/reference/page/), [Permissions](https://developers.facebook.com/documentation/development/permissions).
- X: [User lookup](https://docs.x.com/x-api/users/lookup/introduction), [Follows](https://docs.x.com/x-api/users/follows/introduction), [Authenticity policy](https://help.x.com/en/rules-and-policies/authenticity).
- Snapchat: [Access and OAuth prerequisites](https://developers.snap.com/marketing-api/Public-Profile-API/GetStarted), [Profile fields](https://www.developers.snap.com/marketing-api/Public-Profile-API/Profiles).

## Sync model

Promise **periodic syncing**, not universal real-time tracking. Use background jobs with per-provider budgets, bounded retries/backoff, token refresh and a manual refresh cooldown. Show `last_synced_at`, status and source per account. YouTube's documented push notifications cover video uploads/title/description updates, not subscriber-count updates. Other providers' metrics endpoints do not establish an across-platform instant-counter guarantee.

Display the sum as **combined platform followers/subscribers**, not unique audience or unique reach: the same person may follow a creator on multiple services. Separate missing accounts from zero counts. Preserve the last successful snapshot on provider failure and show it as stale; never silently replace an error with zero. Avoid double-counting an identical provider account attached twice. Do not accept user-entered totals as API-verified statistics.

## Token task and badge design

Use first-party events for initial rewards: verified email, completed profile with rates, an accepted eligible referral, or an approved portfolio milestone. Award on a server-checked transition exactly once, not on a browser assertion or on sending an invite alone. Bind referrals to a distinct newly registered creator; prevent self-referrals and repeat rewards. Do not reward rating submissions or favourable ratings, which would distort the chart.

Keep unsupported social-follow tasks inactive. A manual screenshot review is a manual review, not automatic proof, and does not remove a platform's restrictions on incentivised engagement. Specifically, YouTube subscriber rewards should remain unavailable even if the technical subscription lookup is implemented.

Separate token-purchased featured placement from the earned star-rating chart. Explain badge criteria. A profile-completeness review should not be described as identity verification, a guarantee of trustworthiness, or a platform-native verified badge. Earning points alone is not evidence of identity or content quality.

## Suggested interface wording

- Disconnected: “Profile link saved. Automatic follower syncing is not connected yet.”
- Connected: “Synced from [platform] · Updated [date/time].”
- Stale: “Last available count shown. We could not refresh this account.”
- Combined total: “Combined platform audience. People may follow you on more than one platform.”
- Unsupported reward: “This task is not available for automatic verification. No tokens are awarded for opening the link.”
- Badge: “Profile reviewed: required profile details, portfolio and rates checked by Mzansi Collab. This is not a social-network verification badge.”
