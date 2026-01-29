import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { convertToHTML } from '@/lib/resolution-html';
import * as meetingsAPI from '@/lib/api/meetings';
import type { MeetingMetadata } from '@/lib/api/meetings';
import { useAudio } from './use-audio';
import { useTranscription } from './use-transcription';
import { useResolution } from './use-resolution';

export interface UseMeetingWorkflowReturn {
    // Audio state
    audioFile: File | null;
    audioUrl: string | null;

    // Transcription state
    isTranscribing: boolean;
    transcriptionProgress: number;
    transcription: string;

    // Resolution state
    resolution: string;
    isGeneratingResolution: boolean;
    showResolutionPreview: boolean;

    // Meeting state
    meetingIdState: string | null;
    meetingStatus: string;
    isProcessingMeeting: boolean;
    isLoadingMeetingData: boolean;
    meetingMetadata: MeetingMetadata;

    // Actions
    setAudioFile: (file: File | null) => void;
    setMeetingMetadata: (metadata: MeetingMetadata) => void;
    handleProcessMeeting: () => Promise<void>;
    handleGenerateResolution: (
        transcriptionText?: string,
        fileLinkOverride?: string | null
    ) => Promise<void>;
    handleEditResolution: (editedResolution: string) => Promise<void>;
    handleAcceptResolution: () => Promise<void>;
    handleGenerateAnother: () => void;
    handleMetadataSubmit: (metadata: {
        date: string;
        time: string;
        entity: string;
        jurisdiction: string;
        meetingType: string;
        meetingTitle: string;
    }) => void;
    formatDate: (date: string, time?: string) => string;
}

/**
 * Orchestration hook that combines useAudio, useTranscription, and useResolution
 *
 * This hook maintains the same external API as the original useTranscribe hook
 * while delegating to specialized hooks internally.
 */
export function useMeetingWorkflow(
    initialMeetingId: string | null = null
): UseMeetingWorkflowReturn {
    // Compose specialized hooks
    const audio = useAudio();
    const transcription = useTranscription();
    const resolution = useResolution();

    // Meeting-specific state
    const [meetingState, setMeetingState] = useState<{
        id: string | null;
        status: string;
        isProcessing: boolean;
        isLoading: boolean;
    }>({
        id: initialMeetingId,
        status: 'DRAFT',
        isProcessing: false,
        isLoading: false,
    });

    const [meetingMetadata, setMeetingMetadata] = useState<MeetingMetadata>({
        date: '',
        time: '',
        entityName: '',
        jurisdiction: '',
        meetingType: '',
        meetingTitle: '',
    });

    // Load meeting data if ID is present
    useEffect(() => {
        if (initialMeetingId) {
            setMeetingState((prev) => ({ ...prev, isLoading: true }));
            loadMeetingData(initialMeetingId).finally(() => {
                setMeetingState((prev) => ({ ...prev, isLoading: false }));
            });
        }
    }, [initialMeetingId]);

    const loadMeetingData = async (id: string) => {
        try {
            const meeting = await meetingsAPI.getMeetingById(id);

            // Prefill all data
            setMeetingMetadata({
                date: meeting.date || '',
                time: meeting.time || '',
                entityName: meeting.entity || '',
                jurisdiction: meeting.jurisdiction || '',
                meetingType: meeting.meetingType || '',
                meetingTitle: meeting.title || '',
            });

            if (meeting.transcript) {
                transcription.setTranscription(meeting.transcript);
            }

            if (meeting.resolution_html) {
                resolution.setResolution(meeting.resolution_html);
            }

            if (meeting.file_link) {
                audio.setAudioUrl(meeting.file_link);
            }

            // Set meeting status
            if (meeting.status) {
                setMeetingState((prev) => ({
                    ...prev,
                    status: meeting.status || prev.status,
                }));
            }

            // If resolution exists, show preview
            if (meeting.resolution_html || meeting.resolution) {
                resolution.setShowResolutionPreview(true);
            }

            setMeetingState((prev) => ({ ...prev, id }));
        } catch (error) {
            console.error('Error loading meeting:', error);
            toast.error('Failed to load meeting data');
        }
    };

    const handleProcessMeeting = async () => {
        setMeetingState((prev) => ({ ...prev, isProcessing: true }));

        if (!audio.audioFile) {
            toast.warning('Please upload an audio file first');
            setMeetingState((prev) => ({ ...prev, isProcessing: false }));
            return;
        }

        // Upload audio file
        const uploadedUrl = await audio.uploadAudio(audio.audioFile);
        if (!uploadedUrl) {
            setMeetingState((prev) => ({ ...prev, isProcessing: false }));
            return;
        }

        resolution.setShowResolutionPreview(true);
        setMeetingState((prev) => ({ ...prev, isProcessing: false }));

        try {
            // Transcribe audio
            const transcribedText = await transcription.transcribeAudio(
                audio.audioFile
            );

            // Automatically generate resolution after transcription completes
            await generateResolutionInternal(transcribedText, uploadedUrl);
        } catch (error) {
            console.error('Processing error:', error);
            transcription.setTranscription(
                'Error: Failed to transcribe audio. Please try again.'
            );
            toast.error('Failed to transcribe audio');
        }
    };

    const generateResolutionInternal = async (
        transcriptionText?: string,
        fileLinkOverride?: string | null
    ) => {
        const textToUse = transcriptionText || transcription.transcription;

        const resolutionHtml = await resolution.generateResolution(
            textToUse,
            meetingMetadata
        );

        if (resolutionHtml) {
            // Save to database
            await saveMeetingToDatabase(
                resolutionHtml,
                textToUse,
                fileLinkOverride ?? audio.audioUrl
            );
        }
    };

    const saveMeetingToDatabase = async (
        resolutionData: string,
        transcriptOverride?: string,
        fileLinkOverride?: string | null
    ) => {
        try {
            const duration = await audio.getAudioDuration(audio.audioFile);
            const transcriptToSave =
                transcriptOverride ?? transcription.transcription;
            const fileLinkToSave = fileLinkOverride ?? audio.audioUrl ?? '';

            if (meetingState.id) {
                // Update existing meeting
                await meetingsAPI.updateMeeting(meetingState.id, {
                    resolution_html: resolutionData,
                    resolution: {},
                    status: 'DRAFT',
                });
                console.log('Meeting updated successfully');
            } else {
                // Create new meeting
                const meeting = await meetingsAPI.createMeeting({
                    title: meetingMetadata.meetingTitle || 'Untitled Meeting',
                    date: meetingMetadata.date,
                    time: meetingMetadata.time,
                    entity: meetingMetadata.entityName,
                    jurisdiction: meetingMetadata.jurisdiction,
                    duration: duration,
                    resolution: {},
                    transcript: transcriptToSave,
                    resolution_html: resolutionData,
                    file_link: fileLinkToSave,
                    status: 'DRAFT',
                });
                setMeetingState((prev) => ({ ...prev, id: meeting.id }));
                console.log('Meeting created successfully:', meeting.id);
            }
        } catch (error) {
            console.error('Error saving meeting to database:', error);
            toast.error('Failed to save meeting to database');
        }
    };

    const handleEditResolution = async (editedResolution: string) => {
        resolution.setResolution(editedResolution);

        if (meetingState.id) {
            try {
                let resolutionHtml = '';
                let resolutionJson = {};

                try {
                    const parsed = JSON.parse(editedResolution);
                    resolutionJson = parsed;

                    // Extract HTML from _html field (this is what the editor stores)
                    resolutionHtml = parsed._html || parsed.html || '';

                    // If no HTML stored, generate it from the data
                    if (!resolutionHtml && parsed.entityName) {
                        resolutionHtml = convertToHTML(parsed);
                    } else if (!resolutionHtml) {
                        resolutionHtml = convertToHTML(parsed);
                    }
                } catch {
                    // If parsing fails, assume it's already HTML
                    resolutionHtml = editedResolution;
                }

                await meetingsAPI.updateMeeting(meetingState.id, {
                    resolution_html: resolutionHtml,
                    resolution: resolutionJson,
                });
            } catch (error) {
                console.error('Error updating resolution:', error);
                toast.error('Failed to update resolution');
            }
        }
    };

    const handleAcceptResolution = async () => {
        console.log('Resolution accepted:', resolution.resolution);

        if (meetingState.id) {
            try {
                await meetingsAPI.updateMeeting(meetingState.id, {
                    status: 'COMPLETED',
                });
                setMeetingState((prev) => ({ ...prev, status: 'COMPLETED' }));
                toast.success('Resolution accepted and saved!');
            } catch (error) {
                console.error('Error accepting resolution:', error);
                toast.error('Failed to save resolution. Please try again.');
            }
        } else {
            toast.error('Meeting ID not found. Please try again.');
        }
    };

    const handleGenerateAnother = () => {
        resolution.reset();
        transcription.reset();
        audio.reset();
    };

    const handleMetadataSubmit = (metadata: {
        date: string;
        time: string;
        entity: string;
        jurisdiction: string;
        meetingType: string;
        meetingTitle: string;
    }) => {
        setMeetingMetadata({
            date: metadata.date || '',
            time: metadata.time || '',
            entityName: metadata.entity,
            jurisdiction: metadata.jurisdiction,
            meetingType: metadata.meetingType,
            meetingTitle: metadata.meetingTitle,
        });
    };

    const formatDate = useCallback((date: string, time?: string) => {
        if (!date) return 'December 15, 2024';
        try {
            const dateTimeString = time ? `${date}T${time}` : date;
            const dateObj = new Date(dateTimeString);
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'December 15, 2024';
        }
    }, []);

    return {
        // Audio state
        audioFile: audio.audioFile,
        audioUrl: audio.audioUrl,

        // Transcription state
        isTranscribing: transcription.isTranscribing,
        transcriptionProgress: transcription.transcriptionProgress,
        transcription: transcription.transcription,

        // Resolution state
        resolution: resolution.resolution,
        isGeneratingResolution: resolution.isGeneratingResolution,
        showResolutionPreview: resolution.showResolutionPreview,

        // Meeting state
        meetingIdState: meetingState.id,
        meetingStatus: meetingState.status,
        isProcessingMeeting: meetingState.isProcessing,
        isLoadingMeetingData: meetingState.isLoading,
        meetingMetadata,

        // Actions
        setAudioFile: audio.setAudioFile,
        setMeetingMetadata,
        handleProcessMeeting,
        handleGenerateResolution: generateResolutionInternal,
        handleEditResolution,
        handleAcceptResolution,
        handleGenerateAnother,
        handleMetadataSubmit,
        formatDate,
    };
}

// Re-export for backwards compatibility
export { useMeetingWorkflow as useTranscribe };
