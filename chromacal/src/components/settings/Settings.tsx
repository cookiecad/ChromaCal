import React, { useEffect, useState } from 'react';
import { Calendar } from '../../services/google-calendar/calendar';

export const Settings: React.FC = () => {
  const [availableCalendars, setAvailableCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const [calendarsResponse, selectedResponse] = await Promise.all([
          window.api.calendar.listCalendars(),
          window.api.calendar.getSelectedCalendars()
        ]);

        if (calendarsResponse.success && calendarsResponse.calendars) {
          setAvailableCalendars(calendarsResponse.calendars);
        }

        if (selectedResponse.success && selectedResponse.selectedIds) {
          setSelectedCalendarIds(selectedResponse.selectedIds);
        }
      } catch (err) {
        console.error('Error fetching calendars:', err);
        setError('Failed to fetch calendars');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendars();
  }, []);

  const handleCalendarToggle = async (calendarId: string) => {
    const newSelection = selectedCalendarIds.includes(calendarId)
      ? selectedCalendarIds.filter(id => id !== calendarId)
      : [...selectedCalendarIds, calendarId];

    try {
      await window.api.calendar.setSelectedCalendars(newSelection);
      setSelectedCalendarIds(newSelection);
    } catch (err) {
      console.error('Error updating calendar selection:', err);
      setError('Failed to update calendar selection');
    }
  };

  if (loading) {
    return <div className="loading">Loading calendars...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="settings">
      <h1>Calendar Settings</h1>
      <div className="calendar-settings">
        <h2>Active Calendars</h2>
        <p>Select which calendars to display in ChromaCal</p>
        <div className="calendar-list">
          {availableCalendars.map(calendar => (
            <label
              key={calendar.id}
              className="calendar-item"
            >
              <input
                type="checkbox"
                checked={selectedCalendarIds.includes(calendar.id)}
                onChange={() => handleCalendarToggle(calendar.id)}
              />
              <span>{calendar.summary}</span>
              {calendar.primary && <span className="primary-badge">Primary</span>}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};