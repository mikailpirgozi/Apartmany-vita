/**
 * Beds24 Authentication Module
 * Handles token management and refresh
 */

import { Beds24Config, TokenRefreshResponse } from './types';
import { log } from '@/lib/logger';

export class Beds24Auth {
  private config: Beds24Config;

  constructor(config: Beds24Config) {
    this.config = config;
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(): boolean {
    if (!this.config.tokenExpiresAt) return true;
    
    // Refresh 5 minutes before expiry
    const bufferTime = 5 * 60 * 1000;
    return Date.now() >= (this.config.tokenExpiresAt - bufferTime);
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    if (!this.config.refreshToken) {
      log.warn('No refresh token available, using existing access token');
      return;
    }

    try {
      log.info('Refreshing Beds24 access token...');

      const response = await fetch(`${this.config.baseUrl}/authentication/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.config.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const data: TokenRefreshResponse = await response.json();

      // Update config with new tokens
      this.config.accessToken = data.token;
      this.config.refreshToken = data.refreshToken;
      this.config.tokenExpiresAt = Date.now() + (data.expiresIn * 1000);

      log.info('✅ Beds24 token refreshed successfully', {
        expiresIn: `${data.expiresIn}s`
      });

    } catch (error) {
      log.error('Failed to refresh Beds24 token', error);
      throw error;
    }
  }

  /**
   * Get current access token (refresh if needed)
   */
  async getAccessToken(): Promise<string> {
    if (this.needsRefresh()) {
      await this.refreshToken();
    }
    return this.config.accessToken;
  }

  /**
   * Get config
   */
  getConfig(): Beds24Config {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(updates: Partial<Beds24Config>): void {
    this.config = { ...this.config, ...updates };
  }
}
