'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MeetingCard, type Meeting } from './cards';

const meetingsData: Meeting[] = [
  {
    id: '1',
    title: 'Q4 Board Meeting 2024',
    status: 'drafting-complete',
    date: 'Dec 15, 2024',
    time: '2:30 PM',
    jurisdiction: 'Delaware',
    entity: 'Acme Corporation',
    duration: '1h 24m',
    resolutions: {
      count: 3,
      status: 'Detected',
    },
    signatures: {
      current: 0,
      total: 5,
    },
    actionButton: {
      text: 'Review Drafts',
      variant: 'primary',
    },
  },
  {
    id: '2',
    title: 'Shareholder Annual Meeting 2024',
    status: 'signed-archived',
    date: 'Dec 10, 2024',
    time: '9:00 AM',
    jurisdiction: 'New York',
    entity: 'Gamma Holdings Inc.',
    duration: '2h 15m',
    resolutions: {
      count: 7,
      status: 'Approved',
    },
    signatures: {
      current: 12,
      total: 12,
    },
    actionButton: {
      text: 'View Archive',
      variant: 'secondary',
    },
  },
];

type FilterType = 'All' | 'Processing' | 'Complete';

export function ActiveMeetings() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const handleActionClick = (meetingId: string) => {
    console.log(`Action clicked for meeting: ${meetingId}`);
    // Add your action logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Active Meetings</h2>
        <div className="flex gap-2">
          {(['All', 'Processing', 'Complete'] as FilterType[]).map((filter) => (
            <Button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-md px-4 py-2 ${
                activeFilter === filter
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
        {meetingsData.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onActionClick={handleActionClick}
          />
        ))}
      </div>
    </div>
  );
}
