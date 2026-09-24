# Arun’s private intelligence workspace

A separate Cloudflare Worker displays the daily outputs from `arunherga/global-equity-intelligence` and `arunherga/plastic-recycling-intelligence`. The existing portfolio stays on GitHub Pages. This directory is **not** part of the portfolio's `out/` export.

## What is included

- Equity and recycling collections, dated archives, summary figures, search and filters.
- Expandable explanations, source links, stock-specific impact/direction/confidence, and event history.
- Source failures, partial coverage, stale reports and empty days are displayed explicitly.
- Download the original structured report. Five-minute server caching limits GitHub requests; refreshing does not run the source collectors.
- Initially only `arun.b.bhat@gmail.com` may sign in. There is no public registration.

**The source repositories are currently public.** Protecting this dashboard does not make their committed reports private. Changing repository visibility is a separate decision. This app can later read private repos with a read-only GitHub token stored as a Worker secret.

## Security boundary

Cloudflare Access supplies the login page and one-time email code. The Worker also validates the Access token's RS256 signature, issuer, application audience, expiry, identity, and application-token type, then checks the email allowlist. Missing configuration denies all access. `run_worker_first: true` protects every asset and API path, including direct Worker URLs. Preview URLs are disabled. No client-only password gate, public report export, browser storage, analytics, or report/token logging is used.

Reports are cached server-side for five minutes **after authorization**. Browser responses use `private, no-store`, no-index, a restrictive content security policy, and no cross-origin access headers. Source text is escaped and outbound links allow only HTTP/HTTPS.

## Local checks

Requires Node 22.13 or newer. From this directory:

```sh
npm ci
npm run check
```

For a local-only visual preview, put the actual daily JSON files in the parent repository's ignored `outputs/private-reports/equity.json` and `recycling.json`, then run `npm run preview`. It binds only to `127.0.0.1:4173`, labels itself as an unauthenticated local preview, and is **never** used by the deployed Worker. There is no production auth-bypass flag.

## Connect Cloudflare and publish

1. Create/verify a Cloudflare account and enable the **Free** Cloudflare One / Zero Trust plan. No transfer of `arunbhat.com` is needed for the initial Worker URL. If signup requests payment details, review the selected plan yourself before proceeding.
2. Run `npm run login` and approve Wrangler's login in your own browser. Do not put passwords or API tokens in chat or source files.
3. Run `npm run deploy`. The initial deployment returns **503** to every request until Access is configured; it does not expose reports.
4. In **Workers & Pages → arun-private-intelligence → Access**, protect this Worker including production (not previews only). If this interface is unavailable, create a self-hosted Access application covering the exact production `workers.dev` hostname. Never add a bypass policy.
5. In Cloudflare One, configure **One-time PIN** as a login method. Create an **Allow** policy whose **Emails** include only `arun.b.bhat@gmail.com`. Use a reasonable session duration such as 8 hours. Do not use “Everyone” or an entire email domain. New accounts may require adding One-time PIN explicitly.
6. Copy the organization/team hostname (`your-team.cloudflareaccess.com`) and the application's **AUD** tag into `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in `wrangler.jsonc`. These identifiers are not passwords. Keep `ALLOWED_EMAILS` set to the owner. Redeploy using `npm run check` then `npm run deploy`.
7. Verify in a signed-out browser that the homepage, `/app.js`, `/api/reports?kind=equity`, and a direct report URL cannot be read. Sign in with the owner email and verify both reports and downloads. Verify an unapproved identity is denied. **Do not add a live portfolio link until these checks pass.**
8. Once verified, link the deployed URL from the portfolio. A later `reports.arunbhat.com` custom domain requires separate DNS/Cloudflare zone setup; do not change existing domain records just to enable this first version.

Optional: to increase GitHub rate limits or read private repositories, set `GITHUB_TOKEN` through `npx wrangler secret put GITHUB_TOKEN`. Use a fine-grained token limited to Contents: read for these two repositories. It is only sent to the fixed GitHub API host; never put it in `vars` or browser code.

To admit another person later, add their specific email to both the Access Allow policy and the Worker's `ALLOWED_EMAILS`, then redeploy. Revoke a user's Access session when removing access. No deployment workflow is enabled automatically; publishing requires your authenticated Cloudflare session.

## Official references

- [Worker-level Access protection](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
- [Validate Access JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [One-time PIN setup](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Run the Worker before static assets](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Cloudflare plan limits](https://www.cloudflare.com/plans/)
