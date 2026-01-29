import { MeetingMetadata } from './meetings';

export interface TranscriptionResponse {
    transcription: string;
    rawData?: any;
}

export interface ResolutionResponse {
    resolution: Record<string, any>;
}

export interface UploadAudioResponse {
    url: string;
    path: string;
}

/**
 * Upload audio file to storage
 */
export async function uploadAudio(file: File): Promise<UploadAudioResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Audio upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Transcribe audio file
 */
export async function transcribeAudio(file: File): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Generate resolution from transcription
 */
export async function generateResolution(
    transcription: string,
    metadata: MeetingMetadata
): Promise<ResolutionResponse> {
    const response = await fetch('/api/generate-resolution', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transcription,
            metadata,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate resolution');
    }

    const data = await response.json();
    return data;
}
