import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { existsSync } from 'fs';
import Store from 'electron-store';
import { setupCalendarHandlers } from './ipc/calendar-handlers';
import { preferencesStorage } from './services/storage/preferences-storage';

interface WindowState {
  windowBounds: {
    width: number;
    height: number;
  };
}

// Configure window state persistence
const store = new Store<WindowState>({
  name: 'window-state',
  defaults: {
    windowBounds: { width: 900, height: 600 }
  }
});

import squirrelStartup from 'electron-squirrel-startup';
if (squirrelStartup) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  const { width, height } = (store as any).get('windowBounds');

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width,
    height,
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

  // Save window size changes
  mainWindow.on('resize', () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    (store as any).set('windowBounds', { width: bounds.width, height: bounds.height });
  });

  // Load the index.html file.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    // In production, load from the renderer directory
    const rendererPath = join(__dirname, '..', MAIN_WINDOW_VITE_NAME, 'index.html');
    if (existsSync(rendererPath)) {
      mainWindow.loadFile(rendererPath);
      console.log('Loaded renderer from:', rendererPath);
    } else {
      console.error('Failed to find renderer at:', rendererPath);
    }
  }

  // Open DevTools in development mode
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Wait for app to be ready before setting up handlers
app.on('ready', () => {
  try {
    console.log('🚀 App ready, initializing...');
    
    // Initialize preferences storage
    console.log('📦 Initializing preferences storage...');
    preferencesStorage.getSelectedCalendarIds(); // Force initialization
    
    // Set up IPC handlers
    console.log('🔌 Setting up IPC handlers...');
    setupCalendarHandlers();
    
    // Create the main window
    console.log('🪟 Creating main window...');
    createWindow();
    
    console.log('✅ App initialization complete');
  } catch (error) {
    console.error('❌ Error during app initialization:', error);
  }
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
