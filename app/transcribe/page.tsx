'use client';

import { useState } from 'react';
import { AudioUpload } from '@/components/audio-upload';
import { MeetingMetadataForm } from '@/components/meeting-metadata-form';
import { TranscriptionDisplay } from '@/components/transcription-display';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TranscribePage() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcription, setTranscription] = useState<string>('');
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

    const handleMetadataSubmit = (metadata: typeof meetingMetadata) => {
        setMeetingMetadata(metadata);
        console.log('Meeting metadata saved:', metadata);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Meeting Transcription</h1>
                <p className="text-muted-foreground">
                    Upload audio and capture meeting details for accurate documentation
                </p>
            </div>

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
        </div>
    );
}
