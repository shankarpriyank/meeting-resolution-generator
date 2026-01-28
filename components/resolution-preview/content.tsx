'use client';

import React, { useState, useEffect } from 'react';
import { 
    Loader2, Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Quote, Code, Minus,
    Undo, Redo, Heading1, Heading2, Heading3,
    Table, TableProperties, Columns, Rows, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table as TableExtension } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import './editor-styles.css';

interface ResolutionData {
    resolutionTitle?: string;
    documentTitle?: string;
    entityName?: string;
    meetingLocation?: string;
    meetingDate?: string;
    meetingTime?: string;
    directors?: Array<{ name: string; position: string }>;
    attendees?: Array<{ name: string; company: string }>;
    chairperson?: string;
    quorumNoted?: string;
    disclosureOfInterest?: string;
    businessPurpose?: string;
    agreementType?: string;
    counterpartyName?: string;
    resolutions?: Array<{ section: string; text: string }>;
    filingInstructions?: string;
    closingStatement?: string;
}

interface ResolutionPreviewContentProps {
    resolution?: string | ResolutionData;
    isGenerating?: boolean;
    isTranscribing?: boolean;
    onEdit?: (editedResolution: string) => void;
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

// Convert resolution data to HTML document
const convertToHTML = (data: ResolutionData): string => {
    return `
        <div class="resolution-document">
            <div class="text-center mb-8">
                <h1 class="text-2xl font-bold mb-2">${data.resolutionTitle || 'BOARD RESOLUTION'}</h1>
                <p class="text-lg mb-1">${data.entityName || 'Entity Name'}</p>
                <p class="text-sm text-gray-400">${data.meetingDate || 'Date'}</p>
            </div>
            
            <div class="border-t border-b border-gray-700 py-4 mb-6">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><strong>Location:</strong> ${data.meetingLocation || '[To be determined]'}</p>
                        <p><strong>Time:</strong> ${data.meetingTime || '[To be determined]'}</p>
                    </div>
                    <div>
                        <p><strong>Meeting Type:</strong> ${data.documentTitle?.split('-')[1]?.trim() || 'Board Meeting'}</p>
                    </div>
                </div>
            </div>

            ${data.directors && data.directors.length > 0 ? `
            <div class="mb-6">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="text-left py-2">PRESENT</th>
                            <th class="text-left py-2">POSITION</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.directors.map(d => `
                            <tr class="border-b border-gray-800">
                                <td class="py-2">${d.name}</td>
                                <td class="py-2">${d.position}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            ${data.attendees && data.attendees.length > 0 ? `
            <div class="mb-6">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="text-left py-2">IN ATTENDANCE</th>
                            <th class="text-left py-2">COMPANY</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.attendees.map(a => `
                            <tr class="border-b border-gray-800">
                                <td class="py-2">${a.name}</td>
                                <td class="py-2">${a.company}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            ${data.chairperson ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">1. Chairperson</h3>
                <p>It was agreed that ${data.chairperson} would Chair the meeting.</p>
            </div>
            ` : ''}

            ${data.quorumNoted ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">2. Quorum</h3>
                <p>${data.quorumNoted}</p>
            </div>
            ` : ''}

            ${data.disclosureOfInterest ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">3. Disclosure of Interest</h3>
                <p>${data.disclosureOfInterest}</p>
            </div>
            ` : ''}

            ${data.businessPurpose ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">4. Business of the meeting</h3>
                <p>The Chairperson reported that the purpose of the meeting was to consider and, if deemed fit:</p>
                <p class="mt-2">${data.businessPurpose}</p>
            </div>
            ` : ''}

            ${data.agreementType ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">5. Approval of Agreement</h3>
                <p class="mb-2">5.1 The following documents were produced to the meeting:</p>
                <p class="ml-4">A draft of the ${data.agreementType}${data.counterpartyName ? ` with ${data.counterpartyName}` : ''}.</p>
            </div>
            ` : ''}

            ${data.resolutions && data.resolutions.length > 0 ? `
            <div class="mb-6">
                ${data.resolutions.map(r => `
                    <p class="mb-4"><strong>${r.section}</strong> ${r.text}</p>
                `).join('')}
            </div>
            ` : ''}

            ${data.filingInstructions ? `
            <div class="mb-6">
                <h3 class="font-semibold mb-2">7. Filing</h3>
                <p>${data.filingInstructions}</p>
            </div>
            ` : ''}

            ${data.closingStatement ? `
            <div class="mb-8">
                <h3 class="font-semibold mb-2">8. Close</h3>
                <p>${data.closingStatement}</p>
            </div>
            ` : ''}

            <div class="mt-12 pt-6 border-t border-gray-700">
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <div class="border-t border-gray-600 pt-2">
                            <p class="text-sm text-gray-400">Secretary Signature</p>
                        </div>
                    </div>
                    <div>
                        <div class="border-t border-gray-600 pt-2">
                            <p class="text-sm text-gray-400">Date</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Parse HTML back to resolution data (simplified - you may need more robust parsing)
const parseHTMLToData = (html: string): ResolutionData => {
    // This is a simplified version - in production you'd want more robust parsing
    // For now, we'll just store the HTML and parse what we can
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract basic fields (this is simplified - you'd need more robust extraction)
    return {
        resolutionTitle: doc.querySelector('h1')?.textContent || '',
        entityName: doc.querySelector('.resolution-document > div > p:nth-of-type(1)')?.textContent || '',
        // Add more parsing as needed
    };
};

const ResolutionPreviewContent = ({
    resolution = '',
    isGenerating = false,
    isTranscribing = false,
    onEdit,
    isEditMode = false,
    onSaveEdit,
    onCancelEdit,
}: ResolutionPreviewContentProps) => {
    const [resolutionData, setResolutionData] = useState<ResolutionData>({});
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
        
        if (typeof resolution === 'string' && resolution) {
            try {
                const parsed = JSON.parse(resolution);
                setResolutionData(parsed);
                
                // Use stored HTML if available (edited content), otherwise generate from data
                const html = parsed._html || convertToHTML(parsed);
                editor.commands.setContent(html);
                setOriginalContent(html);
            } catch {
                setResolutionData({});
            }
        } else if (typeof resolution === 'object') {
            setResolutionData(resolution);
            
            // Use stored HTML if available (edited content), otherwise generate from data
            const html = (resolution as any)._html || convertToHTML(resolution);
            editor.commands.setContent(html);
            setOriginalContent(html);
        }
    }, [resolution, editor]);

    // Update editor editable state when edit mode changes
    useEffect(() => {
        editor?.setEditable(isEditMode);
    }, [isEditMode, editor]);

    const handleSave = () => {
        if (editor) {
            const html = editor.getHTML();
            // Store the edited HTML as the new resolution content
            const updatedData = { ...resolutionData, _html: html };
            const updatedResolution = JSON.stringify(updatedData);
            
            setOriginalContent(html);
            setHasChanges(false);
            
            // Pass edited content to parent
            onSaveEdit?.(updatedResolution);
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
                <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
                <p className="text-sm text-[#8A8A8A]">Generating resolution...</p>
            </div>
        );
    }

    // if (!resolution) {
    //     return (
    //         <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] flex flex-col items-center justify-center">
    //             <p className="text-sm text-[#8A8A8A]">No resolution available yet.</p>
    //         </div>
    //     );
    // }

    return (
        <div className="bg-[#0A0A0A] h-[calc(100vh-180px)] flex flex-col">
            {/* Toolbar - Only show when in edit mode */}
            {isEditMode && editor && (
                <div className="border-b border-[#2A2A2A] bg-[#151515] p-3">
                    <div className="max-w-4xl mx-auto flex items-center gap-1 flex-wrap">
                        {/* Undo/Redo */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Undo"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Redo"
                        >
                            <Redo className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                        {/* Headings */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('heading', { level: 1 })
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Heading 1"
                        >
                            <Heading1 className="h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('heading', { level: 2 })
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Heading 2"
                        >
                            <Heading2 className="h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('heading', { level: 3 })
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Heading 3"
                        >
                            <Heading3 className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                        {/* Bold */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('bold')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Bold"
                        >
                            <Bold className="h-4 w-4" />
                        </Button>

                        {/* Italic */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('italic')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Italic"
                        >
                            <Italic className="h-4 w-4" />
                        </Button>

                        {/* Underline */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('underline')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Underline"
                        >
                            <Underline className="h-4 w-4" />
                        </Button>

                        {/* Strikethrough */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('strike')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Strikethrough"
                        >
                            <Strikethrough className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                        {/* Align Left */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive({ textAlign: 'left' })
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Align Left"
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>

                        {/* Align Center */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive({ textAlign: 'center' })
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Align Center"
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>

                        {/* Align Right */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive({ textAlign: 'right' })
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Align Right"
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>

                        {/* Align Justify */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive({ textAlign: 'justify' })
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Justify"
                        >
                            <AlignJustify className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                        {/* Bullet List */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('bulletList')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Bullet List"
                        >
                            <List className="h-4 w-4" />
                        </Button>

                        {/* Ordered List */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('orderedList')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Ordered List"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                        {/* Table Controls */}
                        <Button
                            type="button"
                            onClick={() => {
                                const rows = prompt('Enter number of rows:', '3');
                                const cols = prompt('Enter number of columns:', '3');
                                if (rows && cols) {
                                    const numRows = parseInt(rows, 10);
                                    const numCols = parseInt(cols, 10);
                                    if (numRows > 0 && numCols > 0) {
                                        editor.chain().focus().insertTable({ 
                                            rows: numRows, 
                                            cols: numCols, 
                                            withHeaderRow: true 
                                        }).run();
                                    }
                                }
                            }}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('table')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Insert Table"
                        >
                            <Table className="h-4 w-4" />
                        </Button>

                        {editor.isActive('table') && (
                            <>
                                <Button
                                    type="button"
                                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                                    className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                                    title="Add Column Before"
                                >
                                    <Columns className="h-4 w-4" />
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                                    className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                                    title="Add Column After"
                                >
                                    <Columns className="h-4 w-4 rotate-180" />
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => editor.chain().focus().addRowBefore().run()}
                                    className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                                    title="Add Row Before"
                                >
                                    <Rows className="h-4 w-4" />
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => editor.chain().focus().addRowAfter().run()}
                                    className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                                    title="Add Row After"
                                >
                                    <Rows className="h-4 w-4 rotate-180" />
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => editor.chain().focus().deleteColumn().run()}
                                    className="p-2 h-9 w-9 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                                    title="Delete Column"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => editor.chain().focus().deleteRow().run()}
                                    className="p-2 h-9 w-9 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                                    title="Delete Row"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => editor.chain().focus().deleteTable().run()}
                                    className="p-2 h-9 w-9 bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300"
                                    title="Delete Table"
                                >
                                    <TableProperties className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                        {/* Blockquote */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('blockquote')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Blockquote"
                        >
                            <Quote className="h-4 w-4" />
                        </Button>

                        {/* Code Block */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                            className={`p-2 h-9 w-9 ${
                                editor.isActive('codeBlock')
                                    ? 'bg-[#3A3A3A] text-white'
                                    : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                            }`}
                            title="Code Block"
                        >
                            <Code className="h-4 w-4" />
                        </Button>

                        {/* Horizontal Rule */}
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().setHorizontalRule().run()}
                            className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                            title="Horizontal Line"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

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