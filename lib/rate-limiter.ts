/**
 * In-memory rate limiter for API routes
 * For production, consider using Redis or a distributed rate limiting solution
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Maximum requests per window
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different rate limit tiers
export const RATE_LIMIT_TIERS = {
    // Strict tier for expensive AI operations
    AI_STRICT: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 10,          // 10 requests per minute
    },
    // Standard tier for regular API calls
    STANDARD: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 30,          // 30 requests per minute
    },
    // Relaxed tier for less sensitive endpoints
    RELAXED: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 60,          // 60 requests per minute
    },
} as const;

/**
 * Clean up expired entries periodically
 */
const cleanupExpiredEntries = () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Get client identifier from request
 */
export const getClientIdentifier = (request: Request): string => {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    // Use the first available IP, or fallback to 'anonymous'
    const ip = forwarded?.split(',')[0]?.trim() || 
               realIp || 
               cfConnectingIp || 
               'anonymous';
    
    return ip;
};

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}

/**
 * Check rate limit for a given identifier and endpoint
 */
export const checkRateLimit = (
    identifier: string,
    endpoint: string,
    config: RateLimitConfig = RATE_LIMIT_TIERS.STANDARD
): RateLimitResult => {
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    
    let entry = rateLimitStore.get(key);
    
    // If no entry exists or the window has expired, create a new one
    if (!entry || now > entry.resetTime) {
        entry = {
            count: 0,
            resetTime: now + config.windowMs,
        };
    }
    
    // Increment the counter
    entry.count++;
    rateLimitStore.set(key, entry);
    
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const success = entry.count <= config.maxRequests;
    
    const result: RateLimitResult = {
        success,
        limit: config.maxRequests,
        remaining,
        resetTime: entry.resetTime,
    };
    
    if (!success) {
        result.retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    }
    
    return result;
};

/**
 * Create rate limit headers for response
 */
export const createRateLimitHeaders = (result: RateLimitResult): Record<string, string> => {
    const headers: Record<string, string> = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString(),
    };
    
    if (result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString();
    }
    
    return headers;
};

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export const withRateLimit = (
    handler: (request: Request) => Promise<Response>,
    endpoint: string,
    config: RateLimitConfig = RATE_LIMIT_TIERS.STANDARD
) => {
    return async (request: Request): Promise<Response> => {
        const identifier = getClientIdentifier(request);
        const result = checkRateLimit(identifier, endpoint, config);
        
        if (!result.success) {
            return new Response(
                JSON.stringify({
                    error: 'Too many requests',
                    message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
                    retryAfter: result.retryAfter,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        ...createRateLimitHeaders(result),
                    },
                }
            );
        }
        
        const response = await handler(request);
        
        // Add rate limit headers to successful response
        const headers = new Headers(response.headers);
        const rateLimitHeaders = createRateLimitHeaders(result);
        Object.entries(rateLimitHeaders).forEach(([key, value]) => {
            headers.set(key, value);
        });
        
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    };
};
