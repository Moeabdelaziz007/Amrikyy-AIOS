# Amrikyy AI OS Project Overview

**Version:** 1.0
**Date:** 2024-07-26
**Author:** Gemini CLI Architect

## 1. Executive Summary

This document provides a comprehensive overview of the recent architectural changes, new feature implementations, and the current status of the Amrikyy AI OS project. Key initiatives include migrating to a mono-repository structure, refactoring core UI components, implementing a Darwin-Gödel Machine (DGM) for self-improvement, and establishing a new UI Design System.

## 2. Mono-repository Migration

**Objective:** To consolidate disparate applications into a unified, domain-driven mono-repository structure for improved maintainability, shared code reusability, and streamlined CI/CD.

**Approach:** A hybrid approach (Option C) using `pnpm` workspaces and `turborepo` was adopted.

### 2.1. Project Structure
- **Root `package.json`**: Configured for `pnpm` workspaces (`apps/*`, `packages/*`) and `turborepo` task runners (`build`, `dev`, `lint`, `test`).
- **`tsconfig.base.json`**: Centralized TypeScript configuration for consistent settings across all packages.
- **`turbo.json`**: Configured `turborepo` pipelines for `build`, `lint`, `dev`, `test`, and `test:coverage` with caching strategies.

### 2.2. Shared Packages
- **`packages/ui`**: Contains reusable React UI components, theming, and utilities.
  - `package.json`: Includes `tailwindcss`, `framer-motion`, `@dnd-kit/core`, `class-variance-authority`.
  - `src/theme/colors.ts`: Defines `dark` and `light` color palettes.
  - `src/theme/useTheme.ts`: Provides `KomabiThemeProvider` and `useKomabiTheme` context.
  - `src/utils.ts`: Utility for merging Tailwind classes (`cn`).
  - `src/components/Button.tsx`, `Card.tsx`, `Notification.tsx`, `SystemStatusWidget.tsx`: Base UI components.
- **`packages/auth`**: Intended for shared authentication logic.
- **`packages/sdk`**: Intended for shared SDKs and API clients.
- **`packages/config`**: Intended for shared configurations (e.g., ESLint presets).

### 2.3. Pilot Applications
- **`apps/devconsole`**: Pilot application for the Developer domain.
- **`apps/creatorstudio`**: Pilot application for the Creator domain.
- Both applications successfully import and use components from `@amrikyy/ui`.

## 3. Core OS UI Refactoring

**Objective:** To break down large, complex React components (`App.tsx`, `AIOSDesktop.tsx`) into smaller, more manageable, and reusable units for improved readability, maintainability, and testability.

### 3.1. `App.tsx` Refactoring
- **Original State:** Over 1100 lines, managing global state, window logic, and configurations.
- **New Structure:**
  - `src/config/appDefinitions.ts`: Separated application definitions.
  - `src/config/defaultSettings.ts`: Separated default OS settings.
  - `src/components/icons/index.ts`: Centralized icon imports.
  - `src/hooks/useOSState.ts`: Custom hook for core OS state (windows, z-index, settings, user).
  - `src/hooks/useWindowManagement.ts`: Custom hook for window operations (open, close, focus, minimize).
  - `src/contexts/OSContext.tsx`: React Context for sharing OS state and actions across the component tree.
  - **Result:** `App.tsx` is now a lean component responsible for assembling context providers and rendering the main `AIOSDesktop`.

### 3.2. `AIOSDesktop.tsx` Refactoring
- **Original State:** Over 600 lines, mixing animation logic, theme definitions, and UI component rendering.
- **New Structure:**
  - `src/hooks/useParticleSystem.ts`: Custom hook encapsulating the Quantum Particle System animation logic.
  - `src/components/desktop/DesktopBackground.tsx`: Component for rendering the animated background, utilizing `useParticleSystem`.
  - `src/config/themes.ts`: Separated theme definitions.
  - `src/components/desktop/DesktopHeader.tsx`: Component for the desktop header (greeting, time, search, system stats).
  - `src/components/desktop/Taskbar.tsx`: Component for the bottom taskbar (workspaces, quick launch, system tray).
  - `src/components/desktop/AppLauncher.tsx`: Component for the application launcher grid.
  - **Result:** `AIOSDesktop.tsx` is now a composition of these smaller, dedicated components.

## 4. Darwin-Gödel Machine (DGM) Implementation

**Objective:** To transform Amrikyy AI OS into a self-improving system capable of monitoring its own health, identifying problems, and autonomously generating, testing, and deploying code modifications.

### 4.1. Secure Code API
- **File:** `backend/src/routes/code.ts`
- **API Path:** `/api/code`
- **Endpoints:**
  - `POST /api/code/read`: Securely reads source code files within defined project boundaries, with strict path validation.
  - `POST /api/code/test`: (Mocked) Simulates running proposed code changes in a sandbox environment and returning test results/performance deltas.
  - `POST /api/code/commit`: (Mocked) Simulates creating a Git commit and a Pull Request for human review.

### 4.2. System Health Monitor (SHM) - "Jules"
- **Service:** `backend/src/services/systemHealthService.ts`
- **API Path:** `/api/health`
- **Functionality:**
  - Collects health data (`error`, `performance`, `ux`).
  - Calculates an `OS Efficiency Score`.
  - Generates a `Problem Report` (using Gemini) when the score drops below a threshold.
- **Frontend Integration:** `src/utils/globalErrorHandler.ts` and `index.tsx` are configured to send uncaught frontend errors to `/api/health/log`.

### 4.3. Self-Improving Agent (SIA) - "Nexus"
- **Service:** `backend/src/services/nexusSIA_Service.ts`
- **Gemini Model:** Primarily uses Gemini 2.5 Pro for complex reasoning and code generation.
- **Functionality:** Executes the full DGM cycle:
  1.  **IDENTIFY:** Ingests Problem Reports from Jules.
  2.  **GENERATE:** Proposes code modifications (using Gemini) after reading relevant source code via the Code API.
  3.  **TEST:** Sends proposed changes to the Code API's `/test` endpoint (mocked).
  4.  **EVALUATE:** Assesses test results and performance deltas.
  5.  **ARCHIVE / COMMIT:** If successful, sends the patch to the Code API's `/commit` endpoint (mocked) to create a PR.

## 5. UI Design System Setup (packages/ui) - Current Status

**Objective:** To establish a robust Storybook environment for developing and showcasing reusable UI components.

**Current Status:** The `packages/ui` package has been set up with core components (`Button`, `Card`, `Notification`, `SystemStatusWidget`), theming, and a `DemoDashboard`.

**Known Issue: Storybook Launch Failure**
- **Error:** `TypeError: Failed to fetch dynamically imported module: http://localhost:6006/.storybook/preview.ts`
- **Root Cause (Identified):** The Vite builder within Storybook is failing to correctly transpile the TypeScript configuration files (`.storybook/*.ts`) themselves. The browser is receiving raw TypeScript instead of compiled JavaScript.
- **Troubleshooting Steps Taken:**
  - Initial Storybook configuration files (`main.ts`, `preview.ts`, `tsconfig.json`) were created.
  - `main.ts` was updated to include `viteFinal` for custom Vite configuration.
  - Tailwind CSS import was temporarily commented out in `preview.ts` to isolate the issue (re-enabled as it was not the root cause).
  - `packages/ui/tsconfig.json` was updated to explicitly include `.storybook` directory in `include` paths and extend `../../tsconfig.base.json`.
  - `main.ts` was further updated with explicit `esbuild` and `plugins: [react()]` configurations within `viteFinal` to force TypeScript transpilation for `.storybook` files and ensure React plugin activation.
- **Current Hypothesis:** Despite explicit `viteFinal` configurations, a fundamental interaction or ordering of plugins/transpilers within Storybook's Vite instance is preventing the correct processing of its own `.ts` config files. This often points to a version mismatch or a subtle dependency conflict that needs a more direct, lower-level intervention or a specific Storybook/Vite workaround.

## 6. Next Steps

- **Resolve Storybook Issue:** The immediate priority is to resolve the `TypeError` preventing Storybook from launching. This may require consulting Storybook's official documentation for mono-repo/Vite setups or trying alternative `viteFinal` configurations.
- **Replace Mocked DGM Components:** Implement the real sandbox environment for `/api/code/test` and a real Git client for `/api/code/commit`.
- **Expand Health Data Collection:** Integrate performance and UX metrics logging from the frontend to the `SystemHealthService`.
- **Integrate ChronoVault:** Implement archiving of successful DGM improvements.

---