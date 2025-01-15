import { CalendarEvent } from './google-calendar/calendar';

const COLORS = {
  neutral: '#F5F5F5',      // Light gray
  approaching: '#E6F3FF',  // Soft blue
  imminent: '#CCE5FF',     // Deeper blue
  afterHours: '#F0E6FF',   // Soft purple
};

export class ColorManager {
  private static instance: ColorManager;

  private constructor() {
    // Initialize if needed
  }

  public static getInstance(): ColorManager {
    if (!ColorManager.instance) {
      ColorManager.instance = new ColorManager();
    }
    return ColorManager.instance;
  }

  private isAfterHours(): boolean {
    const now = new Date();
    const hours = now.getHours();
    // Consider after 6 PM (18:00) as after hours
    return hours >= 18;
  }

  private isWithinEventTime(event: CalendarEvent): boolean {
    const now = new Date();
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);
    return now >= startTime && now <= endTime;
  }

  private getMinutesUntilEvent(event: CalendarEvent): number {
    const now = new Date();
    const startTime = new Date(event.start);
    return Math.round((startTime.getTime() - now.getTime()) / (60 * 1000));
  }

  public getBackgroundColor(events: CalendarEvent[]): string {
    // Check if it's after hours first
    if (this.isAfterHours()) {
      return COLORS.afterHours;
    }

    const now = new Date();
    const currentEvent = events.find(event => this.isWithinEventTime(event));
    
    // If we're in an event, show the imminent color
    if (currentEvent) {
      return COLORS.imminent;
    }

    const nextEvent = events.find(event => new Date(event.start) > now);
    if (!nextEvent) {
      return COLORS.neutral;
    }

    const minutesUntilStart = this.getMinutesUntilEvent(nextEvent);

    // If event is starting in less than 10 minutes
    if (minutesUntilStart <= 10) {
      return COLORS.imminent;
    }

    // If event is starting in less than 60 minutes
    if (minutesUntilStart <= 60) {
      return COLORS.approaching;
    }

    return COLORS.neutral;
  }

  public getTextColor(): string {
    // Using the colors from the typography guide
    return '#1A1A1A';
  }

  public getSecondaryTextColor(): string {
    // Using the colors from the typography guide
    return '#4A4A4A';
  }

  public getAccentColor(): string {
    // Using the colors from the typography guide
    return '#0066CC';
  }
}

export const colorManager = ColorManager.getInstance();