import { NextRequest, NextResponse } from 'next/server';
import { 
    checkRateLimit, 
    getClientIdentifier, 
    createRateLimitHeaders,
    RATE_LIMIT_TIERS 
} from '@/lib/rate-limiter';
import { recordAPICall, calculateCost } from '@/lib/api-monitoring';

const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export async function POST(request: NextRequest) {
    const clientIp = getClientIdentifier(request);
    
    // Apply strict rate limiting for AI endpoints
    const rateLimitResult = checkRateLimit(
        clientIp, 
        'transcribe-audio', 
        RATE_LIMIT_TIERS.AI_STRICT
    );
    
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

    const startTime = Date.now();

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const transcriptionFormData = new FormData();
        transcriptionFormData.append('file', file);
        transcriptionFormData.append('model', 'whisper-1');
        transcriptionFormData.append('response_format', 'verbose_json');
        transcriptionFormData.append('timestamp_granularities[]', 'segment');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            },
            body: transcriptionFormData,
        });

        const latencyMs = Date.now() - startTime;

        if (!response.ok) {
            const errorText = await response.text();
            
            // Record failed API call
            recordAPICall({
                endpoint: 'transcribe-audio',
                provider: 'openai',
                model: 'whisper-1',
                status: 'error',
                latency_ms : latencyMs,
                error_message: `OpenAI API error: ${response.statusText}`,
                client_ip: clientIp,
                metadata: { fileSize: file.size, fileName: file.name },
            });

            return NextResponse.json(
                { error: `OpenAI API error: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Calculate estimated cost based on audio duration (Whisper charges per minute)
        const audioDurationMinutes = data.duration ? data.duration / 60 : 0;
        const estimatedCost = audioDurationMinutes * 0.006; // $0.006 per minute

        // Record successful API call
        recordAPICall({
            endpoint: 'transcribe-audio',
            provider: 'openai',
            model: 'whisper-1',
            status: 'success',
            latency_ms: latencyMs,
            estimated_cost: estimatedCost,
            client_ip: clientIp,
            metadata: { 
                fileSize: file.size, 
                fileName: file.name,
                audioDurationSeconds: data.duration,
            },
        });

        let formattedTranscription = '';
        if (data.segments && data.segments.length > 0) {
            formattedTranscription = data.segments
                .map((segment: { start: number; text: string }) => {
                    const timestamp = formatTimestamp(segment.start);
                    return `[${timestamp}] ${segment.text.trim()}`;
                })
                .join('\n\n');
        } else {
            formattedTranscription = data.text || '';
        }

        return NextResponse.json(
            { 
                transcription: formattedTranscription,
                rawData: data 
            },
            { headers: createRateLimitHeaders(rateLimitResult) }
        );
    } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        
        // Record failed API call
        recordAPICall({
            endpoint: 'transcribe-audio',
            provider: 'openai',
            model: 'whisper-1',
            status: 'error',
            latency_ms: latencyMs,
            error_message: error.message || 'Unknown error',
            client_ip: clientIp,
        });

        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to transcribe audio' },
            { status: 500 }
        );
    }
}
