# ChromaCal Implementation Guide

## UI Configuration

### Time Display
- Default: 12-hour format (e.g., "9:15 PM")
- Optional 24-hour format available through `formatTime` function
- Time is displayed in Inter font at 96px size
- Centered in the viewport with proper vertical rhythm

### Window Configuration
- Default window size: 900x600 pixels
- Not fullscreen by default
- Menu bar hidden
- Background color matches design system (#F5F5F5)

### Typography System
```css
/* Font Scale */
Display (Time): 96px
H1 (Event): 48px
H2 (Secondary): 32px
Body: 16px
Caption: 14px

/* Line Heights */
Display: 1.1
Headers: 1.25
Body: 1.5

/* Font Weights */
Regular: 400
Medium: 500
Bold: 700
```

### Color System
```css
/* Backgrounds */
Neutral: #F5F5F5 (Light gray)
Approaching: #E6F3FF (Soft blue)
Imminent: #CCE5FF (Deeper blue)
After Hours: #F0E6FF (Soft purple)

/* Typography */
Primary Text: #1A1A1A
Secondary Text: #4A4A4A
Accent: #0066CC
Time Display: #000000
```

### Layout
- Main content centered in viewport
- Agenda sidebar fixed to right (320px width)
- Proper spacing using 8px grid system
- Responsive design with mobile considerations

## Implementation Details

### Project Structure
```
chromacal/
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── auth/
│   │   │   └── Login.tsx
│   │   └── dashboard/
│   │       └── Dashboard.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   ├── color-manager.ts
│   │   ├── storage/
│   │   │   └── token-storage.ts
│   │   └── google-calendar/
│   │       ├── auth.ts
│   │       └── calendar.ts
│   ├── ipc/
│   │   └── calendar-handlers.ts
│   └── index.css (design system)
```

### Core Components

#### Dashboard
- Displays current time in 12-hour format by default
- Shows upcoming or current event
- Manages background color transitions
- Handles event status updates

#### Color Manager
- Manages background color states
- Handles transitions between states
- Follows design system color palette

#### Auth System
- Handles Google Calendar authentication
- Manages token persistence
- Provides login/logout functionality

### State Management
- Uses React Context for auth state
- Local state for UI components
- IPC for main process communication

### Event Handling
- Fetches events on component mount
- Updates every minute
- Manages event status changes
- Handles background color transitions

### Security
- Context isolation enabled
- Secure token storage
- No exposed credentials
- Proper preload script configuration

## Development Workflow

### Starting Development
```bash
npm start
```

### Building for Production
```bash
npm run make
```

### Testing
```bash
npm test
```

## Customization Options

### Time Format
```typescript
// In Dashboard.tsx
const formatTime = (date: Date, use24Hour = false) => {
  // Format time to match typography guide (e.g., "9:15 PM" or "21:15")
  const time = date.toLocaleTimeString('en-US', {
    hour12: !use24Hour,
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // For 12-hour format, ensure proper spacing around AM/PM
  if (!use24Hour) {
    const [timePart, meridiem] = time.split(' ');
    return `${timePart} ${meridiem}`;
  }
  
  return time;
};
```

### Window Size
```typescript
// In main.ts
const mainWindow = new BrowserWindow({
  width: 900,
  height: 600,
  // ... other options
});
```

### Color Schemes
Colors are defined in CSS variables for easy customization:
```css
:root {
  --color-bg-neutral: #F5F5F5;
  --color-bg-approaching: #E6F3FF;
  --color-bg-imminent: #CCE5FF;
  --color-bg-afterhours: #F0E6FF;
}