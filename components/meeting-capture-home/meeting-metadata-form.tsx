'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface MeetingMetadata {
  date: string;
  time: string;
  entity: string;
  jurisdiction: string;
  meetingType: string;
  meetingTitle: string;
}

interface MeetingMetadataFormProps {
  onSubmit?: (metadata: MeetingMetadata) => void;
  initialData?: Partial<MeetingMetadata>;
}

const meetingTypes = [
  'Board Meeting',
  'Committee Meeting',
  'Shareholder Meeting',
  'Special Meeting',
];

export function MeetingMetadataForm({ onSubmit, initialData }: MeetingMetadataFormProps) {
  const [formData, setFormData] = useState<MeetingMetadata>({
    date: initialData?.date || '',
    time: initialData?.time || '',
    entity: initialData?.entity || '',
    jurisdiction: initialData?.jurisdiction || '',
    meetingType: initialData?.meetingType || 'Board Meeting',
    meetingTitle: initialData?.meetingTitle || '',
  });

  const handleChange = (field: keyof MeetingMetadata, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onSubmit?.(updatedData);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Meeting Metadata</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="meetingTitle" className="text-sm text-white">
            Meeting Title
          </Label>
          <Input
            id="meetingTitle"
            type="text"
            placeholder="e.g., Q4 2024 Board Meeting"
            value={formData.meetingTitle}
            onChange={(e) => handleChange('meetingTitle', e.target.value)}
            className="h-12 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-400 rounded-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm text-white">
              Meeting Date
            </Label>
            <DatePicker
              value={formData.date}
              onChange={(value) => handleChange('date', value)}
              placeholder="dd/mm/yyyy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm text-white">
              Meeting Time
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="h-12 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-400 rounded-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity" className="text-sm text-white">
              Entity
            </Label>
            <Input
              id="entity"
              type="text"
              placeholder="e.g., Acme Corporation"
              value={formData.entity}
              onChange={(e) => handleChange('entity', e.target.value)}
              className="h-12 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-400 rounded-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jurisdiction" className="text-sm text-white">
              Jurisdiction
            </Label>
            <Input
              id="jurisdiction"
              type="text"
              placeholder="e.g., Delaware"
              value={formData.jurisdiction}
              onChange={(e) => handleChange('jurisdiction', e.target.value)}
              className="h-12 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-400 rounded-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-white">Meeting Type</Label>
          <div className="flex gap-2">
            {meetingTypes.map((type) => (
              <Button
                key={type}
                type="button"
                onClick={() => handleChange('meetingType', type)}
                className={`cursor-pointer rounded-sm px-4 py-2 ${formData.meetingType === type
                  ? 'bg-white text-[#1A1A1A] hover:bg-gray-200'
                  : 'bg-[#0A0A0A] text-white hover:bg-[#3A3A3A]'
                  }`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
