export interface RateLimiter {
  allowRequest(key: string, now: number): boolean;
}
