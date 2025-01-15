import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { readFileSync } from 'fs';
import { join } from 'path';
import { app, BrowserWindow } from 'electron';
import { tokenStorage } from '../storage/token-storage';

interface Credentials {
  installed: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

export class GoogleCalendarAuth {
  private static instance: GoogleCalendarAuth;
  private oauth2Client: OAuth2Client;
  private credentials: Credentials;

  private constructor() {
    // Load credentials from file
    const credPath = join(app.getAppPath(), 'client_secret_420752923285-offngbturqbccedoaiv6rv17b28gh3du.apps.googleusercontent.com.json');
    this.credentials = JSON.parse(readFileSync(credPath, 'utf-8'));

    this.oauth2Client = new google.auth.OAuth2(
      this.credentials.installed.client_id,
      this.credentials.installed.client_secret,
      this.credentials.installed.redirect_uris[0]
    );

    // Load existing tokens if available
    const savedTokens = tokenStorage.getTokens();
    if (savedTokens) {
      this.oauth2Client.setCredentials({
        access_token: savedTokens.access_token,
        refresh_token: savedTokens.refresh_token,
        expiry_date: savedTokens.expiry_date
      });
    }

    // Set up token refresh handler
    this.oauth2Client.on('tokens', (tokens) => {
      const savedTokens = tokenStorage.getTokens();
      tokenStorage.saveTokens({
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || savedTokens?.refresh_token || '',
        expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000
      });
    });
  }

  public static getInstance(): GoogleCalendarAuth {
    if (!GoogleCalendarAuth.instance) {
      GoogleCalendarAuth.instance = new GoogleCalendarAuth();
    }
    return GoogleCalendarAuth.instance;
  }

  public async startAuthFlow(): Promise<any> {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
      prompt: 'consent',
      // Force approval prompt to ensure we get a refresh token
      approval_prompt: 'force'
    });

    // Create a new window for auth
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    return new Promise((resolve, reject) => {
      let handled = false;

      // Handle the OAuth callback
      const handleCallback = async (url: string) => {
        if (handled) return;
        handled = true;

        const urlParams = new URLSearchParams(url.split('?')[1]);
        const code = urlParams.get('code');
        
        if (code) {
          try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            
            // Save tokens
            tokenStorage.saveTokens({
              access_token: tokens.access_token!,
              refresh_token: tokens.refresh_token!,
              expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000
            });

            win.close();
            resolve(tokens);
          } catch (error) {
            win.close();
            reject(error);
          }
        }
      };

      // Listen for redirects in the auth window
      win.webContents.on('will-redirect', (event, url) => {
        if (url.startsWith(this.credentials.installed.redirect_uris[0])) {
          handleCallback(url);
        }
      });

      // Also listen for navigation in case of redirect handling
      win.webContents.on('will-navigate', (event, url) => {
        if (url.startsWith(this.credentials.installed.redirect_uris[0])) {
          handleCallback(url);
        }
      });

      // Handle window close
      win.on('closed', () => {
        if (!handled) {
          reject(new Error('Authentication window was closed'));
        }
      });

      // Load the auth URL
      win.loadURL(authUrl).catch(error => {
        reject(error);
      });
    });
  }

  public getOAuth2Client(): OAuth2Client {
    return this.oauth2Client;
  }

  public async validateToken(): Promise<boolean> {
    try {
      if (!tokenStorage.hasValidTokens()) {
        return false;
      }

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      await calendar.calendarList.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  public isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated();
  }
}

export const googleCalendarAuth = GoogleCalendarAuth.getInstance();