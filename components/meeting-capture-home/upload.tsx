'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { File, X, Loader2, FileText, Music } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type UploadMode = 'audio' | 'transcript';

interface AudioUploadProps {
  onUpload: (file: File | null) => void;
  onTranscriptUpload?: (file: File | null) => void;
  isTranscribing: boolean;
  audioFile: File | null;
}

export function AudioUpload({
  onUpload,
  onTranscriptUpload,
  isTranscribing,
  audioFile,
}: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>('audio');
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (uploadMode === 'audio') {
      const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'video/mp4'];
      const validExtensions = ['.mp3', '.mp4', '.wav'];

      const fileExtension = file.name
        .toLowerCase()
        .slice(file.name.lastIndexOf('.'));

      if (
        validTypes.includes(file.type) ||
        validExtensions.includes(fileExtension)
      ) {
        // Clear transcript when audio is uploaded
        setTranscriptFile(null);
        onTranscriptUpload?.(null);
        onUpload(file);
      } else {
        alert('Please upload a valid audio file (.mp3, .mp4, or .wav)');
      }
    } else {
      // Transcript mode
      const validExtensions = ['.txt', '.srt', '.vtt'];
      const fileExtension = file.name
        .toLowerCase()
        .slice(file.name.lastIndexOf('.'));

      if (validExtensions.includes(fileExtension)) {
        // Clear audio when transcript is uploaded
        onUpload(null);
        setTranscriptFile(file);
        onTranscriptUpload?.(file);
      } else {
        alert('Please upload a valid transcript file (.txt, .srt, or .vtt)');
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleContainerClick = () => {
    if (!isTranscribing) {
      inputRef.current?.click();
    }
  };

  const removeFile = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    if (uploadMode === 'audio') {
      onUpload(null);
    } else {
      setTranscriptFile(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (Math.round((bytes / Math.pow(k, i)) * 100) / 100) + ' ' + sizes[i];
  };

  const getAcceptString = () => {
    if (uploadMode === 'audio') {
      return '.mp3,.mp4,.wav,audio/mpeg,audio/mp4,audio/wav,video/mp4';
    }
    return '.txt,.srt,.vtt,text/plain';
  };

  const currentFile = uploadMode === 'audio' ? audioFile : transcriptFile;

  return (
    <div className="bg-[#151515]">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4 p-1 bg-[#0A0A0A] rounded-lg">
        <button
          type="button"
          onClick={() => setUploadMode('audio')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer',
            uploadMode === 'audio'
              ? 'bg-[#2A2A2A] text-white'
              : 'text-[#8A8A8A] hover:text-white'
          )}
        >
          <Music className="h-4 w-4" />
          Upload Audio
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('transcript')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer',
            uploadMode === 'transcript'
              ? 'bg-[#2A2A2A] text-white'
              : 'text-[#8A8A8A] hover:text-white'
          )}
        >
          <FileText className="h-4 w-4" />
          Upload Transcript
        </button>
      </div>

      <div
        className={`relative bg-[#151515] rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isTranscribing ? 'opacity-50 pointer-events-none' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleContainerClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={getAcceptString()}
          onChange={handleChange}
          disabled={isTranscribing}
        />

        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
            {uploadMode === 'audio' ? (
              <Image
                src="/upload.png"
                alt="Upload"
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <FileText className="h-8 w-8 text-[#8A8A8A]" />
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-lg font-semibold text-white">
              {uploadMode === 'audio' ? 'Upload Recording' : 'Upload Transcript'}
            </h2>
            <p className="text-sm text-[#8A8A8A]">
              {uploadMode === 'audio'
                ? 'Drag & drop or click to upload MP3, MP4, WAV files'
                : 'Drag & drop or click to upload TXT, SRT, VTT files'}
            </p>
          </div>

          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
            disabled={isTranscribing}
            className="bg-[#2A2A2A] hover:bg-[#4a4a4a] text-white border-0 rounded-sm px-8 py-6 cursor-pointer"
          >
            Select File
          </Button>
        </div>
      </div>

      {currentFile && (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mt-4">
          {uploadMode === 'audio' ? (
            <File className="h-5 w-5 text-muted-foreground shrink-0" />
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(currentFile.size)}
            </p>
          </div>
          {isTranscribing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
