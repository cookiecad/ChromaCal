import { ipcMain } from 'electron';
import { googleCalendarAuth } from '../services/google-calendar/auth';
import { googleCalendarService } from '../services/google-calendar/calendar';
import { preferencesStorage } from '../services/storage/preferences-storage';

export function setupCalendarHandlers() {
  // Remove any existing handlers to prevent duplicates
  ipcMain.removeHandler('auth:startAuth');
  ipcMain.removeHandler('auth:validateToken');
  ipcMain.removeHandler('calendar:listCalendars');
  ipcMain.removeHandler('calendar:getSelectedCalendars');
  ipcMain.removeHandler('calendar:setSelectedCalendars');
  ipcMain.removeHandler('calendar:getTodayEvents');
  ipcMain.removeHandler('calendar:getUpcomingEvent');
  ipcMain.removeHandler('calendar:getNextHourEvents');

  console.log('🔄 Setting up calendar handlers...');
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
    console.log('📋 Handling calendar:listCalendars request');
    try {
      const calendars = await googleCalendarService.listCalendars();
      console.log('✅ Successfully retrieved calendars');
      return { success: true, calendars };
    } catch (error) {
      console.error('❌ Error listing calendars:', error);
      return { success: false, error: (error as Error).message };
    }
  });
  console.log('✅ Registered calendar:listCalendars handler');

  ipcMain.handle('calendar:getSelectedCalendars', async () => {
    console.log('📋 Handling calendar:getSelectedCalendars request');
    try {
      const selectedIds = preferencesStorage.getSelectedCalendarIds();
      console.log('✅ Successfully retrieved selected calendar IDs:', selectedIds);
      return { success: true, selectedIds };
    } catch (error) {
      console.error('❌ Error getting selected calendars:', error);
      return { success: false, error: (error as Error).message };
    }
  });
  console.log('✅ Registered calendar:getSelectedCalendars handler');

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

  console.log('✅ All calendar handlers registered successfully');
}