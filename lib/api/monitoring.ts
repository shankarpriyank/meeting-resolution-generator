// Re-export types from centralized location
export type { MonitoringStats } from '@/types/monitoring';

import type { MonitoringStats } from '@/types/monitoring';

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
