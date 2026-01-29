'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResolutionSkeleton } from '@/components/ui/skeleton';
import { ErrorState, ERROR_MESSAGES } from '@/components/ui/error-state';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table as TableExtension } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import type { ResolutionData } from '@/types';
import { EditorToolbar } from './toolbar';
import './editor-styles.css';

interface ResolutionPreviewContentProps {
    resolution?: string | ResolutionData;
    isGenerating?: boolean;
    isTranscribing?: boolean;
    isLoading?: boolean;
    error?: string | null;
    onEdit?: (editedResolution: string) => void;
    onRetry?: () => void;
    isEditMode?: boolean;
    onSaveEdit?: (editedContent?: string) => void;
    onCancelEdit?: () => void;
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
    isLoading = false,
    error = null,
    onRetry,
    isEditMode = false,
    onSaveEdit,
    onCancelEdit,
}: ResolutionPreviewContentProps) => {
    const [originalContent, setOriginalContent] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExtension,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TableExtension.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: '',
        editable: isEditMode,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            setHasChanges(editor.getHTML() !== originalContent);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-8 py-6',
            },
        },
    });

    // Parse and set initial resolution data
    useEffect(() => {
        if (!editor) return;

        editor.commands.setContent(resolution);
        setOriginalContent(resolution as string);

    }, [resolution, editor]);

    // Update editor editable state when edit mode changes
    useEffect(() => {
        editor?.setEditable(isEditMode);
    }, [isEditMode, editor]);

    const handleSave = () => {
        if (editor) {
            const html = editor.getHTML();

            setOriginalContent(html);
            setHasChanges(false);

            // Pass edited content to parent
            onSaveEdit?.(html);
        } else {
            onSaveEdit?.();
        }
    };

    const handleCancel = () => {
        if (editor && originalContent) {
            editor.commands.setContent(originalContent);
            setHasChanges(false);
        }
        onCancelEdit?.();
    };

    // Show error state
    if (error) {
        return (
            <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] flex flex-col items-center justify-center p-8">
                <ErrorState
                    title={ERROR_MESSAGES.RESOLUTION_FAILED.title}
                    message={error}
                    onRetry={onRetry}
                />
            </div>
        );
    }

    // Show skeleton while loading initial data
    if (isLoading && !resolution && !isGenerating && !isTranscribing) {
        return (
            <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] overflow-y-auto">
                <div className="max-w-4xl mx-auto p-2">
                    <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] shadow-xl">
                        <ResolutionSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (isTranscribing && !resolution) {
        return (
            <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
                <p className="text-sm text-[#8A8A8A]">Waiting for transcription to complete...</p>
            </div>
        );
    }

    if (isGenerating) {
        return (
            <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
                    <div className="absolute inset-0 h-8 w-8 animate-ping opacity-20 rounded-full bg-[#22C55E]" />
                </div>
                <p className="text-sm text-[#8A8A8A]">Generating resolution...</p>
                <p className="text-xs text-[#6A6A6A]">This may take a few moments</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] flex flex-col">
            {/* Toolbar - Only show when in edit mode */}
            {isEditMode && editor && <EditorToolbar editor={editor} />}

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-2">
                    <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] shadow-xl h-full">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {isEditMode && hasChanges && (
                <div className="border-t border-[#2A2A2A] bg-[#151515] p-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <p className="text-sm text-[#8A8A8A]">You have unsaved changes</p>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                className="bg-[#2A2A2A] text-white border-[#2A2A2A] hover:bg-[#3A3A3A]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-white text-[#1A1A1A] hover:bg-gray-200"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResolutionPreviewContent;
