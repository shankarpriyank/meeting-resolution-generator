'use client';

import React from 'react';

interface ResolutionPreviewNavbarProps {
  status?: string;
  statusColor?: 'success' | 'info' | 'warning' | 'error';
  children?: React.ReactNode;
}

const statusColorStyles = {
  success: {
    bg: 'bg-[#1a4d3a]',
    border: 'border-[#4ade80]/30',
    dot: 'bg-[#4ade80]',
    text: 'text-white',
  },
  info: {
    bg: 'bg-[#1e3a5f]',
    border: 'border-[#60a5fa]/30',
    dot: 'bg-[#60a5fa]',
    text: 'text-white',
  },
  warning: {
    bg: 'bg-[#5c4a1a]',
    border: 'border-[#fbbf24]/30',
    dot: 'bg-[#fbbf24]',
    text: 'text-white',
  },
  error: {
    bg: 'bg-[#5c1a1a]',
    border: 'border-[#f87171]/30',
    dot: 'bg-[#f87171]',
    text: 'text-white',
  },
};

const ResolutionPreviewNavbar = ({
  status,
  statusColor = 'success',
  children,
}: ResolutionPreviewNavbarProps) => {
  const styles = statusColorStyles[statusColor];

  return (
    <div className="bg-[#0A0A0A] border-b border-[#2A2A2A] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white">
            Draft Resolution Preview
          </h1>
          <p className="text-sm text-[#8A8A8A] mt-0.5">
            AI-generated resolution from meeting audio
          </p>
        </div>
        <div className="flex items-center gap-4">
          {children}
          {status && (
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 border ${styles.bg} ${styles.border}`}
            >
              <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
              <span className={`text-sm font-medium ${styles.text}`}>
                {status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResolutionPreviewNavbar;
