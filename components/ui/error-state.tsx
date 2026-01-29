'use client';

import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'compact';
}

/**
 * Error state component for displaying errors with recovery actions
 */
export function ErrorState({
  title,
  message,
  onRetry,
  onCancel,
  className,
  variant = 'default',
}: ErrorStateProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20',
          className
        )}
      >
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-500">{title}</p>
          <p className="text-xs text-red-400/80 truncate">{message}</p>
        </div>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="shrink-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20',
          className
        )}
      >
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-500">{title}</p>
          <p className="text-sm text-red-400/80 mt-1">{message}</p>
          {(onRetry || onCancel) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Try Again
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant - full page/section error
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <XCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-white text-[#1A1A1A] hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="bg-[#2A2A2A] text-white border-[#2A2A2A] hover:bg-[#3A3A3A]"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Common error messages for reuse
 */
export const ERROR_MESSAGES = {
  TRANSCRIPTION_FAILED: {
    title: 'Transcription Failed',
    message:
      'We encountered an error while transcribing your audio. Please check your file and try again.',
  },
  RESOLUTION_FAILED: {
    title: 'Resolution Generation Failed',
    message:
      'We encountered an error while generating the resolution. Please try again.',
  },
  UPLOAD_FAILED: {
    title: 'Upload Failed',
    message:
      'We encountered an error while uploading your file. Please check your connection and try again.',
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    message:
      'Unable to connect to the server. Please check your internet connection and try again.',
  },
  RATE_LIMIT: {
    title: 'Too Many Requests',
    message:
      'You have made too many requests. Please wait a moment before trying again.',
  },
  PARSE_ERROR: {
    title: 'Invalid File Format',
    message:
      'The file format is not supported or the file is corrupted. Please try a different file.',
  },
} as const;
