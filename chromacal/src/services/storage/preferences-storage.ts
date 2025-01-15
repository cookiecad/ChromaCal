import Store from 'electron-store';
import { app } from 'electron';
import crypto from 'crypto';

interface CalendarPreferences {
  selectedCalendarIds: string[];
}

interface StoreSchema {
  preferences: CalendarPreferences;
}

class PreferencesStorage {
  private static instance: PreferencesStorage;
  private store: Store<StoreSchema>;

  private constructor() {
    // Use the same encryption approach as token storage
    const appPath = app.getPath('userData');
    const encryptionKey = crypto
      .createHash('sha256')
      .update(appPath)
      .digest('hex')
      .slice(0, 32);

    this.store = new Store<StoreSchema>({
      name: 'user-preferences',
      encryptionKey,
      clearInvalidConfig: true,
      defaults: {
        preferences: {
          selectedCalendarIds: ['primary'] // Default to primary calendar
        }
      }
    });
  }

  public static getInstance(): PreferencesStorage {
    if (!PreferencesStorage.instance) {
      PreferencesStorage.instance = new PreferencesStorage();
    }
    return PreferencesStorage.instance;
  }

  public getSelectedCalendarIds(): string[] {
    console.log('🔍 Retrieving selected calendar IDs...');
    const prefs = (this.store as any).get('preferences');
    console.log('📅 Selected calendars:', prefs.selectedCalendarIds);
    return prefs.selectedCalendarIds;
  }

  public setSelectedCalendarIds(calendarIds: string[]): void {
    console.log('💾 Saving selected calendar IDs:', calendarIds);
    (this.store as any).set('preferences.selectedCalendarIds', calendarIds);
    console.log('✅ Calendar preferences saved');
  }
}

export const preferencesStorage = PreferencesStorage.getInstance();