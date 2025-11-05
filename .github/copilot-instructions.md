# Copilot Instructions for Amrikyy-AIOS

## Big Picture Architecture
- The project is a modular AI OS with a React/TypeScript frontend and a Node.js backend (see `App.tsx`, `backend/README.md`).
- Frontend components are organized in `components/`, with context providers in `contexts/` and utility functions in `utils/`.
- Backend API endpoints are in `backend/src/`, supporting AI features and integration proxies.
- Integration analysis and strategy documents are in `analysis-results/` and `REPOSITORY_INTEGRATION_ANALYSIS.md`.

## Developer Workflows
- **Build:** Use `pnpm` for package management. Build scripts are defined in `package.json` and subproject configs.
- **Test:** Run frontend tests with `pnpm test` or `pnpm vitest`. Backend tests use Jest + SuperTest (`pnpm test` in `backend/`).
- **Debug:** Use Vite for local frontend dev (`pnpm dev`). Backend debugging is via Node.js scripts in `backend/`.
- **Integration:** Follow the checklist in `analysis-results/INTEGRATION_CHECKLIST.md` and use `scripts/compare-repositories.sh` for repo analysis.

## Project-Specific Conventions
- **Component Naming:** Use PascalCase for React components. Place related tests in the same directory with `.test.tsx` suffix.
- **Context Usage:** Centralize auth and global state in `contexts/` (see `AuthContext.tsx`).
- **Type Definitions:** Shared types are in `types.ts` and subproject-specific files.
- **Environment Variables:** Backend expects `.env` in `backend/` for API keys and secrets. Never commit secrets.
- **Integration Docs:** Always consult `analysis-results/README.md` and `REPOSITORY_INTEGRATION_ANALYSIS.md` before major changes.

## Integration Points & External Dependencies
- **AI Services:** Backend proxies requests to external AI APIs. See `backend/README.md` for endpoint details.
- **Supabase:** Integration is documented in `SUPABASE_SETUP.md` and `supabase_integration.test.ts`.
- **Vercel/Render:** Deployment guides are in `DEPLOYMENT_GUIDE_VERCEL_RENDER.md` and related files.
- **Nginx:** Custom config in `nginx.conf` for production routing.

## Cross-Component Communication
- Use React context for global state and cross-component messaging.
- Backend communicates with frontend via RESTful APIs; see OpenAPI spec in `openapi.yaml`.

## Missing/Incomplete Items (High Priority)
- **CI/CD:** No GitHub Actions workflows exist. Add `.github/workflows/pr-check.yml` for PR validation (lint, unit tests, build).
- **Environment Setup:** No top-level `.env.example`. Create one consolidating vars from `backend/.env.example` and `packages/supabase/.env.example`.
- **Integration Tests:** `supabase_integration.test.ts` requires live credentials; add test mode or mocks for CI.
- **API Smoke Tests:** Add SuperTest-based tests for `openapi.yaml` endpoints (e.g., `/api/speech/synthesize`).
- **Secrets Hygiene:** Ensure CI uses GitHub Secrets for GCP/Supabase keys; never print in logs.

## Key References
- `components/`, `contexts/`, `backend/src/`, `analysis-results/`, `scripts/`, `types.ts`, `openapi.yaml`
- For integration, always start with `analysis-results/repository-comparison.md`, `package-dependencies.md`, and `INTEGRATION_CHECKLIST.md`.

---
_Review and update this file as the architecture or workflows evolve. For unclear or missing sections, provide feedback to improve AI agent productivity._
