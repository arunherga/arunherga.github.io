# Arun Balakrishna Bhat — portfolio

The source for [arunbhat.com](https://arunbhat.com), built with Next.js and exported as static files for GitHub Pages. It has a home page, a separate [Work](https://arunbhat.com/work/) page, an interactive portfolio terminal, skills and certifications, contact links, and GitHub and LeetCode activity panels.

Profile details, skills, certifications, and projects live in `lib/portfolio.ts`. Skills and credentials are based on [Arun's profile README](https://github.com/arunherga/arunherga) and his verified [Microsoft Certified: Azure Fundamentals credential](https://learn.microsoft.com/en-us/users/arunbalakrishnabhat-2012/credentials/f2cd424cf6b1a573). The design uses a light technical canvas and a green terminal, inspired by [sathish404.com](https://sathish404.com/).

The Terminal button opens a full-screen portfolio interface. Try `help`, `skills`, `certifications`, `projects`, or `cd work`; Tab completes commands, arrow keys recall history, and Escape returns to the visual site. On phones, the UI Mode button closes the terminal.

## Project walkthrough

The Work page includes an 18-second conceptual walkthrough made with [Remotion Player](https://www.remotion.dev/docs/player). `components/work-film-frame.tsx` contains the visuals and three chapters; `components/work-film-player.tsx` connects them to Remotion's frame clock. The player is dynamically imported only after a visitor clicks the static poster. There is no video render service or third-party media request, so GitHub Pages continues to serve the whole site.

Playback has pause, seek, fullscreen, and chapter controls. It pauses when scrolled out of view or when the tab is hidden. Reduced-motion visitors get a paused player with still chapter diagrams. A text walkthrough and all project descriptions remain available without playback. Keep `remotion` and `@remotion/player` on matching, exact versions when updating.

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

`scripts/generate-activity.mjs` gathers public GitHub contributions and LeetCode submission data and writes static JSON snapshots under `public/activity/`. The build refreshes these snapshots. If either source is temporarily unavailable, the build keeps the last committed snapshot. The panels show activity on the home page without sending visitors to another site. GitHub Actions may disable scheduled workflows after 60 days without repository activity on a public repository; if this happens, re-enable the workflow in the Actions tab.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```
