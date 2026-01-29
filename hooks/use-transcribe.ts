import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { convertToHTML } from '@/lib/resolution-html';
import * as meetingsAPI from '@/lib/api/meetings';
import * as transcriptionAPI from '@/lib/api/transcription';
import type { MeetingMetadata } from '@/lib/api/meetings';

export interface UseTranscribeReturn {
    audioFile: File | null;
    audioUrl: string | null;
    isTranscribing: boolean;
    transcriptionProgress: number;
    transcription: string;
    resolution: string;
    isGeneratingResolution: boolean;
    showResolutionPreview: boolean;
    meetingIdState: string | null;
    meetingStatus: string;
    isProcessingMeeting: boolean;
    isLoadingMeetingData: boolean;
    meetingMetadata: MeetingMetadata;

    setAudioFile: (file: File | null) => void;
    setMeetingMetadata: (metadata: MeetingMetadata) => void;
    handleProcessMeeting: () => Promise<void>;
    handleGenerateResolution: (transcriptionText?: string, fileLinkOverride?: string | null) => Promise<void>;
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
 * Get audio duration from file/blob
 */
const getAudioDuration = (file: File | null): Promise<number> => {
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
};

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
            onProgress(currentText, Math.min(100, Math.round((currentText.length / text.length) * 100)));

            await new Promise(resolve => setTimeout(resolve, 30));
            typeNext(index + 1);
        };

        typeNext(0);
    });
};

export function useTranscribe(initialMeetingId: string | null = null): UseTranscribeReturn {
    const [audio, setAudio] = useState<{ file: File | null; url: string | null }>({
        file: null,
        url: null,
    });
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [transcription, setTranscription] = useState<string>('');
    const [resolution, setResolution] = useState<string>('');
    const [isGeneratingResolution, setIsGeneratingResolution] = useState(false);
    const [showResolutionPreview, setShowResolutionPreview] = useState(false);
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

    // Derived values for external consumers
    const audioFile = audio.file;
    const audioUrl = audio.url;
    const meetingIdState = meetingState.id;
    const meetingStatus = meetingState.status;
    const isProcessingMeeting = meetingState.isProcessing;
    const isLoadingMeetingData = meetingState.isLoading;

    // Public setter for audio file
    const setAudioFile = (file: File | null) => {
        setAudio(prev => ({ ...prev, file }));
    };

    // Internal helper to update audio URL
    const setAudioUrl = (url: string | null) => {
        setAudio(prev => ({ ...prev, url }));
    };

    // Load meeting data if ID is present
    useEffect(() => {
        if (initialMeetingId) {
            setMeetingState(prev => ({ ...prev, isLoading: true }));
            loadMeetingData(initialMeetingId).finally(() => {
                setMeetingState(prev => ({ ...prev, isLoading: false }));
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
                setTranscription(meeting.transcript);
            }

            if (meeting.resolution_html) {
                setResolution(meeting.resolution_html);
            }

            if (meeting.file_link) {
                setAudioUrl(meeting.file_link);
            }

            // Set meeting status
            if (meeting.status) {
                setMeetingState(prev => ({ ...prev, status: meeting.status || prev.status }));
            }

            // If resolution exists, show preview
            if (meeting.resolution_html || meeting.resolution) {
                setShowResolutionPreview(true);
            }

            setMeetingState(prev => ({ ...prev, id }));
        } catch (error) {
            console.error('Error loading meeting:', error);
            toast.error('Failed to load meeting data');
        }
    };

    const handleProcessMeeting = async () => {
        setMeetingState(prev => ({ ...prev, isProcessing: true }));
        if (!audioFile) {
            toast.warning('Please upload an audio file first');
            setMeetingState(prev => ({ ...prev, isProcessing: false }));
            return;
        }

        // We'll keep track of the uploaded URL locally so we can pass it through
        let uploadedUrl: string | null = null;

        try {
            const uploadData = await transcriptionAPI.uploadAudio(audioFile);
            if (uploadData?.url) {
                uploadedUrl = uploadData.url;
                setAudioUrl(uploadedUrl);
            }
        } catch (error) {
            console.error('Audio upload error:', error);
            toast.error('Failed to upload audio file');
            setMeetingState(prev => ({ ...prev, isProcessing: false }));
            return;
        }

        setIsTranscribing(true);
        setTranscription('');
        setTranscriptionProgress(0);
        setShowResolutionPreview(true);
        setMeetingState(prev => ({ ...prev, isProcessing: false }));

        try {
            await transcribeAudio(audioFile, uploadedUrl);
        } catch (error) {
            console.error('Transcription error:', error);
            setTranscription('Error: Failed to transcribe audio. Please try again.');
            setIsTranscribing(false);
            setTranscriptionProgress(0);
            setMeetingState(prev => ({ ...prev, isProcessing: false }));
            toast.error('Failed to transcribe audio');
        }
    };

    const transcribeAudio = async (file: File, fileLinkOverride?: string | null) => {
        try {
            const data = await transcriptionAPI.transcribeAudio(file);
            const formattedTranscription = data.transcription || '';

            // Simulate typing effect for better UX
            await simulateTypingEffect(formattedTranscription, (currentText, progress) => {
                setTranscription(currentText);
                setTranscriptionProgress(progress);
            });

            setTranscriptionProgress(100);
            setIsTranscribing(false);

            // Automatically generate resolution after transcription completes
            await generateResolution(formattedTranscription, fileLinkOverride);
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        }
    };

    const generateResolution = async (
        transcriptionText?: string,
        fileLinkOverride?: string | null
    ) => {
        const textToUse = transcriptionText || transcription;

        if (!textToUse) {
            toast.warning('Please transcribe audio first');
            return;
        }

        if (!meetingMetadata.entityName || !meetingMetadata.meetingType) {
            toast.warning('Please fill in at least the entity name and meeting type');
            return;
        }

        setIsGeneratingResolution(true);
        setShowResolutionPreview(true);

        try {
            const data = await transcriptionAPI.generateResolution(textToUse, meetingMetadata);

            // Convert resolution to HTML and set it
            const resolutionHtml = convertToHTML(data.resolution);
            setResolution(resolutionHtml);

            // Create or update meeting entry after resolution is generated
            await saveMeetingToDatabase(
                resolutionHtml,
                textToUse,
                fileLinkOverride ?? audioUrl
            );
        } catch (error) {
            console.error('Error generating resolution:', error);
            toast.error('Failed to generate resolution. Please try again.');
        } finally {
            setIsGeneratingResolution(false);
        }
    };

    const saveMeetingToDatabase = async (
        resolutionData: string,
        transcriptOverride?: string,
        fileLinkOverride?: string | null
    ) => {
        try {
            // Get actual duration from audio file/blob
            const duration = await getAudioDuration(audioFile);
            const transcriptToSave = transcriptOverride ?? transcription;
            const fileLinkToSave = fileLinkOverride ?? audioUrl ?? '';

            if (meetingIdState) {
                // Update existing meeting
                await meetingsAPI.updateMeeting(meetingIdState, {
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
                setMeetingState(prev => ({ ...prev, id: meeting.id }));
                console.log('Meeting created successfully:', meeting.id);
            }
        } catch (error) {
            console.error('Error saving meeting to database:', error);
            toast.error('Failed to save meeting to database');
        }
    };

    const handleEditResolution = async (editedResolution: string) => {
        setResolution(editedResolution);

        // Update meeting in database when resolution is edited
        if (meetingIdState) {
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

                await meetingsAPI.updateMeeting(meetingIdState, {
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
        console.log('Resolution accepted:', resolution);

        // Update meeting status to COMPLETED
        if (meetingIdState) {
            try {
                await meetingsAPI.updateMeeting(meetingIdState, {
                    status: 'COMPLETED',
                });
                setMeetingState(prev => ({ ...prev, status: 'COMPLETED' }));
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
        setResolution('');
        setShowResolutionPreview(false);
        setTranscription('');
        setTranscriptionProgress(0);
        setAudioFile(null);
        setAudioUrl(null);
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

    // Format date from metadata
    const formatDate = useCallback((date: string, time?: string) => {
        if (!date) return 'December 15, 2024';
        try {
            const dateTimeString = time ? `${date}T${time}` : date;
            const dateObj = new Date(dateTimeString);
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'December 15, 2024';
        }
    }, []);

    return {
        audioFile,
        audioUrl,
        isTranscribing,
        transcriptionProgress,
        transcription,
        resolution,
        isGeneratingResolution,
        showResolutionPreview,
        meetingIdState,
        meetingStatus,
        isProcessingMeeting,
        isLoadingMeetingData,
        meetingMetadata,

        setAudioFile,
        setMeetingMetadata,
        handleProcessMeeting,
        handleGenerateResolution: generateResolution,
        handleEditResolution,
        handleAcceptResolution,
        handleGenerateAnother,
        handleMetadataSubmit,
        formatDate,
    };
}
