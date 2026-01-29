'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getMeetings, type Meeting as ApiMeeting } from '@/lib/api/meetings';
import type { Meeting as CardMeeting } from '@/components/meeting-capture-home/meetings/cards';
import { formatDuration } from '@/lib/utils/formatting';

type FilterType = 'All' | 'Draft' | 'Completed';

interface UseMeetingsReturn {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  meetings: CardMeeting[];
  filteredMeetings: CardMeeting[];
  isLoading: boolean;
  handleActionClick: (meetingId: string) => void;
}

export function useMeetings(): UseMeetingsReturn {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [meetings, setMeetings] = useState<CardMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const meetingsData = await getMeetings();

      const transformedMeetings: CardMeeting[] = meetingsData.map((m: ApiMeeting) => {
        const status = m.status === 'COMPLETED' ? 'signed-archived' : 'drafting-complete';
        const durationStr = formatDuration(m.duration);

        let resolutionCount = 0;
        try {
          if (m.resolution && typeof m.resolution === 'object') {
            const res = m.resolution as { approvalOfAgreement?: unknown[]; furtherAndPriorActs?: unknown[] };
            if (res.approvalOfAgreement) resolutionCount += res.approvalOfAgreement.length;
            if (res.furtherAndPriorActs) resolutionCount += res.furtherAndPriorActs.length;
          }
        } catch {
          // ignore
        }

        return {
          id: m.id,
          title: m.title,
          status,
          date: new Date(m.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
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
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleActionClick = (meetingId: string) => {
    router.push(`/transcribe?id=${meetingId}`);
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Draft') return meeting.status === 'drafting-complete';
    if (activeFilter === 'Completed') return meeting.status === 'signed-archived';
    return true;
  });

  return {
    activeFilter,
    setActiveFilter,
    meetings,
    filteredMeetings,
    isLoading,
    handleActionClick,
  };
}
