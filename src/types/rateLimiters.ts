export interface RateLimiters {
  allowRequest(key: string, now: number): boolean;
}
