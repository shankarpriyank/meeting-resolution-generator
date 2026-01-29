import { useState, useCallback } from 'react';
import * as transcriptionAPI from '@/lib/api/transcription';

const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export interface UseTranscriptionReturn {
    transcription: string;
    isTranscribing: boolean;
    transcriptionProgress: number;
    transcriptionError: string | null;
    setTranscription: (text: string) => void;
    transcribeAudio: (file: File) => Promise<string>;
    simulateTyping: (
        text: string,
        onProgress: (text: string, progress: number) => void
    ) => Promise<void>;
    reset: () => void;
    retry: () => Promise<string | null>;
}

/**
 * Simulate typing effect for transcription display
 */
const simulateTypingEffect = (
    text: string,
    onProgress: (text: string, progress: number) => void
): Promise<void> => {
    return new Promise((resolve) => {
        const words = text.split(' ');
        let currentText = '';

        const typeNext = async (index: number) => {
            if (index >= words.length) {
                onProgress(text, 100);
                resolve();
                return;
            }

            currentText += words[index] + ' ';
            onProgress(
                currentText,
                Math.min(100, Math.round((currentText.length / text.length) * 100))
            );

            await new Promise((resolve) => setTimeout(resolve, 30));
            typeNext(index + 1);
        };

        typeNext(0);
    });
};

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hook for managing transcription state and API calls
 *
 * Responsibilities:
 * - Transcription text state
 * - Transcription progress
 * - API calls to transcription service
 * - Typing effect simulation
 * - Retry logic with exponential backoff
 */
export function useTranscription(): UseTranscriptionReturn {
    const [transcription, setTranscription] = useState<string>('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
    const [lastFile, setLastFile] = useState<File | null>(null);

    /**
     * Transcribe audio file with retry logic
     */
    const transcribeWithRetry = async (
        file: File,
        attempt: number = 0
    ): Promise<string> => {
        try {
            const data = await transcriptionAPI.transcribeAudio(file);
            return data.transcription || '';
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';

            // Don't retry on certain errors
            if (
                errorMessage.includes('rate limit') ||
                errorMessage.includes('429')
            ) {
                throw new Error(
                    'Rate limit exceeded. Please wait a moment and try again.'
                );
            }

            if (attempt < MAX_RETRIES) {
                // Exponential backoff
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
                console.log(
                    `Transcription attempt ${attempt + 1} failed, retrying in ${delay}ms...`
                );
                await sleep(delay);
                return transcribeWithRetry(file, attempt + 1);
            }

            throw error;
        }
    };

    /**
     * Transcribe audio file and update state with typing effect
     */
    const transcribeAudio = useCallback(async (file: File): Promise<string> => {
        setIsTranscribing(true);
        setTranscription('');
        setTranscriptionProgress(0);
        setTranscriptionError(null);
        setLastFile(file);

        try {
            const formattedTranscription = await transcribeWithRetry(file);

            // Simulate typing effect for better UX
            await simulateTypingEffect(
                formattedTranscription,
                (currentText, progress) => {
                    setTranscription(currentText);
                    setTranscriptionProgress(progress);
                }
            );

            setTranscriptionProgress(100);
            return formattedTranscription;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to transcribe audio';
            setTranscriptionError(errorMessage);
            throw error;
        } finally {
            setIsTranscribing(false);
        }
    }, []);

    /**
     * Retry the last failed transcription
     */
    const retry = useCallback(async (): Promise<string | null> => {
        if (!lastFile) {
            return null;
        }
        return transcribeAudio(lastFile);
    }, [lastFile, transcribeAudio]);

    /**
     * Public method to simulate typing (for external use)
     */
    const simulateTyping = useCallback(
        async (
            text: string,
            onProgress: (text: string, progress: number) => void
        ): Promise<void> => {
            return simulateTypingEffect(text, onProgress);
        },
        []
    );

    /**
     * Reset transcription state
     */
    const reset = useCallback(() => {
        setTranscription('');
        setTranscriptionProgress(0);
        setIsTranscribing(false);
        setTranscriptionError(null);
        setLastFile(null);
    }, []);

    return {
        transcription,
        isTranscribing,
        transcriptionProgress,
        transcriptionError,
        setTranscription,
        transcribeAudio,
        simulateTyping,
        reset,
        retry,
    };
}
