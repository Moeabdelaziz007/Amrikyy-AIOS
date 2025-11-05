 import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export class CalendarService {
 private oauth2Client: OAuth2Client;

 constructor() {
   this.oauth2Client = new OAuth2Client(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET,
     process.env.GOOGLE_REDIRECT_URI
   );
 }

 // Create event
 async createEvent(
   accessToken: string,
   summary: string,
   description: string,
   startTime: string,
   endTime: string,
   attendees?: string[]
 ) {
   this.oauth2Client.setCredentials({ access_token: accessToken });
   const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

   const event = {
     summary,
     description,
     start: {
       dateTime: startTime,
       timeZone: 'UTC'
     },
     end: {
       dateTime: endTime,
       timeZone: 'UTC'
     },
     attendees: attendees?.map(email => ({ email })),
     reminders: {
       useDefault: false,
       overrides: [
         { method: 'email', minutes: 24 * 60 },
         { method: 'popup', minutes: 10 }
       ]
     }
   };

   const response = await calendar.events.insert({
     calendarId: 'primary',
     requestBody: event
   });

   return response.data;
 }

 // List upcoming events
 async listEvents(accessToken: string, maxResults: number = 10) {
   this.oauth2Client.setCredentials({ access_token: accessToken });
   const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

   const response = await calendar.events.list({
     calendarId: 'primary',
     timeMin: new Date().toISOString(),
     maxResults,
     singleEvents: true,
     orderBy: 'startTime'
   });

   return response.data.items || [];
 }

 // Delete event
 async deleteEvent(accessToken: string, eventId: string) {
   this.oauth2Client.setCredentials({ access_token: accessToken });
   const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

   await calendar.events.delete({
     calendarId: 'primary',
     eventId
   });
 }
connect like all travel agent
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
}

export const calendarService = new CalendarService();