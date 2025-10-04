/**
 * Beds24 API Rate Limiter
 * Handles rate limiting per Beds24 API guidelines
 */

import { RateLimitInfo } from './types';

export class Beds24RateLimiter {
  private lastApiCall: number = 0;
  private readonly minDelayBetweenCalls = 2000; // 2 seconds per Beds24 guidelines
  private readonly maxRequestsPerMinute = 30; // Per official documentation
  private requestCount: number = 0;
  private requestWindowStart: number = Date.now();
  private rateLimitInfo: RateLimitInfo = {};

  /**
   * Wait for rate limit before making API call
   */
  async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;

    // Reset request count if window expired (1 minute)
    if (now - this.requestWindowStart > 60000) {
      this.requestCount = 0;
      this.requestWindowStart = now;
    }

    // Check if we've hit the per-minute limit
    if (this.requestCount >= this.maxRequestsPerMinute) {
      const waitTime = 60000 - (now - this.requestWindowStart);
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`);
        await this.sleep(waitTime);
        this.requestCount = 0;
        this.requestWindowStart = Date.now();
      }
    }

    // Enforce minimum delay between calls
    if (timeSinceLastCall < this.minDelayBetweenCalls) {
      const waitTime = this.minDelayBetweenCalls - timeSinceLastCall;
      await this.sleep(waitTime);
    }

    this.lastApiCall = Date.now();
    this.requestCount++;
  }

  /**
   * Update rate limit info from response headers
   */
  updateFromHeaders(headers: Headers): void {
    const fiveMinLimit = headers.get('X-RateLimit-5min-Limit');
    const fiveMinRemaining = headers.get('X-RateLimit-5min-Remaining');
    const fiveMinResetsIn = headers.get('X-RateLimit-5min-Resets-In');
    const requestCost = headers.get('X-RateLimit-Request-Cost');

    if (fiveMinLimit) this.rateLimitInfo.fiveMinLimit = parseInt(fiveMinLimit);
    if (fiveMinRemaining) this.rateLimitInfo.fiveMinRemaining = parseInt(fiveMinRemaining);
    if (fiveMinResetsIn) this.rateLimitInfo.fiveMinResetsIn = parseInt(fiveMinResetsIn);
    if (requestCost) this.rateLimitInfo.requestCost = parseInt(requestCost);

    // Log warning if approaching limit
    if (this.rateLimitInfo.fiveMinRemaining && this.rateLimitInfo.fiveMinRemaining < 10) {
      console.warn(`⚠️ Beds24 rate limit warning: ${this.rateLimitInfo.fiveMinRemaining} requests remaining`);
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
