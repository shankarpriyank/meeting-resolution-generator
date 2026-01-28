'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';

import MeetingCaptureHomeNavbar from '@/components/meeting-capture-home/navbar';
import { AudioUpload } from '@/components/meeting-capture-home/upload';
import { MeetingMetadataForm } from '@/components/meeting-capture-home/meeting-metadata-form';
import { ConnectPlatform } from '@/components/meeting-capture-home/connect-platform';
import ResolutionView from '@/components/resolution-view';
import { convertToHTML } from '@/lib/resolution-html';

function TranscribePageContent() {
    const searchParams = useSearchParams();
    const meetingId = searchParams.get('id');

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [transcription, setTranscription] = useState<string>(``);
    const [resolution, setResolution] = useState<string>('');
    const [isGeneratingResolution, setIsGeneratingResolution] = useState(false);
    const [showResolutionPreview, setShowResolutionPreview] = useState(false);
    const [meetingIdState, setMeetingIdState] = useState<string | null>(meetingId);
    const [meetingStatus, setMeetingStatus] = useState<string>('DRAFT');
    const [isProcessingMeeting, setIsProcessingMeeting] = useState(false);
    const [meetingMetadata, setMeetingMetadata] = useState({
        date: '',
        time: '',
        entityName: '',
        jurisdiction: '',
        meetingType: '',
        meetingTitle: '',
    });

    // Load meeting data if ID is present
    useEffect(() => {
        if (meetingId) {
            loadMeetingData(meetingId);
        }
    }, [meetingId]);

    const loadMeetingData = async (id: string) => {
        try {
            const response = await fetch(`/api/meetings/${id}`);
            if (response.ok) {
                const data = await response.json();
                const meeting = data.meeting;

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
                    setMeetingStatus(meeting.status);
                }

                // If resolution exists, show preview
                if (meeting.resolution_html || meeting.resolution) {
                    setShowResolutionPreview(true);
                }

                setMeetingIdState(id);
            } else {
                console.error('Failed to load meeting:', await response.text());
            }
        } catch (error) {
            console.error('Error loading meeting:', error);
        }
    };

    const handleAudioUpload = async (file: File | null) => {
        setAudioFile(file);
    };

    const handleProcessMeeting = async () => {
        setIsProcessingMeeting(true);
        if (!audioFile) {
            alert('Please upload an audio file first');
            return;
        }

        // if (!meetingMetadata.entityName || !meetingMetadata.meetingType) {
        //     alert('Please fill in at least the entity name and meeting type');
        //     return;
        // }

        // We'll keep track of the uploaded URL locally so we can pass it through
        let uploadedUrl: string | null = null;

        try {
            const formData = new FormData();
            formData.append('file', audioFile);

            const uploadResponse = await fetch('/api/upload-audio', {
                method: 'POST',
                body: formData,
            });

            if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                if (uploadData?.url) {
                    uploadedUrl = uploadData.url;
                    setAudioUrl(uploadedUrl);
                }
            } else {
                const errorData = await uploadResponse.json().catch(() => null);
                console.error('Audio upload failed:', errorData || uploadResponse.statusText);
            }
        } catch (error) {
            console.error('Audio upload error:', error);
        }

        setIsTranscribing(true);
        setTranscription('');
        setTranscriptionProgress(0);
        setShowResolutionPreview(true);
        setIsProcessingMeeting(false);

        try {
            await transcribeAudio(audioFile, uploadedUrl);
        } catch (error) {
            console.error('Transcription error:', error);
            setTranscription('Error: Failed to transcribe audio. Please try again.');
            setIsTranscribing(false);
            setTranscriptionProgress(0);
            setIsProcessingMeeting(false);
        }
    };

    const transcribeAudio = async (file: File, fileLinkOverride?: string | null) => {
        try {
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
            const formattedTranscription = data.transcription || '';

            // Simulate typing effect for better UX
            const words = formattedTranscription.split(' ');
            let currentText = '';

            for (let i = 0; i < words.length; i++) {
                currentText += words[i] + ' ';
                setTranscription(currentText);

                // Calculate progress based on current length vs final length
                if (formattedTranscription.length > 0) {
                    const progress = Math.min(100, Math.round((currentText.length / formattedTranscription.length) * 100));
                    setTranscriptionProgress(progress);
                }

                await new Promise(resolve => setTimeout(resolve, 30));
            }

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
            alert('Please transcribe audio first');
            return;
        }

        if (!meetingMetadata.entityName || !meetingMetadata.meetingType) {
            alert('Please fill in at least the entity name and meeting type');
            return;
        }

        setIsGeneratingResolution(true);
        setShowResolutionPreview(true);

        try {
            const response = await fetch('/api/generate-resolution', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcription: textToUse,
                    metadata: meetingMetadata,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate resolution');
            }

            const data = await response.json();
            console.log(data)

            // Stringify the resolution object for state and saving
            const resolutionString = typeof data.resolution === 'string'
                ? data.resolution
                : JSON.stringify(data.resolution);


            setResolution(convertToHTML(data.resolution));

            // Create or update meeting entry after resolution is generated
            await saveMeetingToDatabase(
                convertToHTML(data.resolution),
                textToUse,
                fileLinkOverride ?? audioUrl
            );
        } catch (error) {
            console.error('Error generating resolution:', error);
            alert('Failed to generate resolution. Please try again.');
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

            const duration = audioFile ? Math.round((audioFile.size / 1000) / 60) : 0; // Rough estimate
            const transcriptToSave = transcriptOverride ?? transcription;
            const fileLinkToSave = fileLinkOverride ?? audioUrl ?? '';

            if (meetingIdState) {
                // Update existing meeting
                const response = await fetch(`/api/meetings/${meetingIdState}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        resolution_html: resolutionData,
                        resolution: {},
                        status: 'DRAFT',
                    }),
                });

                if (!response.ok) {
                    console.error('Failed to update meeting:', await response.text());
                } else {
                    console.log('Meeting updated successfully');
                }
            } else {
                // Create new meeting
                const response = await fetch('/api/meetings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
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
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setMeetingIdState(data.meeting.id);
                    console.log('Meeting created successfully:', data.meeting.id);
                } else {
                    console.error('Failed to create meeting:', await response.text());
                }
            }
        } catch (error) {
            console.error('Error saving meeting to database:', error);
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

                const response = await fetch(`/api/meetings/${meetingIdState}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        resolution_html: resolutionHtml,
                        resolution: resolutionJson,
                    }),
                });

                if (!response.ok) {
                    console.error('Failed to update resolution:', await response.text());
                }
            } catch (error) {
                console.error('Error updating resolution:', error);
            }
        }
    };

    const handleAcceptResolution = async () => {
        console.log('Resolution accepted:', resolution);

        // Update meeting status to COMPLETED
        if (meetingIdState) {
            try {
                const response = await fetch(`/api/meetings/${meetingIdState}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: 'COMPLETED',
                    }),
                });

                if (response.ok) {
                    setMeetingStatus('COMPLETED');
                    alert('Resolution accepted and saved!');
                } else {
                    console.error('Failed to update meeting status:', await response.text());
                    alert('Failed to save resolution. Please try again.');
                }
            } catch (error) {
                console.error('Error accepting resolution:', error);
                alert('Failed to save resolution. Please try again.');
            }
        } else {
            alert('Meeting ID not found. Please try again.');
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

    const handleMetadataSubmit = (metadata: { date: string; time: string; entity: string; jurisdiction: string; meetingType: string; meetingTitle: string }) => {
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
    const formatDate = (date: string, time?: string) => {
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
    };

    return (
        <>

            {!showResolutionPreview ? (
                <>
                    <div className='sticky top-0 z-10'>
                        <MeetingCaptureHomeNavbar />

                    </div>
                    <div className="bg-[#0a0a0a] mx-auto w-full p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            <Card className="col-span-2 p-8 bg-[#151515] border border-[#2A2A2A] rounded-sm">
                                <MeetingMetadataForm
                                    onSubmit={handleMetadataSubmit}
                                    initialData={{
                                        date: meetingMetadata.date || '',
                                        time: meetingMetadata.time || '',
                                        entity: meetingMetadata.entityName || '',
                                        jurisdiction: meetingMetadata.jurisdiction || '',
                                        meetingType: meetingMetadata.meetingType || '',
                                        meetingTitle: meetingMetadata.meetingTitle || '',
                                    }}
                                />
                            </Card>
                            <Card className="p-8 bg-[#151515] border border-[#2A2A2A] rounded-sm">
                                <AudioUpload
                                    onUpload={handleAudioUpload}
                                    isTranscribing={isTranscribing}
                                    audioFile={audioFile}
                                />
                            </Card>

                            <Card className="p-8 bg-[#151515] border border-[#2A2A2A] rounded-sm">

                                <ConnectPlatform />
                            </Card>

                            {/* <div className="col-span-2">
                                <ActiveMeetings />
                            </div> */}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <Button
                                onClick={handleProcessMeeting}
                                size="lg"
                                disabled={!audioFile || !meetingMetadata.entityName || !meetingMetadata.meetingType || !meetingMetadata.meetingTitle || !meetingMetadata.date || isProcessingMeeting}
                                className="px-8 py-8 cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessingMeeting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-5 w-5" />
                                        Process Meeting & Generate Resolution
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <ResolutionView
                    audioBlob={audioFile}
                    audioUrl={audioUrl || undefined}
                    transcription={transcription}
                    isTranscribing={isTranscribing}
                    transcriptionProgress={transcriptionProgress}
                    meetingTitle={meetingMetadata.meetingTitle || meetingMetadata.meetingType || 'Q4 2024 Board Meeting'}
                    entity={meetingMetadata.entityName || 'Acme Corporation Inc.'}
                    date={formatDate(meetingMetadata.date, meetingMetadata.time)}
                    jurisdiction={meetingMetadata.jurisdiction || 'Delaware, USA'}
                    resolution={resolution}
                    isGeneratingResolution={isGeneratingResolution}
                    onEdit={handleEditResolution}
                    onAccept={handleAcceptResolution}
                    onAddAnother={handleGenerateAnother}
                    metadata={meetingMetadata}
                    meetingStatus={meetingStatus}
                />
            )}
            {/* <ResolutionView
                audioBlob={audioFile}
                transcription={transcription}
                isTranscribing={isTranscribing}
                transcriptionProgress={transcriptionProgress}
                meetingTitle={meetingMetadata.meetingTitle || meetingMetadata.meetingType || 'Q4 2024 Board Meeting'}
                entity={meetingMetadata.entityName || 'Acme Corporation Inc.'}
                date={formatDate(meetingMetadata.date, meetingMetadata.time)}
                jurisdiction={meetingMetadata.jurisdiction || 'Delaware, USA'}
                resolution={resolution}
                isGeneratingResolution={isGeneratingResolution}
                onEdit={handleEditResolution}
                onAccept={handleAcceptResolution}
                onAddAnother={handleGenerateAnother}
                metadata={meetingMetadata}
            /> */}
        </>);
}

export default function TranscribePage() {
    return (
        <Suspense fallback={
            <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        }>
            <TranscribePageContent />
        </Suspense>
    );
}
