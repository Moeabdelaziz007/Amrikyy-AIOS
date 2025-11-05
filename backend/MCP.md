# MCP (Model Context Protocol) - Backend Notes

This document describes the simple MCP scaffolding added to the backend for resolving library/documentation identifiers and providing a small, testable interface for Model Context Protocol workflows.

Files added:
- `backend/src/mcp/resolveService.ts` - Mock resolver service that returns a deterministic Context7-compatible ID and small docs payload.
- `backend/src/routes/mcp.ts` - Express route registered at `POST /api/mcp/resolve` which accepts { libraryName } and returns resolver output.
- `backend/tests/mcp.spec.ts` - SuperTest unit tests validating happy path and missing-parameter error.

How it works
- The current implementation is intentionally mocked to avoid external network calls. It returns a predictable `context7CompatibleLibraryID` and a `docs` object.
- Intended next steps:
  - Replace the mock `resolveLibraryId` with a call to a real resolver or registry (e.g., a Context7 resolver endpoint).
  - Add caching (Redis or in-memory) for resolved IDs.
  - Add permission checks and rate limiting for the MCP API.

Routes
- POST /api/mcp/resolve
  - Body: { libraryName: string }
  - Responses:
    - 200: resolver payload
    - 400: missing libraryName
    - 500: server error

Testing
- Run backend tests (Jest) or run the specific file with vitest if configured.

Security
- The resolver currently returns mocked docs and should not be used for production. When integrating real resolvers, ensure secrets are stored in env vars and not logged.
