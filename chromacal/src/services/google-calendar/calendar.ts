import { google } from 'googleapis';
import { googleCalendarAuth } from './auth';
import { preferencesStorage } from '../storage/preferences-storage';

export interface Calendar {
  id: string;
  summary: string;
  primary: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string; // Changed from Date to string for IPC serialization
  end: string;   // Changed from Date to string for IPC serialization
  calendarId: string; // Added to track which calendar the event is from
}

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;

  private constructor() {
    // Private constructor for singleton pattern
    console.log('📅 Initializing GoogleCalendarService');
  }

  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  public async listCalendars(): Promise<Calendar[]> {
    console.log('🔄 Fetching available calendars...');
    
    const calendar = google.calendar({
      version: 'v3',
      auth: googleCalendarAuth.getOAuth2Client()
    });

    try {
      const response = await calendar.calendarList.list();
      const calendars = response.data.items?.map(cal => ({
        id: cal.id || '',
        summary: cal.summary || 'Unnamed Calendar',
        primary: cal.primary || false
      })) || [];

      console.log('📅 Found calendars:', calendars);
      return calendars;
    } catch (error) {
      console.error('❌ Error fetching calendars:', error);
      throw error;
    }
  }

  public async getTodayEvents(): Promise<CalendarEvent[]> {
    console.log('🔄 Fetching today\'s events...');
    
    const calendar = google.calendar({
      version: 'v3',
      auth: googleCalendarAuth.getOAuth2Client()
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    console.log('📅 Time range:', {
      now: now.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    try {
      const selectedCalendarIds = preferencesStorage.getSelectedCalendarIds();
      console.log('📅 Fetching events from calendars:', selectedCalendarIds);

      const allEvents: CalendarEvent[] = [];

      for (const calendarId of selectedCalendarIds) {
        console.log(`📤 Sending calendar API request for calendar ${calendarId}...`);
        const response = await calendar.events.list({
          calendarId,
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });

        console.log('📥 Received calendar response:', {
          calendarId,
          itemCount: response.data.items?.length || 0,
          nextPageToken: response.data.nextPageToken || 'none'
        });

        if (response.data.items?.length) {
          const events = response.data.items.map(event => {
            const startDateTime = event.start?.dateTime || event.start?.date;
            const endDateTime = event.end?.dateTime || event.end?.date;

            console.log('🕒 Processing event:', {
              id: event.id,
              summary: event.summary,
              start: startDateTime,
              end: endDateTime,
              allDay: !event.start?.dateTime,
              calendarId
            });

            if (!startDateTime || !endDateTime) {
              console.error('❌ Event missing required start or end time:', event);
              throw new Error('Event missing required start or end time');
            }

            return {
              id: event.id || crypto.randomUUID(),
              summary: event.summary || 'Untitled Event',
              start: new Date(startDateTime).toISOString(),
              end: new Date(endDateTime).toISOString(),
              calendarId
            };
          });

          allEvents.push(...events);
        }
      }

      // Sort all events by start time
      allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      console.log('✅ Successfully processed all events:', {
        count: allEvents.length,
        firstEvent: allEvents[0]?.summary,
        lastEvent: allEvents[allEvents.length - 1]?.summary
      });

      return allEvents;
    } catch (error: unknown) {
      console.error('❌ Error fetching calendar events:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error type:', error);
      }
      throw error;
    }
  }

  public async getUpcomingEvent(): Promise<CalendarEvent | null> {
    console.log('🔍 Looking for upcoming event...');
    const events = await this.getTodayEvents();
    const now = new Date();
    
    console.log('⏰ Current time:', now.toISOString());
    console.log('📋 Total events to check:', events.length);

    const upcomingEvent = events.find(event => {
      const eventEnd = new Date(event.end);
      const isUpcoming = eventEnd > now;
      console.log('📅 Checking event:', {
        summary: event.summary,
        end: event.end,
        isUpcoming
      });
      return isUpcoming;
    });
    
    if (upcomingEvent) {
      console.log('✅ Found upcoming event:', {
        summary: upcomingEvent.summary,
        start: upcomingEvent.start,
        end: upcomingEvent.end
      });
    } else {
      console.log('ℹ️ No upcoming events found');
    }

    return upcomingEvent || null;
  }

  public async getNextHourEvents(): Promise<CalendarEvent[]> {
    console.log('🔍 Looking for events in the next hour...');
    const events = await this.getTodayEvents();
    const now = new Date();
    const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    console.log('⏰ Time range:', {
      now: now.toISOString(),
      hourFromNow: hourFromNow.toISOString()
    });

    const nextHourEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const isInRange = (eventStart >= now && eventStart <= hourFromNow) ||
                       (eventStart <= now && eventEnd >= now);

      console.log('📅 Checking event:', {
        summary: event.summary,
        start: eventStart.toISOString(),
        end: eventEnd.toISOString(),
        isInRange
      });

      return isInRange;
    });

    console.log(`✅ Found ${nextHourEvents.length} events in the next hour`);
    return nextHourEvents;
  }
}

export const googleCalendarService = GoogleCalendarService.getInstance();