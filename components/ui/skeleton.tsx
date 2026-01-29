'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton component for loading states
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#2A2A2A]',
        className
      )}
    />
  );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for transcription display
 */
export function TranscriptionSkeleton() {
  return (
    <div className="space-y-4 p-4 rounded-lg border border-[#2A2A2A]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-start gap-3">
            <Skeleton className="h-6 w-20 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for resolution document preview
 */
export function ResolutionSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Meeting info */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Directors table skeleton */}
      <div className="space-y-2">
        <div className="flex gap-4 border-b border-[#2A2A2A] pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Section skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}

      {/* Signature section */}
      <div className="mt-12 pt-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for card/metadata display
 */
export function CardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-[#2A2A2A] space-y-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
