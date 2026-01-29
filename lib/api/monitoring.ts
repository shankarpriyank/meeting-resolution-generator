export interface MonitoringStats {
  summary: {
    totalCalls: number;
    successRate: number;
    averageLatencyMs: number;
    totalEstimatedCost: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  };
  today: {
    date: string;
    totalCalls: number;
    successCalls: number;
    errorCalls: number;
    totalLatencyMs: number;
    totalEstimatedCost: number;
    callsByEndpoint: Record<string, number>;
    callsByProvider: Record<string, number>;
    callsByModel: Record<string, number>;
  } | null;
  recentCalls: Array<{
    id: string;
    created_at: number;
    endpoint: string;
    provider: string;
    model: string;
    status: 'success' | 'error';
    latency_ms: number;
    estimated_cost?: number;
    error_message?: string;
  }>;
  callsByEndpoint: Record<string, number>;
  callsByProvider: Record<string, number>;
  callsByModel: Record<string, number>;
  topErrors: Array<{ error: string; count: number }>;
}

/**
 * Fetch monitoring stats
 */
export async function getMonitoringStats(limit = 100): Promise<MonitoringStats> {
  const response = await fetch(`/api/monitoring?limit=${limit}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch monitoring data: ${errorText}`);
  }

  const data = await response.json();
  return data.data as MonitoringStats;
}
