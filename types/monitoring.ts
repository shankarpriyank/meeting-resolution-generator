/**
 * Monitoring and API tracking types
 */

/**
 * API provider types
 */
export type APIProvider = 'openai' | 'anthropic' | 'other';

/**
 * API call status
 */
export type APICallStatus = 'success' | 'error';

/**
 * Individual API call record
 */
export interface APICallRecord {
  id?: string;
  timestamp?: number;
  created_at?: string;
  endpoint: string;
  provider: APIProvider;
  model: string;
  status: APICallStatus;
  latency_ms: number;
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost?: number;
  error_message?: string;
  client_ip?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Daily statistics
 */
export interface DailyStats {
  date: string;
  total_calls: number;
  success_calls: number;
  error_calls: number;
  total_latency_ms: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_estimated_cost: number;
  calls_by_endpoint: Record<string, number>;
  calls_by_provider: Record<string, number>;
  calls_by_model: Record<string, number>;
  errors_by_type: Record<string, number>;
}

/**
 * Today's stats for monitoring dashboard
 */
export interface TodayStats {
  date: string;
  total_calls: number;
  success_calls: number;
  error_calls: number;
  totalLatencyMs: number;
  totalEstimatedCost: number;
  callsByEndpoint: Record<string, number>;
  callsByProvider: Record<string, number>;
  callsByModel: Record<string, number>;
}

/**
 * Recent API call record for display
 */
export interface RecentAPICall {
  id: string;
  created_at: number;
  endpoint: string;
  provider: string;
  model: string;
  status: APICallStatus;
  latency_ms: number;
  estimated_cost?: number;
  error_message?: string;
}

/**
 * Full monitoring stats response
 */
export interface MonitoringStats {
  summary: {
    totalCalls: number;
    successRate: number;
    averageLatencyMs: number;
    totalEstimatedCost: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  };
  today: TodayStats | null;
  last7Days?: DailyStats[];
  recentCalls: RecentAPICall[];
  callsByEndpoint: Record<string, number>;
  callsByProvider: Record<string, number>;
  callsByModel: Record<string, number>;
  topErrors: Array<{ error: string; count: number }>;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}
