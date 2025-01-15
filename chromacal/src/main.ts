import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { setupCalendarHandlers } from './ipc/calendar-handlers';

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    // Remove menu bar
    autoHideMenuBar: true,
    // Set background color to match our light theme
    backgroundColor: '#F5F5F5',
  });

  // Load the index.html file.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '..', MAIN_WINDOW_VITE_NAME, 'index.html'));
  }

  // Only open DevTools in development mode when explicitly requested
  if (process.env.NODE_ENV === 'development' && process.env.OPEN_DEVTOOLS === 'true') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Set up IPC handlers
  setupCalendarHandlers();
  
  // Create the main window
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
