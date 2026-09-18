# Arun Balakrishna Bhat — portfolio

The source for [arunbhat.com](https://arunbhat.com), built with Next.js and exported as static files for GitHub Pages. It has a home page, a separate [Work](https://arunbhat.com/work/) page, a portfolio terminal, contact links, and GitHub and LeetCode activity panels.

## Run locally

Use Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. To create the publishable files, run `npm run build`; the result is in `out/`.

## Publishing

The workflow in `.github/workflows/pages.yml` builds and deploys the site on pushes to `main` and every six hours. In the repository's **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. Set the custom domain to `arunbhat.com` there. The `public/CNAME` file documents the intended domain, but the Pages setting is required for an Actions deployment.

For an apex domain, add these four `A` records at the domain's DNS provider:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

If `www.arunbhat.com` should work too, point its `CNAME` to `arunherga.github.io`. Remove conflicting records for the same host. Wait for DNS to resolve to GitHub Pages and enable **Enforce HTTPS** in Pages settings when it becomes available. Keep the existing hosting active until the new site works at the custom domain.

## Activity panels

`scripts/generate-activity.mjs` gathers public GitHub contributions and LeetCode submission data and writes static JSON snapshots under `public/activity/`. The build refreshes these snapshots. If either source is temporarily unavailable, the build keeps the last committed snapshot. The panels show activity on the home page without sending visitors to another site. GitHub Actions may disable scheduled workflows after 60 days without repository activity on a public repository; a new commit or a manual workflow run restores refreshing.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```
