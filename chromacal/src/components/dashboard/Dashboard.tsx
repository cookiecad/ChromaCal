import React, { useEffect, useState } from 'react';
import { CalendarEvent } from '../../services/google-calendar/calendar';
import { colorManager } from '../../services/color-manager';

const formatTime = (date: Date, use24Hour = false): string => {
  // Format time to match typography guide (e.g., "9:15 PM" or "21:15")
  const time = date.toLocaleTimeString('en-US', {
    hour12: !use24Hour,
    hour: 'numeric', // Use numeric to avoid leading zeros
    minute: '2-digit'
  });
  
  // For 12-hour format, ensure proper spacing around AM/PM
  if (!use24Hour) {
    const [timePart, meridiem] = time.split(' ');
    return `${timePart} ${meridiem}`;
  }
  
  return time;
};

const getTimeUntilEvent = (event: CalendarEvent): string => {
  const now = new Date();
  const start = new Date(event.start);
  const diffMinutes = Math.round((start.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffMinutes <= 0) {
    return 'happening now';
  }
  // Format according to typography guide (e.g., "in 5 minutes" with proper spacing)
  const minutes = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  return `in ${minutes}`.toLowerCase();
};

const getEventStatus = (event: CalendarEvent): string => {
  const now = new Date();
  const start = new Date(event.start);
  const end = new Date(event.end);
  
  if (now >= start && now <= end) {
    return 'current';
  }
  return '';
};

export const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await window.api.calendar.getTodayEvents();
        if (response.success && response.events) {
          setEvents(response.events);
        } else {
          setError(response.error || 'Failed to fetch events');
        }
      } catch (err) {
        setError('Error fetching calendar events');
        console.error('Calendar fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Find next event
  const nextEvent = events.find(event => {
    const end = new Date(event.end);
    return end > currentTime;
  });

  // Find current event
  const currentEvent = nextEvent && new Date(nextEvent.start) <= currentTime ? nextEvent : null;

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <main className="main-content">
        <div className="time-container">
          <time className="time-display" dateTime={currentTime.toISOString()}>
            {formatTime(currentTime)}
          </time>
        </div>

        <div className="event-container">
          {currentEvent ? (
            <>
              <h1 className="event-title">{currentEvent.summary}</h1>
              <h2 className="event-status">happening now</h2>
            </>
          ) : nextEvent ? (
            <>
              <h1 className="event-title">{nextEvent.summary}</h1>
              <h2 className="event-status">{getTimeUntilEvent(nextEvent)}</h2>
            </>
          ) : (
            <h2 className="event-status">No more events for today</h2>
          )}
        </div>
      </main>

      <aside className="agenda">
        <h2 className="agenda-title">Today's Events</h2>
        {events.length === 0 ? (
          <p className="no-events">No events scheduled</p>
        ) : (
          <div className="agenda-list">
            {events.map(event => {
              const start = new Date(event.start);
              const status = getEventStatus(event);

              return (
                <div 
                  key={event.id} 
                  className={`agenda-event ${status}`}
                >
                  <time 
                    className="agenda-time" 
                    dateTime={start.toISOString()}
                  >
                    {formatTime(start)}
                  </time>
                  <span className="agenda-name">{event.summary}</span>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
};