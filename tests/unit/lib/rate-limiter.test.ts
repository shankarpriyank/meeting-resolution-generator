import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMIT_TIERS,
  type RateLimitResult,
} from '@/lib/rate-limiter';

describe('rate-limiter', () => {
  beforeEach(() => {
    // Reset time mocks before each test
    vi.useFakeTimers();
  });

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      });
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.2');
    });

    it('should extract IP from cf-connecting-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '192.168.1.3',
        },
      });
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.3');
    });

    it('should return anonymous when no IP headers present', () => {
      const request = new Request('http://localhost');
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('anonymous');
    });

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
          'cf-connecting-ip': '192.168.1.3',
        },
      });
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within the limit', () => {
      const result = checkRateLimit('test-ip', 'test-endpoint', RATE_LIMIT_TIERS.STANDARD);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_TIERS.STANDARD.maxRequests - 1);
    });

    it('should track requests per identifier and endpoint', () => {
      // First request
      let result = checkRateLimit('ip-1', 'endpoint-1', RATE_LIMIT_TIERS.STANDARD);
      expect(result.remaining).toBe(29);

      // Second request same identifier and endpoint
      result = checkRateLimit('ip-1', 'endpoint-1', RATE_LIMIT_TIERS.STANDARD);
      expect(result.remaining).toBe(28);

      // Request from different identifier
      result = checkRateLimit('ip-2', 'endpoint-1', RATE_LIMIT_TIERS.STANDARD);
      expect(result.remaining).toBe(29);

      // Request to different endpoint
      result = checkRateLimit('ip-1', 'endpoint-2', RATE_LIMIT_TIERS.STANDARD);
      expect(result.remaining).toBe(29);
    });

    it('should block requests when limit is exceeded', () => {
      const config = { windowMs: 60000, maxRequests: 3 };

      // Exhaust the limit
      checkRateLimit('limited-ip', 'limited-endpoint', config);
      checkRateLimit('limited-ip', 'limited-endpoint', config);
      checkRateLimit('limited-ip', 'limited-endpoint', config);

      // Fourth request should be blocked
      const result = checkRateLimit('limited-ip', 'limited-endpoint', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it('should reset after the time window expires', () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // Exhaust the limit
      checkRateLimit('reset-ip', 'reset-endpoint', config);
      checkRateLimit('reset-ip', 'reset-endpoint', config);

      let result = checkRateLimit('reset-ip', 'reset-endpoint', config);
      expect(result.success).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      result = checkRateLimit('reset-ip', 'reset-endpoint', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should use AI_STRICT tier correctly', () => {
      const result = checkRateLimit('ai-ip', 'ai-endpoint', RATE_LIMIT_TIERS.AI_STRICT);
      expect(result.limit).toBe(10);
    });

    it('should use RELAXED tier correctly', () => {
      const result = checkRateLimit('relaxed-ip', 'relaxed-endpoint', RATE_LIMIT_TIERS.RELAXED);
      expect(result.limit).toBe(60);
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should create headers for successful request', () => {
      const result: RateLimitResult = {
        success: true,
        limit: 30,
        remaining: 29,
        resetTime: Date.now() + 60000,
      };

      const headers = createRateLimitHeaders(result);
      expect(headers['X-RateLimit-Limit']).toBe('30');
      expect(headers['X-RateLimit-Remaining']).toBe('29');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After header for rate limited request', () => {
      const result: RateLimitResult = {
        success: false,
        limit: 30,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
      };

      const headers = createRateLimitHeaders(result);
      expect(headers['Retry-After']).toBe('60');
    });
  });

  describe('RATE_LIMIT_TIERS', () => {
    it('should have correct AI_STRICT configuration', () => {
      expect(RATE_LIMIT_TIERS.AI_STRICT.windowMs).toBe(60000);
      expect(RATE_LIMIT_TIERS.AI_STRICT.maxRequests).toBe(10);
    });

    it('should have correct STANDARD configuration', () => {
      expect(RATE_LIMIT_TIERS.STANDARD.windowMs).toBe(60000);
      expect(RATE_LIMIT_TIERS.STANDARD.maxRequests).toBe(30);
    });

    it('should have correct RELAXED configuration', () => {
      expect(RATE_LIMIT_TIERS.RELAXED.windowMs).toBe(60000);
      expect(RATE_LIMIT_TIERS.RELAXED.maxRequests).toBe(60);
    });
  });
});
