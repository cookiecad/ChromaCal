import React, { useEffect, useState } from 'react';
import { Calendar } from '../../services/google-calendar/calendar';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
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
      <button
        className="back-button"
        onClick={() => navigate('/')}
        aria-label="Back to dashboard"
      >
        <svg viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
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