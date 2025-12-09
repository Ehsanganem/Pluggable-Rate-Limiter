// middleware/rateLimiterMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { RateLimiters } from "../types/rateLimiters";

export type LogFn = (key: string, allowed: boolean) => void;

export function createRateLimiterMiddleware(
  strategy: RateLimiters,
  logFn?: LogFn
) {
  return function rateLimiterMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const now = Date.now();
    const key = req.ip || "unknown";

    const allowed = strategy.allowRequest(key, now);

    if (logFn) {
      logFn(key, allowed);
    }

    if (!allowed) {
      return res.status(429).json({ error: "Too Many Requests" });
    }

    next();
  };
}
