'use client';

import React, { useState } from 'react'
import ResolutionPreviewNavbar from './resolution-preview/navbar'
import ResolutionPreviewContent from './resolution-preview/content'
import ResolutionPreviewFooter from './resolution-preview/footer'

import MeetingRecordingContent from './meeting-recording/content'
import MeetingRecordingNavbar from './meeting-recording/navbar'
import MeetingRecordingFooter from './meeting-recording/footer'

interface ResolutionViewProps {
    // Meeting Recording Props
    audioBlob?: Blob | File | null;
    transcription?: string;
    isTranscribing?: boolean;
    transcriptionProgress?: number;
    meetingTitle?: string;
    entity?: string;
    date?: string;
    jurisdiction?: string;

    // Resolution Preview Props
    resolution?: string;
    isGeneratingResolution?: boolean;
    onEdit?: (editedResolution: string) => void;
    onAccept?: () => void;
    onAddAnother?: () => void;
    metadata?: {
        entityName?: string;
        jurisdiction?: string;
        meetingType?: string;
        dateTime?: string;
    };
}

const ResolutionView = ({
    audioBlob,
    transcription = '',
    isTranscribing = false,
    transcriptionProgress = 0,
    meetingTitle,
    entity,
    date,
    jurisdiction,
    resolution = '',
    isGeneratingResolution = false,
    onEdit,
    onAccept,
    onAddAnother,
    metadata,
}: ResolutionViewProps) => {
    const [isEditMode, setIsEditMode] = useState(false);

    // Determine status for resolution preview navbar
    const getResolutionStatus = () => {
        if (isTranscribing) return { status: 'Transcribing...', color: 'info' as const };
        if (isGeneratingResolution) return { status: 'Generating...', color: 'success' as const };
        if (resolution) return { status: 'Complete', color: 'success' as const };
        return { status: undefined, color: 'info' as const };
    };

    const { status, color } = getResolutionStatus();

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleSaveEdit = (editedContent?: string) => {
        if (editedContent && onEdit) {
            onEdit(editedContent);
        }
        setIsEditMode(false);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
    };

    return (
        <div className="grid grid-cols-2">
            <div className="col-span-1 border-r border-[#27272A]">
                <MeetingRecordingNavbar />
                <MeetingRecordingContent
                    audioBlob={audioBlob}
                    transcription={transcription}
                    isTranscribing={isTranscribing}
                    meetingTitle={meetingTitle}
                    entity={entity}
                    date={date}
                    jurisdiction={jurisdiction}
                />
                <MeetingRecordingFooter
                    progress={isTranscribing ? transcriptionProgress : 100}
                    isLoading={isTranscribing}
                />
            </div>
            <div className="col-span-1">
                <ResolutionPreviewNavbar
                    status={status}
                    statusColor={color}
                />
                <ResolutionPreviewContent
                    resolution={resolution}
                    isGenerating={isGeneratingResolution}
                    isTranscribing={isTranscribing}
                    onEdit={onEdit}
                    isEditMode={isEditMode}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    metadata={metadata}
                />
                <ResolutionPreviewFooter
                    onAccept={onAccept}
                    onEdit={handleEditClick}
                    onAddAnother={onAddAnother}
                    isEditMode={isEditMode}
                />
            </div>
        </div>
    )
}

export default ResolutionView