'use client';

import { cn } from '@/lib/utils';

type StatusColor = 'success' | 'info' | 'warning' | 'error';

interface StatusChipProps {
  text: string;
  statusColor: StatusColor;
  className?: string;
}

const statusColorStyles: Record<StatusColor, { bg: string; dot: string; text: string }> = {
  success: {
    bg: 'bg-[#22C55E1A]',
    dot: 'bg-[#22C55E]',
    text: 'text-[#22C55E]',
  },
  info: {
    bg: 'bg-[#3B82F61A]',
    dot: 'bg-[#3B82F6]',
    text: 'text-[#3B82F6]',
  },
  warning: {
    bg: 'bg-[#5c4a1a]',
    dot: 'bg-[#fbbf24]',
    text: 'text-[#fbbf24]',
  },
  error: {
    bg: 'bg-[#5c1a1a]',
    dot: 'bg-[#f87171]',
    text: 'text-[#f87171]',
  },
};

export function StatusChip({ text, statusColor, className }: StatusChipProps) {
  const styles = statusColorStyles[statusColor];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-sm px-3 py-1.5',
        styles.bg,
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', styles.dot)} />
      <span className={cn('text-sm font-medium', styles.text)}>{text}</span>
    </div>
  );
}
