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
    const tokenData: TokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    };
    (this.store as any).set('tokens', tokenData);
  }

  public getTokens(): TokenData | null {
    return (this.store as any).get('tokens');
  }

  public clearTokens(): void {
    (this.store as any).delete('tokens');
  }

  public hasValidTokens(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;

    // Check if tokens are expired (with 5 minute buffer)
    const now = Date.now();
    return tokens.expiry_date > now + 5 * 60 * 1000;
  }

  public isAuthenticated(): boolean {
    return this.hasValidTokens();
  }
}

export const tokenStorage = TokenStorage.getInstance();