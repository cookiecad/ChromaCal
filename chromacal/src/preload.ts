import { contextBridge, ipcRenderer } from 'electron';
import { Calendar, CalendarEvent } from './services/google-calendar/calendar';

interface AuthResponse {
  success: boolean;
  tokens?: any;
  error?: string;
}

interface CalendarResponse<T> {
  success: boolean;
  events?: CalendarEvent[];
  event?: CalendarEvent | null;
  calendars?: Calendar[];
  selectedIds?: string[];
  error?: string;
}

interface ValidateTokenResponse {
  success: boolean;
  isValid?: boolean;
  error?: string;
}

export interface CalendarAPI {
  auth: {
    startAuth: () => Promise<AuthResponse>;
    validateToken: () => Promise<ValidateTokenResponse>;
  };
  calendar: {
    getTodayEvents: () => Promise<CalendarResponse<CalendarEvent[]>>;
    getUpcomingEvent: () => Promise<CalendarResponse<CalendarEvent | null>>;
    getNextHourEvents: () => Promise<CalendarResponse<CalendarEvent[]>>;
    listCalendars: () => Promise<CalendarResponse<Calendar[]>>;
    getSelectedCalendars: () => Promise<CalendarResponse<string[]>>;
    setSelectedCalendars: (calendarIds: string[]) => Promise<CalendarResponse<void>>;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api',
  {
    auth: {
      startAuth: () => ipcRenderer.invoke('auth:startAuth'),
      validateToken: () => ipcRenderer.invoke('auth:validateToken'),
    },
    calendar: {
      getTodayEvents: () => ipcRenderer.invoke('calendar:getTodayEvents'),
      getUpcomingEvent: () => ipcRenderer.invoke('calendar:getUpcomingEvent'),
      getNextHourEvents: () => ipcRenderer.invoke('calendar:getNextHourEvents'),
      listCalendars: () => ipcRenderer.invoke('calendar:listCalendars'),
      getSelectedCalendars: () => ipcRenderer.invoke('calendar:getSelectedCalendars'),
      setSelectedCalendars: (calendarIds: string[]) =>
        ipcRenderer.invoke('calendar:setSelectedCalendars', { calendarIds }),
    },
  } as CalendarAPI
);
