'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';

import MeetingCaptureHomeNavbar from '@/components/meeting-capture-home/navbar';
import { AudioUpload } from '@/components/meeting-capture-home/upload';
import { MeetingMetadataForm } from '@/components/meeting-capture-home/meeting-metadata-form';
import { ConnectPlatform } from '@/components/meeting-capture-home/connect-platform';
import ResolutionView from '@/components/resolution-view';
import { useTranscribe } from '@/hooks/use-transcribe';

function TranscribePageContent() {
    const searchParams = useSearchParams();
    const meetingId = searchParams.get('id');

    const {
        audioFile,
        audioUrl,
        isTranscribing,
        transcriptionProgress,
        transcription,
        resolution,
        isGeneratingResolution,
        showResolutionPreview,
        meetingStatus,
        isProcessingMeeting,
        isLoadingMeetingData,
        meetingMetadata,
        setAudioFile,
        handleProcessMeeting,
        handleEditResolution,
        handleAcceptResolution,
        handleGenerateAnother,
        handleMetadataSubmit,
        formatDate,
    } = useTranscribe(meetingId);

    if (isLoadingMeetingData) {
        return (
            <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

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
                                    onUpload={setAudioFile}
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
