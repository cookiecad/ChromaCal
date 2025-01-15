# ChromaCal
A color coded agenda for people with time-blindness, or anyone that wants to see their schedule at a glance.

Features:
- Syncs with Google Calendar
- Clearly displays today's agenda and the next event
- Color coded background to indicate how close the next event is
- Background color changes when the day is over and its time to go home

![1736974440299](image/README/1736974440299.png)

![1736981944991](image/README/1736981944991.png)

## Usage

In order to connect to your google calendar, you'll need to create a project in google cloud console and give it permissions for calendar.

#### 1 Set Up Google API Credentials

- **Create a Project in Google Cloud Console:**
  - Navigate to [Google Cloud Console](https://console.cloud.google.com/).
  - Create a new project or select an existing one.

- **Enable Google Calendar API:**
  - Go to **APIs & Services > Library**.
  - Search for **Google Calendar API** and enable it.

- **Create OAuth 2.0 Credentials:**
  - Go to **APIs & Services > Credentials**.
  - Click **Create Credentials > OAuth client ID**.
    - Choose **Desktop app** as the application type.
    - Download the `credentials.json` file.
    - Place it in the root folder of the project

#### 2 Run the application

```bash
git clone https://github.com/cookiecad/ChromaCal.git
cd ChromaCal\chromacal

npm install
npm start
```