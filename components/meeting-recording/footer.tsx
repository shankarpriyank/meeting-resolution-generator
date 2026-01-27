'use client';

interface MeetingRecordingFooterProps {
  progress?: number;
  isLoading?: boolean;
}

function CircularLoader() {
  return (
    <div className="relative w-5 h-5">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#22C55E]"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-8px)`,
            animation: 'dot-pulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function MeetingRecordingFooter({ 
  progress = 0, 
  isLoading = true 
}: MeetingRecordingFooterProps) {
  const displayProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="bg-[#0A0A0A] border-t border-[#2A2A2A] px-6 py-[27px]">
      <div className="flex items-center gap-4">
        <div className="flex-1">
            <div className="flex items-start justify-between">
          <p className="text-sm text-[#8A8A8A] mb-4">AI Parsing Progress</p>

              {isLoading && (
                <div className="flex items-center gap-2">
                  <CircularLoader />
                  <span className="text-sm font-medium text-[#22C55E]">
                    {displayProgress}%
                  </span>
                </div>
              )}
            </div>
          <div className="w-full h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#22C55E] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
