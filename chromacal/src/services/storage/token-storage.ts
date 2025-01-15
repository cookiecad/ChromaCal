import Store from 'electron-store';
import { app } from 'electron';
import crypto from 'crypto';

interface TokenData {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

interface StoreSchema {
  tokens: TokenData | null;
}

class TokenStorage {
  private static instance: TokenStorage;
  private store: Store<StoreSchema>;

  private constructor() {
    // Generate a stable encryption key based on the app path
    const appPath = app.getPath('userData');
    const encryptionKey = crypto
      .createHash('sha256')
      .update(appPath)
      .digest('hex')
      .slice(0, 32);

    this.store = new Store<StoreSchema>({
      name: 'auth-tokens',
      encryptionKey,
      clearInvalidConfig: true,
      defaults: {
        tokens: null
      }
    });
  }

  public static getInstance(): TokenStorage {
    if (!TokenStorage.instance) {
      TokenStorage.instance = new TokenStorage();
    }
    return TokenStorage.instance;
  }

  public saveTokens(tokens: TokenData): void {
    console.log('💾 Saving tokens to storage...');
    const tokenData: TokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    };
    console.log('📝 Token data:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiryDate: new Date(tokenData.expiry_date).toISOString()
    });
    (this.store as any).set('tokens', tokenData);
    console.log('✅ Tokens saved successfully');
  }

  public getTokens(): TokenData | null {
    console.log('🔍 Retrieving tokens from storage...');
    const tokens = (this.store as any).get('tokens');
    if (tokens) {
      console.log('📝 Retrieved tokens:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date).toISOString()
      });
    } else {
      console.log('ℹ️ No tokens found in storage');
    }
    return tokens;
  }

  public clearTokens(): void {
    console.log('🗑️ Clearing all stored tokens...');
    (this.store as any).clear();  // Clear all stored data
    (this.store as any).set('tokens', null);  // Explicitly set tokens to null
    console.log('✅ Token storage cleared');
  }

  public hasValidTokens(): boolean {
    console.log('🔍 Checking token validity...');
    const tokens = this.getTokens();
    if (!tokens || !tokens.access_token || !tokens.refresh_token) {
      console.log('❌ Missing required tokens');
      return false;
    }

    // Check if tokens are expired (with 5 minute buffer)
    const now = Date.now();
    const isValid = tokens.expiry_date > now + 5 * 60 * 1000;
    console.log('⏰ Token expiry check:', {
      now: new Date(now).toISOString(),
      expiry: new Date(tokens.expiry_date).toISOString(),
      isValid
    });
    return isValid;
  }

  public isAuthenticated(): boolean {
    return this.hasValidTokens();
  }
}

export const tokenStorage = TokenStorage.getInstance();