import { ipcMain } from 'electron';
import { googleCalendarAuth } from '../services/google-calendar/auth';
import { googleCalendarService } from '../services/google-calendar/calendar';
import { preferencesStorage } from '../services/storage/preferences-storage';

export function setupCalendarHandlers() {
  // Authentication handlers
  ipcMain.handle('auth:startAuth', async () => {
    try {
      const tokens = await googleCalendarAuth.startAuthFlow();
      return { success: true, tokens };
    } catch (error) {
      console.error('Error starting auth flow:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('auth:validateToken', async () => {
    try {
      const isValid = await googleCalendarAuth.validateToken();
      return { success: true, isValid };
    } catch (error) {
      console.error('Error validating token:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Calendar list handlers
  ipcMain.handle('calendar:listCalendars', async () => {
    try {
      const calendars = await googleCalendarService.listCalendars();
      return { success: true, calendars };
    } catch (error) {
      console.error('Error listing calendars:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('calendar:getSelectedCalendars', async () => {
    try {
      const selectedIds = preferencesStorage.getSelectedCalendarIds();
      return { success: true, selectedIds };
    } catch (error) {
      console.error('Error getting selected calendars:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('calendar:setSelectedCalendars', async (_event, { calendarIds }) => {
    try {
      preferencesStorage.setSelectedCalendarIds(calendarIds);
      return { success: true };
    } catch (error) {
      console.error('Error setting selected calendars:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Calendar event handlers
  ipcMain.handle('calendar:getTodayEvents', async () => {
    try {
      const events = await googleCalendarService.getTodayEvents();
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching today\'s events:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('calendar:getUpcomingEvent', async () => {
    try {
      const event = await googleCalendarService.getUpcomingEvent();
      return { success: true, event };
    } catch (error) {
      console.error('Error fetching upcoming event:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('calendar:getNextHourEvents', async () => {
    try {
      const events = await googleCalendarService.getNextHourEvents();
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching next hour events:', error);
      return { success: false, error: (error as Error).message };
    }
  });
}