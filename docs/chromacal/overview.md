**Overview**

---

### 1. App Layout (UI and UX)

The application is a full-screen dashboard designed for a small monitor to help users with time blindness stay on top of their schedule. The key UI components and their behaviors are as follows:

#### **Background Color Indicators**

- **Neutral Background (No Events in the Next Hour):**
  - When there are no events scheduled in the next hour, the background displays a neutral color (e.g., soft gray or blue).

- **Upcoming Event Indicator:**
  - **Color Shift:**
    - Starting one hour before the next event, the background color gradually shifts to a more noticeable hue as the event time approaches.
    - The color transition is smooth, providing a subtle cue that an event is coming up.
  - **Intensified Alert (10 Minutes Before Event):**
    - Ten minutes prior to the event, the background becomes more prominent in color to draw attention.
    - The color reaches its peak intensity at the event start time.

- **Post-Event Indicator (Up to 5 Minutes After Start):**
  - The background maintains its prominent color for five minutes into the event time.
  - This accounts for slight delays and ensures the user is still alerted if they're late.

- **End-of-Day Indicator:**
  - As the workday nears its end, the background begins to change to a different color.
  - **Overtime Alerts:**
    - If the user continues working past the designated end time, the background displays a noticeable color.
    - Messages appear indicating overtime duration, such as "15 minutes overtime," "1 hour overtime."

#### **Countdown Display**

- **Event Countdown Timer:**
  - A large, prominently displayed countdown shows the minutes remaining until the next event.
  - **Timing:**
    - Activates ten minutes before the event.
    - Counts down to the event start time.
    - Continues counting for five minutes into the event (displaying negative values like "1 minute ago").

#### **Agenda Display**

- **Daily Agenda Overview:**
  - A sidebar or overlay displays the list of events scheduled for the day.
  - **Details Shown:**
    - Event time.
    - Event title.
  - **Visibility:**
    - Always visible to allow the user to quickly glance at their upcoming schedule.

#### **User Interaction**

- **Minimal Interaction Required:**
  - The application is designed to function without the need for user input after initial setup.
  - **Settings Access (Optional):**
    - A hidden menu accessible via a specific mouse gesture or key combination to adjust settings if necessary.

### 2. Tech Overview

#### **Programming Language**

- **TypeScript:**
  - Provides type safety and modern ECMAScript features.
  - Facilitates easier maintenance and scalability.

#### **Frameworks and Libraries**

- **Electron:**
  - **Purpose:**
    - Enables building cross-platform desktop applications using web technologies.
  - **Justification:**
    - Allows the application to run locally on Linux.
    - Supports full-screen display without browser UI elements.
  - **Features Utilized:**
    - Window management for full-screen display.
    - File system access if needed for caching or settings.

- **Google Calendar API:**
  - **Purpose:**
    - Fetches the user's calendar events.
  - **Integration:**
    - Utilizes the official Google APIs Node.js Client.
    - Handles OAuth 2.0 authentication flow for accessing user data.
  - **Data Handling:**
    - Retrieves events for the current day.
    - Processes event start and end times for UI updates.

- **Node.js:**
  - **Runtime Environment:**
    - Serves as the backend environment for Electron.
  - **Module Management:**
    - Handles dependencies and packages via npm.

- **Additional Libraries:**
  - **Moment.js or date-fns:**
    - For date and time manipulation.
  - **Node-Schedule or cron:**
    - To handle scheduled tasks if needed (e.g., periodic data fetching).
  - **CSS Frameworks (Optional):**
    - If styling assistance is needed, libraries like Tailwind CSS can be integrated.

#### **Authentication and Security**

- **OAuth 2.0 Flow:**
  - Guides the user through granting the application access to their Google Calendar.
  - **Token Storage:**
    - Access and refresh tokens are securely stored locally.

- **Local Data Storage:**
  - **Purpose:**
    - Cache calendar data to reduce API calls.
    - Store user preferences or settings.

#### **Application Structure**

- **Main Process (Electron):**
  - Manages the application's lifecycle.
  - Handles system-level integrations.

- **Renderer Process:**
  - Renders the UI using HTML, CSS, and TypeScript.
  - Handles user interface updates and animations.

- **Inter-Process Communication (IPC):**
  - Facilitates communication between the main and renderer processes.

#### **Deployment and Packaging**

- **Electron Packager or Electron Builder:**
  - Packages the application into an executable for Linux.
  - **Distribution:**
    - Generates an AppImage or other Linux-compatible distributable formats.

- **Dependencies Management:**
  - All dependencies are listed in the `package.json` file.
  - Versions are locked using `package-lock.json` or `yarn.lock` for consistency.

---