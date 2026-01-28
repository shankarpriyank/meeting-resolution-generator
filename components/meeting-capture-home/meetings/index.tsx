'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MeetingCard, type Meeting } from './cards';

type FilterType = 'All' | 'Draft' | 'Complete';

interface MeetingData {
  id: string;
  title: string;
  date: string;
  time: string;
  entity: string;
  jurisdiction: string;
  duration: number;
  status: string;
  resolution?: unknown;
  created_at: string;
}

export function ActiveMeetings() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const data = await response.json();
        const meetingsData = data.meetings || [];

        // Transform database meetings to Meeting type
        const transformedMeetings: Meeting[] = meetingsData.map((m: MeetingData) => {
          const status = m.status === 'COMPLETED' ? 'signed-archived' : 'drafting-complete';

          // Format duration: duration is stored in seconds
          const formatDuration = (seconds: number): string => {
            if (!seconds || seconds === 0) return '0m';

            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            const parts: string[] = [];
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            // Only show seconds if less than a minute
            if ( secs > 0) parts.push(`${secs}s`);

            return parts.join(' ') || '0m';
          };

          const durationStr = formatDuration(m.duration);

          // Parse resolution count if available
          let resolutionCount = 0;
          try {
            if (m.resolution && typeof m.resolution === 'object') {
              const res = m.resolution as { approvalOfAgreement?: unknown[]; furtherAndPriorActs?: unknown[] };
              if (res.approvalOfAgreement) resolutionCount += res.approvalOfAgreement.length;
              if (res.furtherAndPriorActs) resolutionCount += res.furtherAndPriorActs.length;
            }
          } catch {
            // Ignore parsing errors
          }

          return {
            id: m.id,
            title: m.title,
            status: status,
            date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: m.time || 'N/A',
            jurisdiction: m.jurisdiction,
            entity: m.entity,
            duration: durationStr,
            resolutions: {
              count: resolutionCount,
              status: m.status === 'COMPLETED' ? 'Approved' : 'Detected',
            },
            signatures: {
              current: 0,
              total: 5,
            },
            actionButton: {
              text: m.status === 'COMPLETED' ? 'View Archive' : 'Review Drafts',
              variant: m.status === 'COMPLETED' ? 'secondary' : 'primary',
            },
          };
        });

        setMeetings(transformedMeetings);
      } else {
        console.error('Failed to fetch meetings:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (meetingId: string) => {
    // Navigate to transcribe page with meeting ID
    router.push(`/transcribe?id=${meetingId}`);
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Draft') return meeting.status === 'drafting-complete';
    if (activeFilter === 'Complete') return meeting.status === 'signed-archived';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Active Meetings</h2>
        <div className="flex gap-2">
          {(['All', 'Draft', 'Complete'] as FilterType[]).map((filter) => (
            <Button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-md px-4 py-2 ${activeFilter === filter
                ? 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
                : 'bg-transparent text-gray-400 hover:text-white'
                }`}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading meetings...</div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No meetings found</div>
        ) : (
          filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onActionClick={handleActionClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
