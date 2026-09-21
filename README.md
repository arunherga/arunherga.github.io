# Arun Balakrishna Bhat — portfolio

The source for [arunbhat.com](https://arunbhat.com), built with Next.js and exported as static files for GitHub Pages. It has a home page, a separate [Work](https://arunbhat.com/work/) page, an interactive portfolio terminal, skills and certifications, contact links, and GitHub and LeetCode activity panels.

Profile details, skills, certifications, and projects live in `lib/portfolio.ts`. Skills and credentials are based on [Arun's profile README](https://github.com/arunherga/arunherga) and his verified [Microsoft Certified: Azure Fundamentals credential](https://learn.microsoft.com/en-us/users/arunbalakrishnabhat-2012/credentials/f2cd424cf6b1a573). The design uses a light technical canvas and a green terminal, inspired by [sathish404.com](https://sathish404.com/).

The Terminal button opens a full-screen portfolio interface. Try `help`, `skills`, `certifications`, `projects`, or `cd work`; Tab completes commands, arrow keys recall history, and Escape returns to the visual site. On phones, the UI Mode button closes the terminal.

## Project walkthrough

The Work page includes a 32-second illustrated walkthrough made with [Remotion Player](https://www.remotion.dev/docs/player). Each project has its own scene in `components/work-scenes.tsx`: a searchable terminal for kgrep, a resource lifecycle for Terraform, a timing dashboard for Kafka latency, and a daily briefing for recycling intelligence. Chapter metadata and duration live in `lib/work-film.ts`; `components/work-film-player.tsx` connects the scenes to Remotion's frame clock. Visitors can choose a static project preview before loading the player. The player is dynamically imported only after a click. There is no video render service or third-party media request, so GitHub Pages continues to serve the whole site.

Playback has pause, seek, fullscreen, and chapter controls. Choosing a chapter plays that project's scene; reduced-motion visitors see a finished still instead. Playback pauses when scrolled out of view or when the tab is hidden. A text walkthrough and all project descriptions remain available without playback. The latency numbers and records in the illustrations are sample data, not benchmarks or real activity. Keep `remotion` and `@remotion/player` on matching, exact versions when updating.

The homepage's code/build/deploy/observe animation is CSS-only, in `components/hero-signal.tsx` and `app/globals.css`. Its small client controller supports pausing, reduced motion, hidden tabs and off-screen suspension; it does not import Remotion. Recycling project details come from its [repository README](https://github.com/arunherga/plastic-recycling-intelligence).

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
