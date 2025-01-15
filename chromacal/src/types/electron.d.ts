import { CalendarAPI } from '../preload';

declare global {
  interface Window {
    api: CalendarAPI;
  }
}

export {};