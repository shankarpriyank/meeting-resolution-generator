'use client';

import { Button } from '@/components/ui/button';
import { MeetingCard } from './cards';
import { useMeetings } from '@/hooks/use-meetings';

export function ActiveMeetings() {
  const {
    activeFilter,
    setActiveFilter,
    filteredMeetings,
    isLoading,
    handleActionClick,
  } = useMeetings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Active Meetings</h2>
        <div className="flex gap-2">
          {(['All', 'Draft', 'Completed'] as Array<'All' | 'Draft' | 'Completed'>).map((filter) => (
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
