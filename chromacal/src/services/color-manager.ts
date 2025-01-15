import { CalendarEvent } from './google-calendar/calendar';

// For testing purposes
export interface TestConfig {
  currentTime?: Date;
  isTestMode?: boolean;
}

const COLORS = {
  neutral: '#F5F5F5',      // Light gray
  approaching: '#E6F3FF',  // Soft blue
  imminent: '#CCE5FF',     // Deeper blue
  afterHours: '#F0E6FF',   // Soft purple
};

export class ColorManager {
  private static instance: ColorManager;
  private testConfig: TestConfig = {};

  private constructor() {
    // Initialize if needed
  }

  public static getInstance(): ColorManager {
    if (!ColorManager.instance) {
      ColorManager.instance = new ColorManager();
    }
    return ColorManager.instance;
  }

  // Test mode methods
  public enableTestMode(config: TestConfig): void {
    this.testConfig = { ...config, isTestMode: true };
  }

  public disableTestMode(): void {
    this.testConfig = {};
  }

  private getCurrentTime(): Date {
    return this.testConfig.isTestMode && this.testConfig.currentTime
      ? new Date(this.testConfig.currentTime)
      : new Date();
  }

  private isAfterHours(): boolean {
    const now = this.getCurrentTime();
    const hours = now.getHours();
    // Consider after 6 PM (18:00) as after hours
    return hours >= 18;
  }

  private isWithinEventTime(event: CalendarEvent): boolean {
    const now = this.getCurrentTime();
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);
    return now >= startTime && now <= endTime;
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    const hex1 = color1.substring(1);
    const hex2 = color2.substring(1);
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private getMinutesUntilEvent(event: CalendarEvent): number {
    const now = this.getCurrentTime();
    const startTime = new Date(event.start);
    return Math.round((startTime.getTime() - now.getTime()) / (60 * 1000));
  }

  public getBackgroundColor(events: CalendarEvent[]): string {
    // Check if it's after hours first
    if (this.isAfterHours()) {
      return COLORS.afterHours;
    }

    const now = this.getCurrentTime();
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
      // Interpolate between approaching and imminent colors
      const factor = 1 - (minutesUntilStart / 10);
      return this.interpolateColor(COLORS.approaching, COLORS.imminent, factor);
    }

    // If event is starting in less than 60 minutes
    if (minutesUntilStart <= 60) {
      // Interpolate between neutral and approaching colors
      const factor = 1 - ((minutesUntilStart - 10) / 50);
      return this.interpolateColor(COLORS.neutral, COLORS.approaching, factor);
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