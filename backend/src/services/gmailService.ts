import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];

export class GmailService {
 private oauth2Client: OAuth2Client;

 constructor() {
   this.oauth2Client = new OAuth2Client(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET,
     process.env.GOOGLE_REDIRECT_URI
   );
 }

 // Get authorization URL for user
 getAuthUrl(userId: string): string {
   return this.oauth2Client.generateAuthUrl({
     access_type: 'offline',
     scope: SCOPES,
     state: userId
   });
 }

 // Exchange code for tokens
 async getTokens(code: string) {
   const { tokens } = await this.oauth2Client.getToken(code);
   return tokens;
 }

 // Send email
 async sendEmail(
   accessToken: string,
   to: string,
   subject: string,
   body: string
 ): Promise<void> {
   this.oauth2Client.setCredentials({ access_token: accessToken });
   const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

   const message = [
     `To: ${to}`,
     `Subject: ${subject}`,
     '',
     body
   ].join('\n');

   const encodedMessage = Buffer.from(message)
     .toString('base64')
     .replace(/\+/g, '-')
     .replace(/\//g, '_')
     .replace(/=+$/, '');

   await gmail.users.messages.send({
     userId: 'me',
     requestBody: {
       raw: encodedMessage
     }
   });
 }

 // List recent emails
 async listEmails(accessToken: string, maxResults: number = 10) {
   this.oauth2Client.setCredentials({ access_token: accessToken });
   const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

   const response = await gmail.users.messages.list({
     userId: 'me',
     maxResults
   });

   return response.data.messages || [];
 }

 // Get email details
 async getEmail(accessToken: string, messageId: string) {
   this.oauth2Client.setCredentials({ access_token: accessToken });
   const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

   const response = await gmail.users.messages.get({
     userId: 'me',
     id: messageId
   });

   return response.data;
 }
}

export const gmailService = new GmailService();