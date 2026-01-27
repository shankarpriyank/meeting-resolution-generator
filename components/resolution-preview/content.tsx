'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ResolutionPreviewContentProps {
    resolution?: string;
    isGenerating?: boolean;
    isTranscribing?: boolean;
    onEdit?: (editedResolution: string) => void;
    onEditClick?: () => void;
    metadata?: {
        entityName?: string;
        jurisdiction?: string;
        meetingType?: string;
        dateTime?: string;
    };
}

const ResolutionPreviewContent = ({
    resolution = '',
    isGenerating = false,
    isTranscribing = false,
    onEdit,
    onEditClick,
}: ResolutionPreviewContentProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedResolution, setEditedResolution] = useState(resolution);

    React.useEffect(() => {
        setEditedResolution(resolution);
    }, [resolution]);

    React.useEffect(() => {
        if (onEditClick) {
            // Expose edit trigger function
            (window as { __triggerEditResolution?: () => void }).__triggerEditResolution = () => {
                if (resolution) {
                    setIsEditing(true);
                }
            };
        }
    }, [onEditClick, resolution]);

    const handleSaveEdit = () => {
        if (onEdit) {
            onEdit(editedResolution);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedResolution(resolution);
        setIsEditing(false);
    };

    return (
        <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] overflow-y-auto p-6">
            {isTranscribing && !resolution ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
                    <p className="text-sm text-[#8A8A8A]">Waiting for transcription to complete...</p>
                </div>
            ) : isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
                    <p className="text-sm text-[#8A8A8A]">Generating resolution...</p>
                </div>
            ) : resolution ? (
                <div className="flex flex-col gap-4">
                    {isEditing ? (
                        <>
                            <Textarea
                                value={editedResolution}
                                onChange={(e) => setEditedResolution(e.target.value)}
                                className="min-h-[400px] bg-[#1A1A1A] border-[#2A2A2A] text-white resize-none"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveEdit}
                                    className="bg-white text-[#1A1A1A] hover:bg-gray-200"
                                >
                                    Save
                                </Button>
                                <Button
                                    onClick={handleCancelEdit}
                                    variant="outline"
                                    className="bg-[#2A2A2A] text-white border-[#2A2A2A] hover:bg-[#3A3A3A]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
                                <pre className="whitespace-pre-wrap text-sm text-white font-sans leading-relaxed">
                                    {resolution}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-sm text-[#8A8A8A]">No resolution available yet.</p>
                </div>
            )}
        </div>
    );
};

export default ResolutionPreviewContent;