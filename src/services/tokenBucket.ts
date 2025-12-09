import { RateLimiter } from "../types/interfaces/rateLimiter";
import { TokenBucket } from "../types/tokenBucket";

export class tockenBucketRateLimiter implements RateLimiter {
  private readonly capacity: number;
  private readonly refillRate: number;

  private buckets: Map<string, TokenBucket> = new Map();

  constructor(capacity: number, rateLimits: number) {
    this.capacity = capacity;
    this.refillRate = rateLimits;
  }

  getBucket(key: string, now: number): TokenBucket {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.capacity,
        lastRefillTimestamp: now,
      });
    }

    return this.buckets.get(key)!;
  }

  refill(bucket: TokenBucket, now: number): void {
    const elapsedMs = now - bucket.lastRefillTimestamp;

    if (elapsedMs <= 0) return;

    // Convert ms into "tokens to add"
    const tokensToAdd = (elapsedMs / 1000) * this.refillRate;

    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);

    bucket.lastRefillTimestamp = now;
  }

  allowRequest(key: string, now: number): boolean {
    const bucket = this.getBucket(key, now);

    // 1) refill based on time
    this.refill(bucket, now);

    // 2) check if we have a token
    if (bucket.tokens < 1) {
      return false; // reject request
    }

    // 3) consume one token and allow
    bucket.tokens -= 1;
    return true;
  }
}
