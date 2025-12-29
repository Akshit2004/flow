import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis credentials exist
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Create a unified RateLimiter class that wraps Upstash
export class RateLimiter {
    private limiter: Ratelimit | null = null;
    private fallbackLimit: number;
    private fallbackWindow: number; // in seconds

    constructor(limiter: Ratelimit, fallbackLimit: number, fallbackWindow: number) {
        this.limiter = limiter;
        this.fallbackLimit = fallbackLimit;
        this.fallbackWindow = fallbackWindow;
    }

    // Returns true if allowed, false if blocked
    async check(identifier: string): Promise<boolean> {
        if (!this.limiter) {
            // Fallback or skip if no Redis
            return true;
        }

        try {
            const { success } = await this.limiter.limit(identifier);
            return success;
        } catch (error) {
            console.error("Rate limit error:", error);
            // Fail open to avoid blocking legitimate users on infrastructure error
            return true;
        }
    }

    static strict() {
        if (!redisUrl || !redisToken) {
            console.warn("Redis credentials missing. Rate limiting disabled.");
            return new RateLimiter(null as any, 5, 10);
        }

        // 5 requests per 10 seconds
        return new RateLimiter(
            new Ratelimit({
                redis: new Redis({
                    url: redisUrl,
                    token: redisToken,
                }),
                limiter: Ratelimit.slidingWindow(5, "10 s"),
                analytics: true,
            }),
            5,
            10
        );
    }

    static moderate() {
        if (!redisUrl || !redisToken) {
            return new RateLimiter(null as any, 60, 60);
        }

        // 60 requests per 60 seconds
        return new RateLimiter(
            new Ratelimit({
                redis: new Redis({
                    url: redisUrl,
                    token: redisToken,
                }),
                limiter: Ratelimit.slidingWindow(60, "60 s"),
                analytics: true,
            }),
            60,
            60
        );
    }
}

export async function checkRateLimit(identifier: string, type: 'strict' | 'moderate' = 'moderate'): Promise<{ success: boolean }> {
    const limiter = type === 'strict' ? RateLimiter.strict() : RateLimiter.moderate();
    const success = await limiter.check(identifier);
    return { success };
}
