import { ipcMain } from 'electron';
import { googleCalendarAuth } from '../services/google-calendar/auth';
import { googleCalendarService } from '../services/google-calendar/calendar';

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