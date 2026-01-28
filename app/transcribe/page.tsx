'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';

import MeetingCaptureHomeNavbar from '@/components/meeting-capture-home/navbar';
import { AudioUpload } from '@/components/meeting-capture-home/upload';
import { MeetingMetadataForm } from '@/components/meeting-capture-home/meeting-metadata-form';
import { ConnectPlatform } from '@/components/meeting-capture-home/connect-platform';
import { ActiveMeetings } from '@/components/meeting-capture-home/meetings/index';
import ResolutionView from '@/components/resolution-view';



export default function TranscribePage() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [transcription, setTranscription] = useState<string>(`00:00:00
Welcome to the podcast.

00:00:01
I'm your host, Jaden Schafer.

00:00:02
Today on the show, I wanna talk about

00:00:04
a really interesting company called HumansAnd.

00:00:06
And I think the reason why a lot of people

00:00:08
are talking about them is that right now

00:00:10
we have all of these different chatbots

00:00:12
that have gotten really good at answering questions,

00:00:14
they're really good at summarizing documents

00:00:15
or solving equations, right?

00:00:16
All of these types of things we think about all the time.

00:00:19
But for all, you know, for how intelligent

00:00:21
and how smart they are, most of them still act

00:00:24
like they're kind of this solo assistant, right?

00:00:26
They're optimized for one user

00:00:28
and for they're doing one prompt at a time.

00:00:30
What they're not doing and what they're not very good at

00:00:33
is some of these really messy, more human kind of work

00:00:36
of collaboration things that we do.

00:00:38
So whether that's like, you know, coordinating groups

00:00:40
with a bunch of conflicting priorities

00:00:42
or if they're tracking decisions over weeks or months

00:00:44
or if they're trying to help teams stay aligned

00:00:46
or goals and, you know, all of these goals

00:00:48
and people and information is all kind of shifting around.

00:00:50
This is what AI chatbots are struggling with today.

00:00:53
And so HumansAnd is building a solution to this.

00:00:56
I'm gonna get into all of this on the podcast today.

00:00:58
But before we do, I wanted to mention the new feature

00:01:01
we've just added to AI Box that I'm super excited about.

00:01:03
And that is file uploads for our builder.

00:01:05
So we have a Vibe Builder tool.

00:01:08
If you've never built a software before

00:01:10
or never built a tool before, you can go to aibox.ai,

00:01:13
describe what you're trying to build on our builder

00:01:15
and our AI will automatically link together

00:01:18
different AI models and fill out the prompts.

00:01:20
And we've been doing this for a while.`);
    const [resolution, setResolution] = useState<string>('');
    const [isGeneratingResolution, setIsGeneratingResolution] = useState(false);
    const [showResolutionPreview, setShowResolutionPreview] = useState(false);
    const [meetingMetadata, setMeetingMetadata] = useState({
        date: '',
        time: '',
        entityName: '',
        jurisdiction: '',
        meetingType: '',
        meetingTitle: '',
    });

    const handleAudioUpload = async (file: File | null) => {
        setAudioFile(file);
    };

    const handleProcessMeeting = async () => {
        if (!audioFile) {
            alert('Please upload an audio file first');
            return;
        }

        // if (!meetingMetadata.entityName || !meetingMetadata.meetingType) {
        //     alert('Please fill in at least the entity name and meeting type');
        //     return;
        // }

        setIsTranscribing(true);
        setTranscription('');
        setTranscriptionProgress(0);
        setShowResolutionPreview(true);

        try {
            await transcribeAudio(audioFile);
        } catch (error) {
            console.error('Transcription error:', error);
            setTranscription('Error: Failed to transcribe audio. Please try again.');
            setIsTranscribing(false);
            setTranscriptionProgress(0);
        }
    };

    const transcribeAudio = async (file: File) => {
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
            await generateResolution(formattedTranscription);
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        }
    };

    const generateResolution = async (transcriptionText?: string) => {
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
            setResolution(data.resolution);
        } catch (error) {
            console.error('Error generating resolution:', error);
            alert('Failed to generate resolution. Please try again.');
        } finally {
            setIsGeneratingResolution(false);
        }
    };

    const handleEditResolution = (editedResolution: string) => {
        setResolution(editedResolution);
    };

    const handleAcceptResolution = () => {
        console.log('Resolution accepted:', resolution);
        alert('Resolution accepted! In a production app, this would save to your database.');
    };

    const handleGenerateAnother = () => {
        setResolution('');
        setShowResolutionPreview(false);
        setTranscription('');
        setTranscriptionProgress(0);
        setAudioFile(null);
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
        console.log('Meeting metadata saved:', metadata);
    };

    console.log('Meeting Metadata:', meetingMetadata);
    console.log('Audio file:', audioFile);

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
                                disabled={!audioFile || !meetingMetadata.entityName || !meetingMetadata.meetingType || !meetingMetadata.meetingTitle || !meetingMetadata.date}
                                className="px-8 py-8 cursor-pointer text-white"
                            >
                                <FileText className="mr-2 h-5 w-5" />
                                Process Meeting & Generate Resolution
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <ResolutionView
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
                />
            )}
            {/* <ResolutionView
                audioBlob={audioFile}
                transcription={transcription}
                isTranscribing={isTranscribing}
                transcriptionProgress={transcriptionProgress}
                meetingTitle={meetingMetadata.meetingTitle || meetingMetadata.meetingType || 'Q4 2024 Board Meeting'}
                entity={meetingMetadata.entityName || 'Acme Corporation Inc.'}
                date={formatDate(meetingMetadata.dateTime)}
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
