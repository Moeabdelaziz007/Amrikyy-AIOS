# Deployment & Build Notes — Amrikyy-AIOS

This document records the recent Vercel/Storybook changes and contains step-by-step instructions to build, deploy, and troubleshoot the frontend (Storybook static site) for the Amrikyy-AIOS monorepo.

## Summary of recent fix

- The monorepo uses `packages/ui` for the Storybook UI package. Vercel previously used an incorrect build configuration which caused repeated build errors.
- `vercel.json` was updated to run the Storybook build in `packages/ui` and to use the Storybook static output folder as the deployment `outputDirectory`.

Key values used in `vercel.json`:

- buildCommand: `cd packages/ui && npm run build-storybook`
- outputDirectory: `packages/ui/storybook-static`

This change ensures Vercel runs the Storybook static build and deploys the generated `storybook-static` folder.

## Local build & verification

From the repo root, you can run the local Storybook build to verify everything is configured correctly:

```zsh
cd packages/ui
npm ci
npm run build-storybook
```

After a successful build the static site will be at:

```
/path/to/repo/packages/ui/storybook-static
```

You can quickly preview the static build locally (simple static server):

```zsh
npm install -g serve   # optional, if you don't have a static server
serve packages/ui/storybook-static
# or: npx http-server packages/ui/storybook-static
```

Open the served URL in your browser to sanity-check assets and routes.

## GitHub → Vercel automated deployment

- The repo is connected to Vercel. A push to `main` should trigger a Vercel build using the `vercel.json` configuration.
- If you push and the build doesn't start or fails with a rate-limit error, see the Troubleshooting section below.

## API rewrites and backend (Render)

- The project proxies API requests to a backend on Render. `vercel.json` includes rewrites for `/api/*` to the Render service URL (e.g. `https://amrikyy-agent.onrender.com`).
- Ensure environment variables required by the UI or rewrites are set in the Vercel project settings.

### Troubleshooting / Notes

- Vercel free plan: there is a daily limit on the number of deployments (the CLI and platform may return "Resource is limited - try again" when exceeded). If you hit this, you can:
  - Wait for the limit to reset (usually within 24 hours),
  - Retry a smaller number of pushes or use the Vercel dashboard to re-trigger a single deployment, or
  - Upgrade the Vercel plan to raise deployment limits.

- If a deployment shows `Error` in the Vercel dashboard, inspect the build logs in Vercel or locally build Storybook (above) and compare.

- Common local fixes:
  - Ensure Node.js version matches the repo's `.nvmrc` or expected Node version.
  - Run `npm ci` inside `packages/ui` to ensure clean installs.
  - If assets are missing during build (fonts, images), confirm paths are correct and present in `packages/ui`.

## Quick checklist for a successful deploy

1. Commit and push changes to `main` from the monorepo root.
2. Ensure `vercel.json` contains the buildCommand and outputDirectory shown above.
3. Confirm required environment variables are set in the Vercel project.
4. If Vercel returns a resource limit error, wait or upgrade the plan.

## Contact / next steps

If you'd like, I can:

- Re-run a production deploy once your Vercel quota resets.
- Add a CI job that builds Storybook and uploads the static output to a storage bucket (S3/Cloudflare/R2) as an alternative to Vercel if you prefer to avoid rate-limit issues.

---

File created: `DEPLOYMENT.md` — placed in the repository root.
