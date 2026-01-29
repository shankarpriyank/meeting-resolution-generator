import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { convertToHTML } from '@/lib/resolution-html';
import * as transcriptionAPI from '@/lib/api/transcription';
import type { MeetingMetadata } from '@/lib/api/meetings';

export interface UseResolutionReturn {
    resolution: string;
    isGeneratingResolution: boolean;
    showResolutionPreview: boolean;
    setResolution: (resolution: string) => void;
    setShowResolutionPreview: (show: boolean) => void;
    generateResolution: (
        transcriptionText: string,
        metadata: MeetingMetadata
    ) => Promise<string | null>;
    reset: () => void;
}

/**
 * Hook for managing resolution state and generation
 *
 * Responsibilities:
 * - Resolution HTML state
 * - Resolution generation via AI
 * - Preview visibility state
 */
export function useResolution(): UseResolutionReturn {
    const [resolution, setResolution] = useState<string>('');
    const [isGeneratingResolution, setIsGeneratingResolution] = useState(false);
    const [showResolutionPreview, setShowResolutionPreview] = useState(false);

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

            try {
                const data = await transcriptionAPI.generateResolution(
                    transcriptionText,
                    metadata
                );

                // Convert resolution to HTML and set it
                const resolutionHtml = convertToHTML(data.resolution);
                setResolution(resolutionHtml);
                return resolutionHtml;
            } catch (error) {
                console.error('Error generating resolution:', error);
                toast.error('Failed to generate resolution. Please try again.');
                return null;
            } finally {
                setIsGeneratingResolution(false);
            }
        },
        []
    );

    /**
     * Reset resolution state
     */
    const reset = useCallback(() => {
        setResolution('');
        setShowResolutionPreview(false);
        setIsGeneratingResolution(false);
    }, []);

    return {
        resolution,
        isGeneratingResolution,
        showResolutionPreview,
        setResolution,
        setShowResolutionPreview,
        generateResolution,
        reset,
    };
}
