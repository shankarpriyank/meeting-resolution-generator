'use client';

import React, { useState } from 'react'
import ResolutionPreviewNavbar from './resolution-preview/navbar'
import ResolutionPreviewContent from './resolution-preview/content'
import ResolutionPreviewFooter from './resolution-preview/footer'

import MeetingRecordingContent from './meeting-recording/content'
import MeetingRecordingNavbar from './meeting-recording/navbar'
import MeetingRecordingFooter from './meeting-recording/footer'
import { generatePdf } from '@/lib/api/pdf';

// Helper function to generate HTML from resolution data
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
    _html?: string;
}

const generateResolutionHTML = (data: ResolutionData): string => {
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

interface ResolutionViewProps {
    // Meeting Recording Props
    audioBlob?: Blob | File | null;
    audioUrl?: string;
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
    meetingStatus?: string;
    metadata?: {
        entityName?: string;
        jurisdiction?: string;
        meetingType?: string;
        meetingTitle?: string;
        date?: string;
        time?: string;
    };
}

const ResolutionView = ({
    audioBlob,
    audioUrl,
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
    meetingStatus = 'DRAFT',
    metadata,
}: ResolutionViewProps) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

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
            console.log('Saved Resolution Content:', editedContent);
            try {
                const parsed = JSON.parse(editedContent);
                console.log('Parsed Resolution Data:', parsed);
                if (parsed._html) {
                    console.log('Edited HTML Content:', parsed._html);
                }
            } catch {
                console.log('Raw content (not JSON):', editedContent);
            }
            onEdit(editedContent);
        }
        setIsEditMode(false);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
    };

    const handleDownloadPDF = async () => {
        if (!resolution) {
            alert('No resolution to download');
            return;
        }

        setIsDownloading(true);

        try {
            // Parse resolution to get the HTML content
            let htmlContent = '';
            let title = 'Resolution Document';

            try {
                const parsed = JSON.parse(resolution);
                title = parsed.resolutionTitle || parsed.documentTitle || 'Resolution Document';

                // Use _html if available (edited content), otherwise generate from data
                if (parsed._html) {
                    htmlContent = parsed._html;
                } else {
                    // Generate HTML from resolution data
                    htmlContent = generateResolutionHTML(parsed);
                }
            } catch {
                htmlContent = resolution;
            }

            console.log('Generating PDF with HTML:', htmlContent);

            const blob = await generatePdf({ html: htmlContent, title });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('PDF download error:', error);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="grid grid-cols-2">
            <div className="col-span-1 border-r border-[#27272A]">
                <MeetingRecordingNavbar />
                <MeetingRecordingContent
                    audioBlob={audioBlob}
                    audioUrl={audioUrl}
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
                    onDownload={handleDownloadPDF}
                    isEditMode={isEditMode}
                    isDownloading={isDownloading}
                    meetingStatus={meetingStatus}
                    isTranscribing={isTranscribing}
                    isGeneratingResolution={isGeneratingResolution}
                />
            </div>
        </div>
    )
}

export default ResolutionView