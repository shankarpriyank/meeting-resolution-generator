'use client';

import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface TranscriptionDisplayProps {
  transcription: string;
  isTranscribing: boolean;
}

export function TranscriptionDisplay({ transcription, isTranscribing }: TranscriptionDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcription]);

  const formatTranscription = (text: string) => {
    // Split by timestamp pattern [HH:MM:SS]
    const parts = text.split(/(\[\d{2}:\d{2}:\d{2}\])/g);
    const formatted = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].match(/\[\d{2}:\d{2}:\d{2}\]/)) {
        formatted.push({
          timestamp: parts[i],
          text: parts[i + 1] || '',
        });
        i++; // Skip the next part as we've already used it
      }
    }
    
    return formatted;
  };

  const formattedTranscription = formatTranscription(transcription);

  return (
    <div className="space-y-4">
      {!transcription && !isTranscribing ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No transcription yet</p>
          <p className="text-sm">Upload an audio file to begin transcription</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            {isTranscribing && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <Badge variant="default" className="animate-pulse">
                  Transcribing...
                </Badge>
              </>
            )}
            {transcription && !isTranscribing && (
              <Badge variant="outline">Transcription Complete</Badge>
            )}
          </div>

          <div 
            ref={scrollRef}
            className="h-[600px] overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg border"
          >
            {formattedTranscription.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="font-mono text-xs shrink-0">
                    {item.timestamp.replace('[', '').replace(']', '')}
                  </Badge>
                  <p className="text-sm leading-relaxed flex-1">
                    {item.text.trim()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTranscribing && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" 
                     style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" 
                     style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" 
                     style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
