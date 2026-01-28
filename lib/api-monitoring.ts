/**
 * AI API Monitoring System
 * Tracks usage, costs, latency, and errors for AI API calls
 * Uses Supabase for persistent storage
 */

import { supabase } from './supabase';

export interface APICallRecord {
    id?: string;
    timestamp?: number;
    created_at?: string;
    endpoint: string;
    provider: 'openai' | 'anthropic' | 'other';
    model: string;
    status: 'success' | 'error';
    latency_ms: number;
    input_tokens?: number;
    output_tokens?: number;
    estimated_cost?: number;
    error_message?: string;
    client_ip?: string;
    metadata?: Record<string, any>;
}

interface DailyStats {
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

// Cost estimates per 1K tokens (approximate, update as needed)
const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
    'whisper-1': { input: 0.006, output: 0 }, // Per minute, not tokens
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
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
 * Record an API call to Supabase
 */
export const recordAPICall = async (
    record: Omit<APICallRecord, 'id' | 'timestamp' | 'created_at'>
): Promise<APICallRecord | null> => {
    try {
        console.log(record)
        const { data, error } = await supabase
            .from('api_call_records')
            .insert({
                endpoint: record.endpoint,
                provider: record.provider,
                model: record.model,
                status: record.status,
                latency_ms: record.latency_ms,
                input_tokens: record.input_tokens || null,
                output_tokens: record.output_tokens || null,
                estimated_cost: record.estimated_cost || null,
                error_message: record.error_message || null,
                client_ip: record.client_ip || null,
                metadata: record.metadata || null,
            })
            .select()
            .single();

        console.log(data, error);

        if (error) {
            console.error('Error recording API call:', error);
            return null;
        }

        // Update daily stats
        await updateDailyStats(record);

        return data;
    } catch (error) {
        console.error('Error recording API call:', error);
        return null;
    }
};

/**
 * Update daily statistics in Supabase
 */
const updateDailyStats = async (
    record: Omit<APICallRecord, 'id' | 'timestamp' | 'created_at'>
): Promise<void> => {
    const today = getTodayString();

    try {
        // Try to get existing stats for today
        const { data: existingStats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('date', today)
            .single();

        if (existingStats) {
            // Update existing stats
            const callsByEndpoint = existingStats.calls_by_endpoint || {};
            const callsByProvider = existingStats.calls_by_provider || {};
            const callsByModel = existingStats.calls_by_model || {};
            const errorsByType = existingStats.errors_by_type || {};

            callsByEndpoint[record.endpoint] = (callsByEndpoint[record.endpoint] || 0) + 1;
            callsByProvider[record.provider] = (callsByProvider[record.provider] || 0) + 1;
            callsByModel[record.model] = (callsByModel[record.model] || 0) + 1;

            if (record.status === 'error' && record.error_message) {
                const errorType = record.error_message.substring(0, 50);
                errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
            }

            await supabase
                .from('daily_stats')
                .update({
                    total_calls: existingStats.total_calls + 1,
                    success_calls: existingStats.success_calls + (record.status === 'success' ? 1 : 0),
                    error_calls: existingStats.error_calls + (record.status === 'error' ? 1 : 0),
                    total_latency_ms: existingStats.total_latency_ms + record.latency_ms,
                    total_input_tokens: existingStats.total_input_tokens + (record.input_tokens || 0),
                    total_output_tokens: existingStats.total_output_tokens + (record.output_tokens || 0),
                    total_estimated_cost: existingStats.total_estimated_cost + (record.estimated_cost || 0),
                    calls_by_endpoint: callsByEndpoint,
                    calls_by_provider: callsByProvider,
                    calls_by_model: callsByModel,
                    errors_by_type: errorsByType,
                })
                .eq('date', today);
        } else {
            // Create new stats for today
            const callsByEndpoint: Record<string, number> = { [record.endpoint]: 1 };
            const callsByProvider: Record<string, number> = { [record.provider]: 1 };
            const callsByModel: Record<string, number> = { [record.model]: 1 };
            const errorsByType: Record<string, number> = {};

            if (record.status === 'error' && record.error_message) {
                const errorType = record.error_message.substring(0, 50);
                errorsByType[errorType] = 1;
            }

            await supabase
                .from('daily_stats')
                .insert({
                    date: today,
                    total_calls: 1,
                    success_calls: record.status === 'success' ? 1 : 0,
                    error_calls: record.status === 'error' ? 1 : 0,
                    total_latency_ms: record.latency_ms,
                    total_input_tokens: record.input_tokens || 0,
                    total_output_tokens: record.output_tokens || 0,
                    total_estimated_cost: record.estimated_cost || 0,
                    calls_by_endpoint: callsByEndpoint,
                    calls_by_provider: callsByProvider,
                    calls_by_model: callsByModel,
                    errors_by_type: errorsByType,
                });
        }
    } catch (error) {
        console.error('Error updating daily stats:', error);
    }
};

/**
 * Get monitoring statistics from Supabase
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

export const getMonitoringStats = async (limit: number = 50): Promise<MonitoringStats> => {
    const today = getTodayString();
    
    // Get today's stats
    const { data: todayStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('date', today)
        .single();

    // Get last 7 days stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: last7DaysData } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', sevenDaysAgoStr)
        .order('date', { ascending: false });

    const last7Days = last7DaysData || [];

    // Get recent calls
    const { data: recentCallsData } = await supabase
        .from('api_call_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    const recentCalls = recentCallsData || [];

    // Calculate summary stats from all daily stats
    const { data: allStats } = await supabase
        .from('daily_stats')
        .select('*');

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

    for (const stats of allStats || []) {
        totalCalls += stats.total_calls;
        successCalls += stats.success_calls;
        totalLatency += stats.total_latency_ms;
        totalCost += stats.total_estimated_cost;
        totalInput += stats.total_input_tokens;
        totalOutput += stats.total_output_tokens;

        for (const [endpoint, count] of Object.entries(stats.calls_by_endpoint || {})) {
            allCallsByEndpoint[endpoint] = (allCallsByEndpoint[endpoint] || 0) + (count as number);
        }
        for (const [provider, count] of Object.entries(stats.calls_by_provider || {})) {
            allCallsByProvider[provider] = (allCallsByProvider[provider] || 0) + (count as number);
        }
        for (const [model, count] of Object.entries(stats.calls_by_model || {})) {
            allCallsByModel[model] = (allCallsByModel[model] || 0) + (count as number);
        }
        for (const [error, count] of Object.entries(stats.errors_by_type || {})) {
            allErrors[error] = (allErrors[error] || 0) + (count as number);
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
        today: todayStats || null,
        last7Days,
        recentCalls,
        callsByEndpoint: allCallsByEndpoint,
        callsByProvider: allCallsByProvider,
        callsByModel: allCallsByModel,
        topErrors,
    };
};

/**
 * Get records for a specific time range from Supabase
 */
export const getRecordsByTimeRange = async (
    startTime: number,
    endTime: number
): Promise<APICallRecord[]> => {
    const startDate = new Date(startTime).toISOString();
    const endDate = new Date(endTime).toISOString();

    const { data, error } = await supabase
        .from('api_call_records')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching records by time range:', error);
        return [];
    }

    return data || [];
};

/**
 * Clear old records from Supabase (older than specified days)
 */
export const clearOldRecords = async (daysToKeep: number = 30): Promise<number> => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString();

    // Delete old API call records
    const { data: deletedRecords, error: recordsError } = await supabase
        .from('api_call_records')
        .delete()
        .lt('created_at', cutoffDateStr)
        .select('id');

    if (recordsError) {
        console.error('Error deleting old records:', recordsError);
        return 0;
    }

    // Delete old daily stats
    const cutoffDateOnly = cutoffDate.toISOString().split('T')[0];
    await supabase
        .from('daily_stats')
        .delete()
        .lt('date', cutoffDateOnly);

    return deletedRecords?.length || 0;
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

        // Record asynchronously without blocking
        recordAPICall({
            endpoint,
            provider,
            model,
            status: 'success',
            latency_ms: latencyMs,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            estimated_cost: estimatedCost,
            client_ip: clientIp,
        }).catch(console.error);

        return result;
    } catch (error: any) {
        const latencyMs = Date.now() - startTime;

        // Record asynchronously without blocking
        recordAPICall({
            endpoint,
            provider,
            model,
            status: 'error',
            latency_ms: latencyMs,
            error_message: error.message || 'Unknown error',
            client_ip: clientIp,
        }).catch(console.error);

        throw error;
    }
};
