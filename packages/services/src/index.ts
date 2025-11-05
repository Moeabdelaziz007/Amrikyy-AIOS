// Google Workspace Services
export {
  GoogleWorkspaceService,
  getGoogleWorkspaceService,
  type GoogleWorkspaceConfig,
  type GoogleAuthTokens,
  type DriveFile,
  type DocumentContent,
  type SpreadsheetData,
} from './services/google/workspace.service';

// Authentication Components
export { GoogleAuth, useGoogleAuth } from './components/GoogleAuth';

// Re-export main types for convenience
export type {
  GoogleWorkspaceConfig,
  GoogleAuthTokens,
  DriveFile,
  DocumentContent,
  SpreadsheetData,
} from './services/google/workspace.service';
