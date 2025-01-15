import { google } from 'googleapis';
import { googleCalendarAuth } from './auth';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string; // Changed from Date to string for IPC serialization
  end: string;   // Changed from Date to string for IPC serialization
}

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;

  private constructor() {}

  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  public async getTodayEvents(): Promise<CalendarEvent[]> {
    const calendar = google.calendar({ 
      version: 'v3', 
      auth: googleCalendarAuth.getOAuth2Client() 
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return (response.data.items || []).map(event => {
        const startDateTime = event.start?.dateTime || event.start?.date;
        const endDateTime = event.end?.dateTime || event.end?.date;

        if (!startDateTime || !endDateTime) {
          throw new Error('Event missing required start or end time');
        }

        return {
          id: event.id || crypto.randomUUID(),
          summary: event.summary || 'Untitled Event',
          start: new Date(startDateTime).toISOString(), // Store as ISO string
          end: new Date(endDateTime).toISOString(),     // Store as ISO string
        };
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  public async getUpcomingEvent(): Promise<CalendarEvent | null> {
    const events = await this.getTodayEvents();
    const now = new Date();
    
    return events.find(event => new Date(event.end) > now) || null;
  }

  public async getNextHourEvents(): Promise<CalendarEvent[]> {
    const events = await this.getTodayEvents();
    const now = new Date();
    const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (eventStart >= now && eventStart <= hourFromNow) ||
             (eventStart <= now && eventEnd >= now);
    });
  }
}

export const googleCalendarService = GoogleCalendarService.getInstance();