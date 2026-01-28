/**
 * AI API Monitoring System
 * Tracks usage, costs, latency, and errors for AI API calls
 */

export interface APICallRecord {
    id: string;
    timestamp: number;
    endpoint: string;
    provider: 'openai' | 'anthropic' | 'other';
    model: string;
    status: 'success' | 'error';
    latencyMs: number;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    errorMessage?: string;
    clientIp?: string;
    metadata?: Record<string, any>;
}

interface DailyStats {
    date: string;
    totalCalls: number;
    successCalls: number;
    errorCalls: number;
    totalLatencyMs: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalEstimatedCost: number;
    callsByEndpoint: Record<string, number>;
    callsByProvider: Record<string, number>;
    callsByModel: Record<string, number>;
    errorsByType: Record<string, number>;
}

// In-memory storage for monitoring data
// For production, use a proper database or analytics service
const apiCallRecords: APICallRecord[] = [];
const dailyStats: Map<string, DailyStats> = new Map();

// Maximum records to keep in memory (adjust based on memory constraints)
const MAX_RECORDS = 10000;

// Cost estimates per 1K tokens (approximate, update as needed)
const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
    'whisper-1': { input: 0.006, output: 0 }, // Per minute, not tokens
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

/**
 * Generate a unique ID for each record
 */
const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get today's date string in YYYY-MM-DD format
 */
const getTodayString = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Calculate estimated cost based on model and token usage
 */
export const calculateCost = (
    model: string,
    inputTokens: number = 0,
    outputTokens: number = 0
): number => {
    const costs = COST_PER_1K_TOKENS[model];
    if (!costs) return 0;
    
    return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
};

/**
 * Initialize or get daily stats for a given date
 */
const getOrCreateDailyStats = (date: string): DailyStats => {
    let stats = dailyStats.get(date);
    if (!stats) {
        stats = {
            date,
            totalCalls: 0,
            successCalls: 0,
            errorCalls: 0,
            totalLatencyMs: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalEstimatedCost: 0,
            callsByEndpoint: {},
            callsByProvider: {},
            callsByModel: {},
            errorsByType: {},
        };
        dailyStats.set(date, stats);
    }
    return stats;
};

/**
 * Record an API call
 */
export const recordAPICall = (record: Omit<APICallRecord, 'id' | 'timestamp'>): APICallRecord => {
    const fullRecord: APICallRecord = {
        ...record,
        id: generateId(),
        timestamp: Date.now(),
    };
    
    // Add to records array
    apiCallRecords.push(fullRecord);
    
    // Trim if exceeds max
    if (apiCallRecords.length > MAX_RECORDS) {
        apiCallRecords.splice(0, apiCallRecords.length - MAX_RECORDS);
    }
    
    // Update daily stats
    const today = getTodayString();
    const stats = getOrCreateDailyStats(today);
    
    stats.totalCalls++;
    if (record.status === 'success') {
        stats.successCalls++;
    } else {
        stats.errorCalls++;
        if (record.errorMessage) {
            const errorType = record.errorMessage.substring(0, 50);
            stats.errorsByType[errorType] = (stats.errorsByType[errorType] || 0) + 1;
        }
    }
    
    stats.totalLatencyMs += record.latencyMs;
    stats.totalInputTokens += record.inputTokens || 0;
    stats.totalOutputTokens += record.outputTokens || 0;
    stats.totalEstimatedCost += record.estimatedCost || 0;
    
    stats.callsByEndpoint[record.endpoint] = (stats.callsByEndpoint[record.endpoint] || 0) + 1;
    stats.callsByProvider[record.provider] = (stats.callsByProvider[record.provider] || 0) + 1;
    stats.callsByModel[record.model] = (stats.callsByModel[record.model] || 0) + 1;
    
    return fullRecord;
};

/**
 * Get monitoring statistics
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
    today: DailyStats | null;
    last7Days: DailyStats[];
    recentCalls: APICallRecord[];
    callsByEndpoint: Record<string, number>;
    callsByProvider: Record<string, number>;
    callsByModel: Record<string, number>;
    topErrors: Array<{ error: string; count: number }>;
}

export const getMonitoringStats = (limit: number = 50): MonitoringStats => {
    const today = getTodayString();
    const todayStats = dailyStats.get(today) || null;
    
    // Get last 7 days stats
    const last7Days: DailyStats[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const stats = dailyStats.get(dateStr);
        if (stats) {
            last7Days.push(stats);
        }
    }
    
    // Calculate summary stats
    let totalCalls = 0;
    let successCalls = 0;
    let totalLatency = 0;
    let totalCost = 0;
    let totalInput = 0;
    let totalOutput = 0;
    const allCallsByEndpoint: Record<string, number> = {};
    const allCallsByProvider: Record<string, number> = {};
    const allCallsByModel: Record<string, number> = {};
    const allErrors: Record<string, number> = {};
    
    for (const stats of dailyStats.values()) {
        totalCalls += stats.totalCalls;
        successCalls += stats.successCalls;
        totalLatency += stats.totalLatencyMs;
        totalCost += stats.totalEstimatedCost;
        totalInput += stats.totalInputTokens;
        totalOutput += stats.totalOutputTokens;
        
        for (const [endpoint, count] of Object.entries(stats.callsByEndpoint)) {
            allCallsByEndpoint[endpoint] = (allCallsByEndpoint[endpoint] || 0) + count;
        }
        for (const [provider, count] of Object.entries(stats.callsByProvider)) {
            allCallsByProvider[provider] = (allCallsByProvider[provider] || 0) + count;
        }
        for (const [model, count] of Object.entries(stats.callsByModel)) {
            allCallsByModel[model] = (allCallsByModel[model] || 0) + count;
        }
        for (const [error, count] of Object.entries(stats.errorsByType)) {
            allErrors[error] = (allErrors[error] || 0) + count;
        }
    }
    
    // Sort errors by count
    const topErrors = Object.entries(allErrors)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    return {
        summary: {
            totalCalls,
            successRate: totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0,
            averageLatencyMs: totalCalls > 0 ? totalLatency / totalCalls : 0,
            totalEstimatedCost: totalCost,
            totalInputTokens: totalInput,
            totalOutputTokens: totalOutput,
        },
        today: todayStats,
        last7Days,
        recentCalls: apiCallRecords.slice(-limit).reverse(),
        callsByEndpoint: allCallsByEndpoint,
        callsByProvider: allCallsByProvider,
        callsByModel: allCallsByModel,
        topErrors,
    };
};

/**
 * Get records for a specific time range
 */
export const getRecordsByTimeRange = (
    startTime: number,
    endTime: number
): APICallRecord[] => {
    return apiCallRecords.filter(
        record => record.timestamp >= startTime && record.timestamp <= endTime
    );
};

/**
 * Clear old records (older than specified days)
 */
export const clearOldRecords = (daysToKeep: number = 30): number => {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const cutoffDate = new Date(cutoffTime).toISOString().split('T')[0];
    
    // Remove old records
    const initialLength = apiCallRecords.length;
    const remainingRecords = apiCallRecords.filter(record => record.timestamp >= cutoffTime);
    apiCallRecords.length = 0;
    apiCallRecords.push(...remainingRecords);
    
    // Remove old daily stats
    for (const [date] of dailyStats) {
        if (date < cutoffDate) {
            dailyStats.delete(date);
        }
    }
    
    return initialLength - apiCallRecords.length;
};

/**
 * Helper to wrap async API calls with monitoring
 */
export const withMonitoring = async <T>(
    endpoint: string,
    provider: 'openai' | 'anthropic' | 'other',
    model: string,
    clientIp: string | undefined,
    apiCall: () => Promise<T>,
    getTokensFromResult?: (result: T) => { inputTokens?: number; outputTokens?: number }
): Promise<T> => {
    const startTime = Date.now();
    
    try {
        const result = await apiCall();
        const latencyMs = Date.now() - startTime;
        
        let inputTokens: number | undefined;
        let outputTokens: number | undefined;
        
        if (getTokensFromResult) {
            const tokens = getTokensFromResult(result);
            inputTokens = tokens.inputTokens;
            outputTokens = tokens.outputTokens;
        }
        
        const estimatedCost = calculateCost(model, inputTokens, outputTokens);
        
        recordAPICall({
            endpoint,
            provider,
            model,
            status: 'success',
            latencyMs,
            inputTokens,
            outputTokens,
            estimatedCost,
            clientIp,
        });
        
        return result;
    } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        
        recordAPICall({
            endpoint,
            provider,
            model,
            status: 'error',
            latencyMs,
            errorMessage: error.message || 'Unknown error',
            clientIp,
        });
        
        throw error;
    }
};
