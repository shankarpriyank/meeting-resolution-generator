'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusChip } from '@/components/shared/status-chip';

export interface Meeting {
  id: string;
  title: string;
  status: 'drafting-complete' | 'signed-archived';
  date: string;
  time: string;
  jurisdiction: string;
  entity: string;
  duration: string;
  resolutions: {
    count: number;
    status: 'Detected' | 'Approved';
  };
  signatures: {
    current: number;
    total: number;
  };
  actionButton: {
    text: string;
    variant: 'primary' | 'secondary';
  };
}

interface MeetingCardProps {
  meeting: Meeting;
  onActionClick?: (meetingId: string) => void;
}

export function MeetingCard({ meeting, onActionClick }: MeetingCardProps) {
  const getStatusChip = (status: Meeting['status']) => {
    if (status === 'drafting-complete') {
      return <StatusChip text="Drafting Complete" statusColor="success" />;
    } else {
      return <StatusChip text="Signed & Archived" statusColor="info" />;
    }
  };

  return (
    <Card className="gap-0 p-6 bg-[#151515] border border-[#2A2A2A] rounded-sm">
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
          {getStatusChip(meeting.status)}
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-gray-400 text-[12px]">
            <Image
              src="/calender.svg"
              alt="Calendar"
              width={11}
              height={12}
              className="object-contain"
            />
            <span>{meeting.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-[12px]">
            <Clock className="w-4 h-4" />
            <span>{meeting.time}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Badge className="bg-[#2A2A2A] text-[#8A8A8A] border-0 rounded-sm px-3 py-1">
              {meeting.jurisdiction}
            </Badge>
            <Badge className="bg-[#2A2A2A] text-[#8A8A8A] border-0 rounded-sm px-3 py-1">
              {meeting.entity}
            </Badge>
          </div>
        </div>
       </div>

       <div className='border-t border-[#2A2A2A] my-4' />

       <div className='flex items-center justify-between'>
        <div className="flex items-center gap-6 flex-wrap text-sm text-gray-400">
          <span>
            Duration: <span className="font-bold text-white">{meeting.duration}</span>
          </span>
          <span>
            Resolutions: <span className="font-bold text-white">{meeting.resolutions.count} {meeting.resolutions.status}</span>
          </span>
          <span>
            Signatures: <span className="font-bold text-white">{meeting.signatures.current}/{meeting.signatures.total}</span>
          </span>
        </div>

      <div className="shrink-0">
        <Button
          type="button"
          onClick={() => onActionClick?.(meeting.id)}
          className={`rounded-lg px-6 py-2 ${
            meeting.actionButton.variant === 'primary'
              ? 'bg-white text-[#1A1A1A] hover:bg-gray-200'
              : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] border border-gray-600'
          }`}
        >
          {meeting.actionButton.text}
        </Button>
      </div>
       </div>



    </Card>
  );
}
