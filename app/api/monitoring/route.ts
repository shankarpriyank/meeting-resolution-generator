import { NextRequest, NextResponse } from 'next/server';
import { 
    getMonitoringStats, 
    getRecordsByTimeRange, 
    clearOldRecords 
} from '@/lib/api-monitoring';
import { 
    checkRateLimit, 
    getClientIdentifier, 
    createRateLimitHeaders,
    RATE_LIMIT_TIERS 
} from '@/lib/rate-limiter';

/**
 * GET /api/monitoring
 * Retrieve API monitoring statistics
 * 
 * Query params:
 * - limit: Number of recent calls to return (default: 50)
 * - startTime: Start timestamp for time range query
 * - endTime: End timestamp for time range query
 */
export async function GET(request: NextRequest) {
    // Apply rate limiting
    const clientIp = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientIp, 'monitoring', RATE_LIMIT_TIERS.STANDARD);
    
    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Too many requests',
                message: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`,
                retryAfter: rateLimitResult.retryAfter,
            },
            {
                status: 429,
                headers: createRateLimitHeaders(rateLimitResult),
            }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');

        // If time range is specified, return records for that range
        if (startTime && endTime) {
            const records = await getRecordsByTimeRange(
                parseInt(startTime, 10),
                parseInt(endTime, 10)
            );
            
            return NextResponse.json(
                { records, count: records.length },
                { headers: createRateLimitHeaders(rateLimitResult) }
            );
        }

        // Otherwise, return general monitoring stats
        const stats = await getMonitoringStats(limit);

        return NextResponse.json(
            {
                success: true,
                data: stats,
                generatedAt: new Date().toISOString(),
            },
            { headers: createRateLimitHeaders(rateLimitResult) }
        );
    } catch (error: any) {
        console.error('Monitoring API error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve monitoring data', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/monitoring
 * Clear old monitoring records
 * 
 * Query params:
 * - daysToKeep: Number of days of data to keep (default: 30)
 */
export async function DELETE(request: NextRequest) {
    // Apply rate limiting
    const clientIp = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientIp, 'monitoring-delete', RATE_LIMIT_TIERS.AI_STRICT);
    
    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Too many requests',
                message: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`,
                retryAfter: rateLimitResult.retryAfter,
            },
            {
                status: 429,
                headers: createRateLimitHeaders(rateLimitResult),
            }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const daysToKeep = parseInt(searchParams.get('daysToKeep') || '30', 10);

        const deletedCount = await clearOldRecords(daysToKeep);

        return NextResponse.json(
            {
                success: true,
                message: `Cleared ${deletedCount} old records`,
                deletedCount,
                daysKept: daysToKeep,
            },
            { headers: createRateLimitHeaders(rateLimitResult) }
        );
    } catch (error: any) {
        console.error('Monitoring cleanup error:', error);
        return NextResponse.json(
            { error: 'Failed to clear old records', details: error.message },
            { status: 500 }
        );
    }
}
