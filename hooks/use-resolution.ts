import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { convertToHTML } from '@/lib/resolution-html';
import * as transcriptionAPI from '@/lib/api/transcription';
import type { MeetingMetadata } from '@/lib/api/meetings';

const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export interface UseResolutionReturn {
    resolution: string;
    isGeneratingResolution: boolean;
    showResolutionPreview: boolean;
    resolutionError: string | null;
    setResolution: (resolution: string) => void;
    setShowResolutionPreview: (show: boolean) => void;
    generateResolution: (
        transcriptionText: string,
        metadata: MeetingMetadata
    ) => Promise<string | null>;
    reset: () => void;
    retry: () => Promise<string | null>;
}

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hook for managing resolution state and generation
 *
 * Responsibilities:
 * - Resolution HTML state
 * - Resolution generation via AI
 * - Preview visibility state
 * - Retry logic with exponential backoff
 */
export function useResolution(): UseResolutionReturn {
    const [resolution, setResolution] = useState<string>('');
    const [isGeneratingResolution, setIsGeneratingResolution] = useState(false);
    const [showResolutionPreview, setShowResolutionPreview] = useState(false);
    const [resolutionError, setResolutionError] = useState<string | null>(null);
    const [lastGenerationParams, setLastGenerationParams] = useState<{
        transcriptionText: string;
        metadata: MeetingMetadata;
    } | null>(null);

    /**
     * Generate resolution with retry logic
     */
    const generateWithRetry = async (
        transcriptionText: string,
        metadata: MeetingMetadata,
        attempt: number = 0
    ): Promise<{ resolution: Record<string, unknown> }> => {
        try {
            const data = await transcriptionAPI.generateResolution(
                transcriptionText,
                metadata
            );
            return data;
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
                    `Resolution generation attempt ${attempt + 1} failed, retrying in ${delay}ms...`
                );
                await sleep(delay);
                return generateWithRetry(transcriptionText, metadata, attempt + 1);
            }

            throw error;
        }
    };

    /**
     * Generate resolution from transcription text
     */
    const generateResolution = useCallback(
        async (
            transcriptionText: string,
            metadata: MeetingMetadata
        ): Promise<string | null> => {
            if (!transcriptionText) {
                toast.warning('Please transcribe audio first');
                return null;
            }

            if (!metadata.entityName || !metadata.meetingType) {
                toast.warning(
                    'Please fill in at least the entity name and meeting type'
                );
                return null;
            }

            setIsGeneratingResolution(true);
            setShowResolutionPreview(true);
            setResolutionError(null);
            setLastGenerationParams({ transcriptionText, metadata });

            try {
                const data = await generateWithRetry(transcriptionText, metadata);

                // Convert resolution to HTML with jurisdiction-aware formatting
                const resolutionHtml = convertToHTML(
                    data.resolution as Parameters<typeof convertToHTML>[0],
                    metadata.jurisdiction
                );
                setResolution(resolutionHtml);
                return resolutionHtml;
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to generate resolution';
                console.error('Error generating resolution:', error);
                setResolutionError(errorMessage);
                toast.error('Failed to generate resolution. Please try again.');
                return null;
            } finally {
                setIsGeneratingResolution(false);
            }
        },
        []
    );

    /**
     * Retry the last failed resolution generation
     */
    const retry = useCallback(async (): Promise<string | null> => {
        if (!lastGenerationParams) {
            return null;
        }
        return generateResolution(
            lastGenerationParams.transcriptionText,
            lastGenerationParams.metadata
        );
    }, [lastGenerationParams, generateResolution]);

    /**
     * Reset resolution state
     */
    const reset = useCallback(() => {
        setResolution('');
        setShowResolutionPreview(false);
        setIsGeneratingResolution(false);
        setResolutionError(null);
        setLastGenerationParams(null);
    }, []);

    return {
        resolution,
        isGeneratingResolution,
        showResolutionPreview,
        resolutionError,
        setResolution,
        setShowResolutionPreview,
        generateResolution,
        reset,
        retry,
    };
}
