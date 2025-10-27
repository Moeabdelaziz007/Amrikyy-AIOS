import { CalendarEvent, DriveFile, GmailMessage } from '../types';

// --- MOCK DATA ---
const now = new Date();
const getFutureDate = (hours: number, minutes: number) => new Date(now.getTime() + (hours * 60 + minutes) * 60 * 1000);

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    summary: 'Q3 Strategy Meeting',
    start: getFutureDate(1, 0).toISOString(),
    end: getFutureDate(2, 0).toISOString(),
  },
  {
    id: 'cal-2',
    summary: 'Project Phoenix Sync',
    start: getFutureDate(4, 30).toISOString(),
    end: getFutureDate(5, 0).toISOString(),
  },
];

const mockDriveFiles: DriveFile[] = [
  {
    id: 'drive-1',
    name: 'Q3_Marketing_Brief_v2.docx',
    link: '#',
  },
  {
    id: 'drive-2',
    name: 'Competitor_Analysis.xlsx',
    link: '#',
  },
];

const mockGmailMessages: GmailMessage[] = [
  {
    id: 'gmail-1',
    snippet: 'Feedback on the new UI mockups for Creator Studio.',
  },
  {
    id: 'gmail-2',
    snippet: 'URGENT: Server maintenance window tonight.',
  },
];

// --- MOCK API FUNCTIONS ---

// Simulates an API call with a delay and a chance to fail for testing error handling.
const simulateApiCall = <T>(data: T, serviceName: string, delay = 500): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 20% chance of failure to test error handling
      if (Math.random() < 0.2) {
        reject(new Error(`Failed to fetch ${serviceName} data. Please try again later.`));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    console.log("Fetching Calendar events...");
    return await simulateApiCall(mockCalendarEvents, "calendar events");
  } catch (error) {
    console.error("Error in getCalendarEvents:", error);
    throw error;
  }
};

export const getDriveFiles = async (): Promise<DriveFile[]> => {
  try {
    console.log("Fetching Drive files...");
    return await simulateApiCall(mockDriveFiles, "Drive files", 800);
  } catch (error) {
    console.error("Error in getDriveFiles:", error);
    throw error;
  }
};

export const getGmailMessages = async (): Promise<GmailMessage[]> => {
  try {
    console.log("Fetching Gmail messages...");
    return await simulateApiCall(mockGmailMessages, "Gmail messages", 1200);
  } catch (error) {
    console.error("Error in getGmailMessages:", error);
    throw error;
  }
};