'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Check, Plus, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface ResolutionPreviewProps {
    transcription: string;
    resolution: string;
    isGenerating: boolean;
    onEdit: (editedResolution: string) => void;
    onAccept: () => void;
    onGenerateAnother: () => void;
    metadata: {
        entityName: string;
        jurisdiction: string;
        meetingType: string;
        dateTime: string;
    };
}

export function ResolutionPreview({
    transcription,
    resolution,
    isGenerating,
    onEdit,
    onAccept,
    onGenerateAnother,
    metadata,
}: ResolutionPreviewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedResolution, setEditedResolution] = useState(resolution);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleSaveEdit = () => {
        onEdit(editedResolution);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedResolution(resolution);
        setIsEditing(false);
    };

    const downloadAsPDF = async () => {
        setIsDownloading(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - 2 * margin;
            let yPosition = margin;

            // Helper function to add text with wrapping
            const addWrappedText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
                doc.setFontSize(fontSize);
                if (isBold) {
                    doc.setFont('helvetica', 'bold');
                } else {
                    doc.setFont('helvetica', 'normal');
                }

                const lines = doc.splitTextToSize(text, maxWidth);

                for (const line of lines) {
                    if (yPosition > pageHeight - margin) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    doc.text(line, margin, yPosition);
                    yPosition += fontSize * 0.5;
                }
                yPosition += 5; // Add spacing after paragraph
            };

            // Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('CORPORATE RESOLUTION', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Metadata
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            if (metadata.entityName) {
                doc.text(`Entity: ${metadata.entityName}`, margin, yPosition);
                yPosition += 7;
            }
            if (metadata.meetingType) {
                doc.text(`Meeting Type: ${metadata.meetingType}`, margin, yPosition);
                yPosition += 7;
            }
            if (metadata.jurisdiction) {
                doc.text(`Jurisdiction: ${metadata.jurisdiction}`, margin, yPosition);
                yPosition += 7;
            }
            if (metadata.dateTime) {
                const formattedDate = new Date(metadata.dateTime).toLocaleString();
                doc.text(`Date: ${formattedDate}`, margin, yPosition);
                yPosition += 7;
            }

            yPosition += 10;
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;

            // Resolution content
            const resolutionText = isEditing ? editedResolution : resolution;
            addWrappedText(resolutionText, 11, false);

            // Save the PDF
            const fileName = `resolution_${metadata.entityName || 'document'}_${new Date().getTime()}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Transcription */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Meeting Transcript</h3>
                    <Badge variant="outline">Source</Badge>
                </div>
                <div className="h-[600px] overflow-y-auto p-4 bg-muted/30 rounded-lg border">
                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {transcription}
                    </pre>
                </div>
            </Card>

            {/* Right Side - Resolution */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Draft Resolution</h3>
                    {isGenerating ? (
                        <Badge variant="default" className="animate-pulse">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Generating...
                        </Badge>
                    ) : (
                        <Badge variant="secondary">AI Generated</Badge>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea
                            value={editedResolution}
                            onChange={(e) => setEditedResolution(e.target.value)}
                            className="min-h-[500px] font-mono text-sm"
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleSaveEdit} className="flex-1">
                                <Check className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="h-[500px] overflow-y-auto p-4 bg-muted/30 rounded-lg border mb-4">
                            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                {resolution || 'No resolution generated yet. Upload audio and add meeting details to begin.'}
                            </pre>
                        </div>

                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Button
                                    onClick={onAccept}
                                    disabled={!resolution || isGenerating}
                                    className="flex-1"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Accept Draft
                                </Button>
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    disabled={!resolution || isGenerating}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Manually
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={downloadAsPDF}
                                    disabled={!resolution || isGenerating || isDownloading}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    {isDownloading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                    )}
                                    Download PDF
                                </Button>
                                <Button
                                    onClick={onGenerateAnother}
                                    disabled={!resolution || isGenerating}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
