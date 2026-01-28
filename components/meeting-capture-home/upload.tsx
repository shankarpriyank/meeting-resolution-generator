'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { File, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface AudioUploadProps {
  onUpload: (file: File | null) => void;
  isTranscribing: boolean;
  audioFile: File | null;
}

export function AudioUpload({ onUpload, isTranscribing, audioFile }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
    const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'video/mp4'];
    const validExtensions = ['.mp3', '.mp4', '.wav'];

    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
      onUpload(file);
    } else {
      alert('Please upload a valid audio file (.mp3, .mp4, or .wav)');
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

    onUpload(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-[#151515]">
      <div
        className={`relative bg-[#151515] rounded-lg p-8 text-center transition-colors cursor-pointer ${isTranscribing ? 'opacity-50 pointer-events-none' : ''
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
          accept=".mp3,.mp4,.wav,audio/mpeg,audio/mp4,audio/wav,video/mp4"
          onChange={handleChange}
          disabled={isTranscribing}
        />

        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
            <Image
              src="/upload.png"
              alt="Upload"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-lg font-semibold text-white">
              Upload Recording
            </h2>
            <p className="text-sm text-[#8A8A8A]">
              Drag & drop or click to upload MP3, MP4, WAV files
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

      {audioFile && (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <File className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{audioFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(audioFile.size)}
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

      {/* {isTranscribing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Transcribing audio...</span>
        </div>
      )} */}
    </div>
  );
}
