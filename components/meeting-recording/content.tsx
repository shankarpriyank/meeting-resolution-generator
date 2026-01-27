'use client';

import React, { useState } from 'react';
import AudioPlayer from './audio-player';
import { TranscriptionDisplay } from '@/components/transcription-display';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MeetingRecordingContentProps {
    meetingTitle?: string;
    entity?: string;
    date?: string;
    jurisdiction?: string;
    audioBlob?: Blob | File | null;
    transcription?: string;
    isTranscribing?: boolean;
}

const MeetingRecordingContent = ({
    meetingTitle = 'Q4 2024 Board Meeting',
    entity = 'Acme Corporation Inc.',
    date = 'December 15, 2024',
    jurisdiction = 'Delaware, USA',
    audioBlob,
    transcription = '',
    isTranscribing = false,
}: MeetingRecordingContentProps) => {
    const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(true);

    return (
        <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] overflow-y-auto">
            <div className="bg-[#18181B4D] grid grid-cols-2 gap-6 p-6 border-b border-[#2A2A2A]">
                {/* Left Column */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#8A8A8A] uppercase tracking-wide">
                            MEETING TITLE
                        </label>
                        <p className="text-sm text-white">
                            {meetingTitle}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#8A8A8A] uppercase tracking-wide">
                            ENTITY
                        </label>
                        <p className="text-sm text-white">
                            {entity}
                        </p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#8A8A8A] uppercase tracking-wide">
                            DATE
                        </label>
                        <p className="text-sm text-white">
                            {date}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#8A8A8A] uppercase tracking-wide">
                            JURISDICTION
                        </label>
                        <p className="text-sm text-white">
                            {jurisdiction}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <AudioPlayer audioBlob={audioBlob} />

                {/* Live Transcript Section */}
                <div className="rounded-lg">
                    {/* Transcript Header */}
                    <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                    >
                        <h3 className="text-base font-medium text-white">Live Transcript</h3>
                        <button
                            className="flex items-center gap-1 text-sm text-[#8A8A8A] hover:text-white transition-colors"
                        >
                            {isTranscriptExpanded ? 'Hide' : 'Show'}
                            {isTranscriptExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* Transcript Content */}
                    {isTranscriptExpanded && (
                        <div className="p-4 pt-0">
                            <TranscriptionDisplay
                                transcription={transcription}
                                isTranscribing={isTranscribing}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeetingRecordingContent;