import { NextRequest, NextResponse } from 'next/server';

const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export async function POST(request: NextRequest) {
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

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `OpenAI API error: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();

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

        return NextResponse.json({ 
            transcription: formattedTranscription,
            rawData: data 
        });
    } catch (error: any) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to transcribe audio' },
            { status: 500 }
        );
    }
}
