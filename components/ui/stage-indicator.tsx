'use client';

import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'transcribing'
  | 'analyzing'
  | 'generating'
  | 'complete'
  | 'error';

interface StageConfig {
  label: string;
  shortLabel: string;
}

const STAGE_CONFIG: Record<
  Exclude<ProcessingStage, 'idle' | 'error'>,
  StageConfig
> = {
  uploading: { label: 'Uploading', shortLabel: 'Upload' },
  transcribing: { label: 'Transcribing', shortLabel: 'Transcribe' },
  analyzing: { label: 'Analyzing', shortLabel: 'Analyze' },
  generating: { label: 'Generating', shortLabel: 'Generate' },
  complete: { label: 'Complete', shortLabel: 'Done' },
};

const STAGE_ORDER: Exclude<ProcessingStage, 'idle' | 'error'>[] = [
  'uploading',
  'transcribing',
  'analyzing',
  'generating',
  'complete',
];

interface StageIndicatorProps {
  currentStage: ProcessingStage;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

/**
 * Multi-stage progress indicator component
 */
export function StageIndicator({
  currentStage,
  className,
  variant = 'default',
}: StageIndicatorProps) {
  if (currentStage === 'idle') {
    return null;
  }

  const currentIndex = STAGE_ORDER.indexOf(
    currentStage as Exclude<ProcessingStage, 'idle' | 'error'>
  );

  const getStageStatus = (stage: Exclude<ProcessingStage, 'idle' | 'error'>) => {
    const stageIndex = STAGE_ORDER.indexOf(stage);

    if (currentStage === 'error') {
      // On error, show completed stages as complete, current as error
      return stageIndex < currentIndex ? 'complete' : stageIndex === currentIndex ? 'error' : 'pending';
    }

    if (stageIndex < currentIndex) return 'complete';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (variant === 'minimal') {
    const activeStage = STAGE_CONFIG[currentStage as keyof typeof STAGE_CONFIG];
    if (!activeStage) return null;

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-[#22C55E]" />
        <span className="text-sm text-[#8A8A8A]">{activeStage.label}...</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {STAGE_ORDER.slice(0, -1).map((stage, index) => {
          const status = getStageStatus(stage);
          return (
            <div key={stage} className="flex items-center">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  status === 'complete' && 'bg-[#22C55E]',
                  status === 'active' && 'bg-[#22C55E] animate-pulse',
                  status === 'pending' && 'bg-[#3A3A3A]',
                  status === 'error' && 'bg-red-500'
                )}
              />
              {index < STAGE_ORDER.length - 2 && (
                <div
                  className={cn(
                    'w-4 h-0.5 transition-all duration-300',
                    status === 'complete' ? 'bg-[#22C55E]' : 'bg-[#3A3A3A]'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {STAGE_ORDER.slice(0, -1).map((stage, index) => {
        const status = getStageStatus(stage);
        const config = STAGE_CONFIG[stage];

        return (
          <div key={stage} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                  status === 'complete' && 'bg-[#22C55E]',
                  status === 'active' && 'bg-[#22C55E]/20 border-2 border-[#22C55E]',
                  status === 'pending' && 'bg-[#2A2A2A] border-2 border-[#3A3A3A]',
                  status === 'error' && 'bg-red-500/20 border-2 border-red-500'
                )}
              >
                {status === 'complete' ? (
                  <Check className="h-4 w-4 text-white" />
                ) : status === 'active' ? (
                  <Loader2 className="h-4 w-4 text-[#22C55E] animate-spin" />
                ) : (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      status === 'pending' && 'text-[#6A6A6A]',
                      status === 'error' && 'text-red-500'
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 transition-colors duration-300',
                  status === 'complete' && 'text-[#22C55E]',
                  status === 'active' && 'text-[#22C55E] font-medium',
                  status === 'pending' && 'text-[#6A6A6A]',
                  status === 'error' && 'text-red-500'
                )}
              >
                {config.shortLabel}
              </span>
            </div>
            {index < STAGE_ORDER.length - 2 && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-2 transition-all duration-300',
                  status === 'complete' ? 'bg-[#22C55E]' : 'bg-[#3A3A3A]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Get human-readable status message for current stage
 */
export function getStageMessage(stage: ProcessingStage): string {
  switch (stage) {
    case 'idle':
      return 'Ready to process';
    case 'uploading':
      return 'Uploading your file...';
    case 'transcribing':
      return 'Transcribing audio...';
    case 'analyzing':
      return 'Analyzing content...';
    case 'generating':
      return 'Generating resolution...';
    case 'complete':
      return 'Processing complete';
    case 'error':
      return 'An error occurred';
    default:
      return '';
  }
}
