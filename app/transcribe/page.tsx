'use client';

import { useState } from 'react';
import { AudioUpload } from '@/components/audio-upload';
import { MeetingMetadataForm } from '@/components/meeting-metadata-form';
import { TranscriptionDisplay } from '@/components/transcription-display';
import { ResolutionPreview } from '@/components/resolution-preview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, ArrowRight } from 'lucide-react';

export default function TranscribePage() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
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
        dateTime: '',
        entityName: '',
        jurisdiction: '',
        meetingType: '',
    });

    const handleAudioUpload = async (file: File) => {
        setAudioFile(file);
        setIsTranscribing(true);
        setTranscription('');
        
        try {
            await transcribeAudio(file);
        } catch (error) {
            console.error('Transcription error:', error);
            setTranscription('Error: Failed to transcribe audio. Please try again.');
            setIsTranscribing(false);
        }
    };

    const transcribeAudio = async (file: File) => {
        return;
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('model', 'whisper-1');
            formData.append('response_format', 'verbose_json');
            formData.append('timestamp_granularities[]', 'segment');

            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Format transcription with timestamps
            let formattedTranscription = '';
            if (data.segments && data.segments.length > 0) {
                formattedTranscription = data.segments
                    .map((segment: any) => {
                        const timestamp = formatTimestamp(segment.start);
                        return `[${timestamp}] ${segment.text.trim()}`;
                    })
                    .join('\n\n');
            } else {
                formattedTranscription = data.text;
            }

            // Simulate typing effect for better UX
            const words = formattedTranscription.split(' ');
            let currentText = '';
            
            for (let i = 0; i < words.length; i++) {
                currentText += words[i] + ' ';
                setTranscription(currentText);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
            
            setIsTranscribing(false);
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        }
    };

    const formatTimestamp = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const generateResolution = async () => {
        if (!transcription) {
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
                    transcription,
                    metadata: meetingMetadata,
                }),
            });
            console.log(response)

            if (!response.ok) {
                throw new Error('Failed to generate resolution');
            }

            const data = await response.json();
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
        setAudioFile(null);
    };

    const handleMetadataSubmit = (metadata: typeof meetingMetadata) => {
        setMeetingMetadata(metadata);
        console.log('Meeting metadata saved:', metadata);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Meeting Transcription & Resolution Generator</h1>
                <p className="text-muted-foreground">
                    Upload audio, capture meeting details, and generate legal resolutions with AI
                </p>
            </div>

            {!showResolutionPreview ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Upload and Metadata */}
                        <div className="space-y-6">
                            <Card className="p-6">
                                <h2 className="text-2xl font-semibold mb-4">Audio Upload</h2>
                                <AudioUpload
                                    onUpload={handleAudioUpload}
                                    isTranscribing={isTranscribing}
                                    audioFile={audioFile}
                                />
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-2xl font-semibold mb-4">Meeting Details</h2>
                                <MeetingMetadataForm
                                    onSubmit={handleMetadataSubmit}
                                    initialData={meetingMetadata}
                                />
                            </Card>
                        </div>

                        {/* Right Column - Transcription */}
                        <div className="lg:sticky lg:top-6 h-fit">
                            <Card className="p-6">
                                <h2 className="text-2xl font-semibold mb-4">Transcription</h2>
                                <TranscriptionDisplay
                                    transcription={transcription}
                                    isTranscribing={isTranscribing}
                                />
                            </Card>
                        </div>
                    </div>

                    {/* Generate Resolution Button */}
                    {transcription && !isTranscribing && (
                        <div className="mt-8 flex justify-center">
                            <Button
                                onClick={generateResolution}
                                size="lg"
                                disabled={isGeneratingResolution}
                                className="px-8"
                            >
                                {isGeneratingResolution ? (
                                    <>Generating Resolution...</>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-5 w-5" />
                                        Generate Resolution
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <ResolutionPreview
                    transcription={transcription}
                    resolution={resolution}
                    isGenerating={isGeneratingResolution}
                    onEdit={handleEditResolution}
                    onAccept={handleAcceptResolution}
                    onGenerateAnother={handleGenerateAnother}
                    metadata={meetingMetadata}
                />
            )}
        </div>
    );
}
