import { google } from 'googleapis';
import { Auth } from 'googleapis';
import { Storage } from '@google-cloud/storage';

// Types for Google Workspace integration
export interface GoogleWorkspaceConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
}

export interface DocumentContent {
  documentId: string;
  title: string;
  content: string;
  revisionId: string;
}

export interface SpreadsheetData {
  spreadsheetId: string;
  title: string;
  sheets: Array<{
    sheetId: string;
    title: string;
    data: any[][];
  }>;
}

export interface GoogleAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
}

/**
 * Google Workspace Service
 * Provides unified interface for Google Drive, Docs, and Sheets APIs
 */
export class GoogleWorkspaceService {
  private auth: Auth.OAuth2Client;
  private storage: Storage;
  private drive: any;
  private docs: any;
  private sheets: any;
  private isAuthenticated: boolean = false;

  constructor(config: GoogleWorkspaceConfig) {
    // Initialize OAuth2 client
    this.auth = new google.auth.OAuth2({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    });

    // Set required scopes
    this.auth.setCredentials({
      scope: config.scopes.join(' '),
    });

    // Initialize Google Cloud Storage
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    // Initialize API clients (will be authenticated after login)
    this.drive = null;
    this.docs = null;
    this.sheets = null;
  }

  /**
   * Generate authentication URL for Google OAuth2
   */
  getAuthUrl(state?: string): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/spreadsheets.readonly',
      ],
      state: state || 'creator-studio-auth',
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleAuthTokens> {
    const { tokens } = await this.auth.getToken(code);
    
    const credentials = {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiryDate: new Date(tokens.expiry_date!),
    };

    this.auth.setCredentials(tokens);
    await this.initializeApis();
    this.isAuthenticated = true;

    return credentials;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleAuthTokens> {
    this.auth.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.auth.refreshAccessToken();
    
    const tokens = {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || refreshToken,
      expiryDate: new Date(credentials.expiry_date!),
    };

    this.auth.setCredentials(credentials);
    await this.initializeApis();

    return tokens;
  }

  /**
   * Initialize Google API clients after authentication
   */
  private async initializeApis(): Promise<void> {
    const authClient = this.auth;

    this.drive = google.drive({ version: 'v3', auth: authClient });
    this.docs = google.docs({ version: 'v1', auth: authClient });
    this.sheets = google.sheets({ version: 'v4', auth: authClient });
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  // ==================== DRIVE API ====================

  /**
   * List files from Google Drive
   */
  async listDriveFiles(query?: string, pageSize: number = 10): Promise<DriveFile[]> {
    if (!this.drive) throw new Error('Drive API not initialized');

    const response = await this.drive.files.list({
      q: query || "trashed=false",
      pageSize,
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)',
    });

    return response.data.files || [];
  }

  /**
   * Upload file to Google Drive
   */
  async uploadToDrive(
    fileData: Buffer,
    fileName: string,
    mimeType: string,
    folderId?: string
  ): Promise<DriveFile> {
    if (!this.drive) throw new Error('Drive API not initialized');

    const media = {
      mimeType,
      body: fileData,
    };

    const requestBody: any = {
      name: fileName,
      fields: 'id,name,mimeType,size,modifiedTime,webViewLink,webContentLink',
    };

    if (folderId) {
      requestBody.parents = [folderId];
    }

    const response = await this.drive.files.create({
      requestBody,
      media,
    });

    return response.data;
  }

  /**
   * Create folder in Google Drive
   */
  async createDriveFolder(folderName: string, parentFolderId?: string): Promise<DriveFile> {
    if (!this.drive) throw new Error('Drive API not initialized');

    const requestBody: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      fields: 'id,name,mimeType,webViewLink',
    };

    if (parentFolderId) {
      requestBody.parents = [parentFolderId];
    }

    const response = await this.drive.files.create({
      requestBody,
    });

    return response.data;
  }

  /**
   * Delete file from Google Drive
   */
  async deleteDriveFile(fileId: string): Promise<void> {
    if (!this.drive) throw new Error('Drive API not initialized');

    await this.drive.files.delete({
      fileId,
    });
  }

  // ==================== DOCS API ====================

  /**
   * Create new Google Document
   */
  async createDocument(title: string, content?: string): Promise<DocumentContent> {
    if (!this.docs) throw new Error('Docs API not initialized');

    const response = await this.docs.documents.create({
      requestBody: {
        title,
      },
    });

    const documentId = response.data.documentId!;

    if (content) {
      await this.updateDocumentContent(documentId, content);
    }

    return await this.getDocumentContent(documentId);
  }

  /**
   * Get document content
   */
  async getDocumentContent(documentId: string): Promise<DocumentContent> {
    if (!this.docs) throw new Error('Docs API not initialized');

    const response = await this.docs.documents.get({
      documentId,
    });

    const document = response.data;
    
    // Extract text content from document structure
    const content = this.extractTextFromDocument(document.body?.content || []);

    return {
      documentId,
      title: document.title || 'Untitled',
      content,
      revisionId: document.revisionId || '',
    };
  }

  /**
   * Update document content
   */
  async updateDocumentContent(documentId: string, content: string): Promise<void> {
    if (!this.docs) throw new Error('Docs API not initialized');

    await this.docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    });
  }

  /**
   * Extract text content from Google Docs structure
   */
  private extractTextFromDocument(elements: any[]): string {
    let text = '';
    
    for (const element of elements) {
      if (element.paragraph) {
        for (const paragraphElement of element.paragraph.elements || []) {
          if (paragraphElement.textRun) {
            text += paragraphElement.textRun.content || '';
          }
        }
        text += '\n';
      } else if (element.table) {
        // Handle table content if needed
        text += '[TABLE]\n';
      } else if (element.elements) {
        text += this.extractTextFromDocument(element.elements);
      }
    }
    
    return text;
  }

  // ==================== SHEETS API ====================

  /**
   * Create new Google Sheet
   */
  async createSpreadsheet(title: string, headers?: string[]): Promise<SpreadsheetData> {
    if (!this.sheets) throw new Error('Sheets API not initialized');

    const requestBody: any = {
      properties: {
        title,
      },
    };

    if (headers) {
      requestBody.sheets = [{
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [{
            values: headers.map(header => ({ userEnteredValue: { stringValue: header } })),
          }],
        }],
      }];
    }

    const response = await this.sheets.spreadsheets.create({
      requestBody,
    });

    return await this.getSpreadsheetData(response.data.spreadsheetId!);
  }

  /**
   * Get spreadsheet data
   */
  async getSpreadsheetData(spreadsheetId: string, ranges?: string[]): Promise<SpreadsheetData> {
    if (!this.sheets) throw new Error('Sheets API not initialized');

    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ranges,
      includeGridData: true,
    });

    const spreadsheet = response.data;
    const sheets: SpreadsheetData['sheets'] = [];

    for (const sheet of spreadsheet.sheets || []) {
      const rowData = sheet.data?.[0]?.rowData || [];
      const data: any[][] = [];

      for (const row of rowData) {
        const values: any[] = [];
        for (const cell of row.values || []) {
          if (cell.userEnteredValue?.stringValue) {
            values.push(cell.userEnteredValue.stringValue);
          } else if (cell.userEnteredValue?.numberValue) {
            values.push(cell.userEnteredValue.numberValue);
          } else if (cell.userEnteredValue?.boolValue) {
            values.push(cell.userEnteredValue.boolValue);
          } else {
            values.push('');
          }
        }
        data.push(values);
      }

      sheets.push({
        sheetId: sheet.properties?.sheetId?.toString() || '',
        title: sheet.properties?.title || 'Untitled',
        data,
      });
    }

    return {
      spreadsheetId,
      title: spreadsheet.properties?.title || 'Untitled',
      sheets,
    };
  }

  /**
   * Append data to spreadsheet
   */
  async appendToSpreadsheet(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    if (!this.sheets) throw new Error('Sheets API not initialized');

    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
  }

  /**
   * Update spreadsheet data
   */
  async updateSpreadsheetData(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    if (!this.sheets) throw new Error('Sheets API not initialized');

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
  }

  // ==================== CLOUD STORAGE ====================

  /**
   * Upload file to Google Cloud Storage
   */
  async uploadToCloudStorage(
    bucketName: string,
    fileName: string,
    fileData: Buffer,
    metadata?: Record<string, string>
  ): Promise<string> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.save(fileData, {
      metadata,
    });

    // Generate signed URL for access
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future date
    });

    return signedUrl;
  }

  /**
   * Delete file from Google Cloud Storage
   */
  async deleteFromCloudStorage(bucketName: string, fileName: string): Promise<void> {
    const bucket = this.storage.bucket(bucketName);
    await bucket.file(fileName).delete();
  }

  /**
   * List files in Cloud Storage bucket
   */
  async listCloudStorageFiles(bucketName: string): Promise<string[]> {
    const bucket = this.storage.bucket(bucketName);
    const [files] = await bucket.getFiles();
    
    return files.map(file => file.name);
  }
}

// Export singleton instance
let googleWorkspaceService: GoogleWorkspaceService | null = null;

export function getGoogleWorkspaceService(): GoogleWorkspaceService {
  if (!googleWorkspaceService) {
    const config: GoogleWorkspaceConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    };
    
    googleWorkspaceService = new GoogleWorkspaceService(config);
  }
  
  return googleWorkspaceService;
}

export default GoogleWorkspaceService;
