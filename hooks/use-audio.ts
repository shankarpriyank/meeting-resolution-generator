import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import * as transcriptionAPI from '@/lib/api/transcription';

export interface UseAudioReturn {
    audioFile: File | null;
    audioUrl: string | null;
    isUploading: boolean;
    setAudioFile: (file: File | null) => void;
    setAudioUrl: (url: string | null) => void;
    uploadAudio: (file: File) => Promise<string | null>;
    getAudioDuration: (file: File | null) => Promise<number>;
    reset: () => void;
}

/**
 * Hook for managing audio file state and upload
 *
 * Responsibilities:
 * - Audio file state (file object and URL)
 * - Upload to storage
 * - Get audio duration
 */
export function useAudio(): UseAudioReturn {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Upload audio file to storage and return the URL
     */
    const uploadAudio = useCallback(async (file: File): Promise<string | null> => {
        setIsUploading(true);
        try {
            const uploadData = await transcriptionAPI.uploadAudio(file);
            if (uploadData?.url) {
                setAudioUrl(uploadData.url);
                return uploadData.url;
            }
            return null;
        } catch (error) {
            console.error('Audio upload error:', error);
            toast.error('Failed to upload audio file');
            return null;
        } finally {
            setIsUploading(false);
        }
    }, []);

    /**
     * Get audio duration from file
     */
    const getAudioDuration = useCallback((file: File | null): Promise<number> => {
        return new Promise((resolve) => {
            if (!file) {
                resolve(0);
                return;
            }

            const audio = new Audio();
            const url = URL.createObjectURL(file);

            audio.addEventListener('loadedmetadata', () => {
                const durationInSeconds = Math.round(audio.duration);
                URL.revokeObjectURL(url);
                resolve(durationInSeconds);
            });

            audio.addEventListener('error', () => {
                URL.revokeObjectURL(url);
                // Fallback to file size estimate if metadata loading fails
                const fallbackDuration = Math.round((file.size / 1000) / 60);
                resolve(fallbackDuration);
            });

            audio.src = url;
        });
    }, []);

    /**
     * Reset audio state
     */
    const reset = useCallback(() => {
        setAudioFile(null);
        setAudioUrl(null);
    }, []);

    return {
        audioFile,
        audioUrl,
        isUploading,
        setAudioFile,
        setAudioUrl,
        uploadAudio,
        getAudioDuration,
        reset,
    };
}
