import { contextBridge, ipcRenderer } from 'electron';
import { CalendarEvent } from './services/google-calendar/calendar';

interface AuthResponse {
  success: boolean;
  tokens?: any;
  error?: string;
}

interface CalendarResponse<T> {
  success: boolean;
  events?: CalendarEvent[];
  event?: CalendarEvent | null;
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
    },
  } as CalendarAPI
);
