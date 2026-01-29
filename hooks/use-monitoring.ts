import { useEffect, useState, useCallback } from 'react';
import { getMonitoringStats, type MonitoringStats } from '@/lib/api/monitoring';

interface UseMonitoringReturn {
  stats: MonitoringStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMonitoring(limit = 100, autoRefreshMs = 30000): UseMonitoringReturn {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMonitoringStats(limit);
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch monitoring data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchStats();

    if (!autoRefreshMs) return;

    const interval = setInterval(fetchStats, autoRefreshMs);
    return () => clearInterval(interval);
  }, [fetchStats, autoRefreshMs]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
