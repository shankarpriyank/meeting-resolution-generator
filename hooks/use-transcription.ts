import { useState, useCallback } from 'react';
import * as transcriptionAPI from '@/lib/api/transcription';

export interface UseTranscriptionReturn {
    transcription: string;
    isTranscribing: boolean;
    transcriptionProgress: number;
    setTranscription: (text: string) => void;
    transcribeAudio: (file: File) => Promise<string>;
    simulateTyping: (
        text: string,
        onProgress: (text: string, progress: number) => void
    ) => Promise<void>;
    reset: () => void;
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
 * Hook for managing transcription state and API calls
 *
 * Responsibilities:
 * - Transcription text state
 * - Transcription progress
 * - API calls to transcription service
 * - Typing effect simulation
 */
export function useTranscription(): UseTranscriptionReturn {
    const [transcription, setTranscription] = useState<string>('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);

    /**
     * Transcribe audio file and update state with typing effect
     */
    const transcribeAudio = useCallback(async (file: File): Promise<string> => {
        setIsTranscribing(true);
        setTranscription('');
        setTranscriptionProgress(0);

        try {
            const data = await transcriptionAPI.transcribeAudio(file);
            const formattedTranscription = data.transcription || '';

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
        } finally {
            setIsTranscribing(false);
        }
    }, []);

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
    }, []);

    return {
        transcription,
        isTranscribing,
        transcriptionProgress,
        setTranscription,
        transcribeAudio,
        simulateTyping,
        reset,
    };
}
