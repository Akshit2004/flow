import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis credentials exist
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis only if keys are present (Singleton)
const redis = (redisUrl && redisToken) ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Create a unified RateLimiter class that wraps Upstash
export class RateLimiter {
    private limiter: Ratelimit | null = null;
    private fallbackLimit: number;
    private fallbackWindow: number; // in seconds
    private static localCache = new Map<string, { count: number, expiresAt: number }>();
    
    // Singleton instances
    private static strictInstance: RateLimiter | null = null;
    private static moderateInstance: RateLimiter | null = null;

    constructor(limiter: Ratelimit | null, fallbackLimit: number, fallbackWindow: number) {
        this.limiter = limiter;
        this.fallbackLimit = fallbackLimit;
        this.fallbackWindow = fallbackWindow;
    }

    // Returns true if allowed, false if blocked
    async check(identifier: string): Promise<boolean> {
        if (this.limiter) {
            try {
                const { success } = await this.limiter.limit(identifier);
                return success;
            } catch (error) {
                console.error("Rate limit error:", error);
                // Fail open to avoid blocking legitimate users on infrastructure error
                // But try local fallback first
                return this.checkLocal(identifier);
            }
        }
        
        return this.checkLocal(identifier);
    }

    private checkLocal(identifier: string): boolean {
        const now = Date.now();
        // Create a unique key for the fallback cache based on identifier and window
        // helping differentiate strict vs moderate limits for the same identifier
        const key = `${identifier}:${this.fallbackWindow}`;
        
        const record = RateLimiter.localCache.get(key);

        if (record && now < record.expiresAt) {
            if (record.count >= this.fallbackLimit) {
                return false;
            }
            record.count++;
            return true;
        }

        // Initialize or reset
        RateLimiter.localCache.set(key, {
            count: 1,
            expiresAt: now + (this.fallbackWindow * 1000)
        });

        // Simple maintenance: clear cache if it grows too large to prevent memory leaks
        if (RateLimiter.localCache.size > 10000) {
            RateLimiter.localCache.clear();
        }

        return true;
    }

    static strict() {
        if (this.strictInstance) return this.strictInstance;

        if (!redis) {
            console.warn("Redis credentials missing. Rate limiting falling back to in-memory.");
            this.strictInstance = new RateLimiter(null, 5, 10);
        } else {
             // 5 requests per 10 seconds
            this.strictInstance = new RateLimiter(
                new Ratelimit({
                    redis: redis,
                    limiter: Ratelimit.slidingWindow(5, "10 s"),
                    analytics: true,
                }),
                5,
                10
            );
        }
        return this.strictInstance;
    }

    static moderate() {
        if (this.moderateInstance) return this.moderateInstance;

        if (!redis) {
            this.moderateInstance = new RateLimiter(null, 60, 60);
        } else {
            // 60 requests per 60 seconds
            this.moderateInstance = new RateLimiter(
                new Ratelimit({
                    redis: redis,
                    limiter: Ratelimit.slidingWindow(60, "60 s"),
                    analytics: true,
                }),
                60,
                60
            );
        }
        return this.moderateInstance;
    }
}

export async function checkRateLimit(identifier: string, type: 'strict' | 'moderate' = 'moderate'): Promise<{ success: boolean }> {
    const limiter = type === 'strict' ? RateLimiter.strict() : RateLimiter.moderate();
    const success = await limiter.check(identifier);
    return { success };
}
