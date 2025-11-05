# Darwin-Gödel Machine (DGM) Implementation in Amrikyy AI OS

**Version:** 1.0
**Date:** 2024-07-26
**Status:** Foundational Implementation Complete

## 1. Executive Summary

This document outlines the architecture of the self-improving system integrated into Amrikyy AI OS, inspired by the principles of a Darwin-Gödel Machine (DGM). The system is designed to make the OS a **living entity**, capable of monitoring its own health, identifying problems, and autonomously generating, testing, and deploying code modifications to improve itself over time.

The core architecture consists of three primary components: the **System Health Monitor (Jules)**, the **Self-Improving Agent (Nexus)**, and a **Secure Code API** that enables the agent to interact with its own source code.

## 2. Core Components

### 2.1. System Health Monitor (SHM) - "Jules"

- **Service:** `backend/src/services/systemHealthService.ts`
- **API Route:** `/api/health`

Jules acts as the OS's nervous system. Its primary function is to continuously collect and analyze data to quantify the system's operational effectiveness.

**Key Functions:**
- **Data Collection:** Receives real-time data from the frontend via the `/api/health/log` endpoint. The initial implementation focuses on capturing uncaught JavaScript errors and unhandled promise rejections.
- **OS Efficiency Score:** Maintains a numerical score (0-100%) representing the system's health. The score decreases when errors are logged and slowly regenerates over time if no new issues arise.
- **Problem Report Generation:** If the Efficiency Score drops below a predefined threshold (e.g., 85%), Jules uses a Gemini model to analyze the recent data and generate a structured **Problem Report**, which serves as the trigger for the self-improvement cycle.

### 2.2. Self-Improving Agent (SIA) - "Nexus"

- **Service:** `backend/src/services/nexusSIA_Service.ts`

Nexus is the brain of the operation, executing the DGM's evolutionary loop. It is instantiated on server startup and listens for Problem Reports from Jules.

**The DGM Cycle:**
1.  **IDENTIFY:** Nexus receives a Problem Report and analyzes its contents to understand the likely root cause.
2.  **GENERATE:** It reads the suspected source code file(s) using the Code API (`/api/code/read`) and uses the Gemini 2.5 Pro model to generate a code modification proposal aimed at fixing the issue.
3.  **TEST:** The proposed code patch is sent to the Code API's `/api/code/test` endpoint. This (currently mocked) step runs the modification in a secure sandbox to verify its correctness and measure performance impact.
4.  **EVALUATE:** Nexus assesses the test results. A solution is considered successful only if all tests pass **and** it results in a positive performance improvement.
5.  **ARCHIVE / COMMIT:** If the evaluation is successful, Nexus sends the patch to the `/api/code/commit` endpoint, which (currently mocked) creates a new Git branch and opens a pull request with a detailed commit message. Failed proposals are discarded.

### 2.3. Secure Code API

- **Route:** `backend/src/routes/code.ts`
- **API Route:** `/api/code`

This API is the critical, secure bridge that allows Nexus to interact with its own source code. It is designed with a security-first approach.

**Endpoints:**
- `POST /api/code/read`: Securely reads a specified file's content. It includes multiple security checks to prevent access to sensitive directories (`.git`, `node_modules`) or paths outside the project root.
- `POST /api/code/test`: Receives a code patch and executes it in a sandboxed test environment. (Currently Mocked)
- `POST /api/code/commit`: Receives a verified patch and creates a pull request for human review. (Currently Mocked)

## 3. Autonomous Workflow

The end-to-end flow is as follows:

1.  A user interacts with the frontend, and an unhandled JavaScript error occurs.
2.  The `globalErrorHandler` on the frontend captures the error and sends it to `/api/health/log`.
3.  **Jules** (`systemHealthService`) logs the error, causing the **OS Efficiency Score** to drop.
4.  On its next analysis cycle, Jules detects the low score and generates a **Problem Report**.
5.  **Nexus** (`nexusSIA_Service`), which is constantly monitoring, detects the low score and begins its improvement cycle.
6.  Nexus analyzes the report, reads the relevant code via `/api/code/read`, and generates a fix.
7.  It tests the fix via `/api/code/test`.
8.  Upon successful validation, it commits the fix via `/api/code/commit`, creating a pull request.

## 4. Next Steps & Future Enhancements

The current implementation is a robust foundation. The next steps involve replacing mocked components with production-ready implementations:

1.  **Implement a True Sandbox:** Integrate Docker or a similar containerization technology for the `/test` endpoint to provide real, isolated test execution.
2.  **Implement a Git Client:** Use a library like `simple-git` to allow the `/commit` endpoint to create real branches and pull requests on GitHub/GitLab.
3.  **Expand Health Data:** Enhance the frontend to log detailed performance metrics (e.g., component render times via `React.Profiler`) and UX funnel data (e.g., task completion rates) to provide Jules with a richer dataset.
4.  **Integrate ChronoVault:** Store every successful `ImprovementRecord` in the ChronoVault to create a searchable, historical log of the system's evolution, enabling meta-analysis of the improvement process itself.
