# Drona CSR site

Standalone, CSR-only build of the Drona CSR use case (`src/app/use-cases/csr`), extracted from
`dronify-prod` and deployed as a static Next.js export to GitHub Pages.

## Develop

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000/use-cases/csr
```

## Build

```bash
npm run build      # static export to ./out (postbuild flattens Next's RSC segment files)
```

Set `NEXT_PUBLIC_BASE_PATH=/<repo>` when building for a GitHub Pages project site.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key (public client key) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingestion host, default `https://us.i.posthog.com` |
| `NEXT_PUBLIC_BASE_PATH` | Sub-path the site is served from |

In CI, the PostHog values come from repository **variables** of the same name.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `out/` to GitHub Pages.
