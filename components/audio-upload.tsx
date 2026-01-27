'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, Loader2 } from 'lucide-react';

interface AudioUploadProps {
  onUpload: (file: File) => void;
  isTranscribing: boolean;
  audioFile: File | null;
}

export function AudioUpload({ onUpload, isTranscribing, audioFile }: AudioUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

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

  const removeFile = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        } ${isTranscribing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".mp3,.mp4,.wav,audio/mpeg,audio/mp4,audio/wav,video/mp4"
          onChange={handleChange}
          disabled={isTranscribing}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div>
            <p className="text-lg font-medium mb-1">
              Drop your audio file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <Button 
              type="button" 
              onClick={handleButtonClick}
              disabled={isTranscribing}
            >
              Select File
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="secondary">.mp3</Badge>
            <Badge variant="secondary">.mp4</Badge>
            <Badge variant="secondary">.wav</Badge>
          </div>
        </div>
      </div>

      {audioFile && (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{audioFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(audioFile.size)}
            </p>
          </div>
          {isTranscribing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {isTranscribing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Transcribing audio...</span>
        </div>
      )}
    </div>
  );
}
