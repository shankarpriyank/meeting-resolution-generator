'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Save } from 'lucide-react';

interface MeetingMetadata {
  dateTime: string;
  entityName: string;
  jurisdiction: string;
  meetingType: string;
}

interface MeetingMetadataFormProps {
  onSubmit: (metadata: MeetingMetadata) => void;
  initialData?: MeetingMetadata;
}

const meetingTypes = [
  { value: 'board', label: 'Board Meeting' },
  { value: 'shareholder', label: 'Shareholder Meeting' },
  { value: 'committee', label: 'Committee Meeting' },
  { value: 'special', label: 'Special Meeting' },
  { value: 'annual', label: 'Annual General Meeting' },
];

const jurisdictions = [
  { value: 'delaware', label: 'Delaware' },
  { value: 'california', label: 'California' },
  { value: 'new-york', label: 'New York' },
  { value: 'texas', label: 'Texas' },
  { value: 'florida', label: 'Florida' },
  { value: 'other', label: 'Other' },
];

export function MeetingMetadataForm({ onSubmit, initialData }: MeetingMetadataFormProps) {
  const [formData, setFormData] = useState<MeetingMetadata>(
    initialData || {
      dateTime: '',
      entityName: '',
      jurisdiction: '',
      meetingType: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof MeetingMetadata, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dateTime">Meeting Date & Time</Label>
        <Input
          id="dateTime"
          type="datetime-local"
          value={formData.dateTime}
          onChange={(e) => handleChange('dateTime', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entityName">Entity Name</Label>
        <Input
          id="entityName"
          type="text"
          placeholder="e.g., Acme Corporation"
          value={formData.entityName}
          onChange={(e) => handleChange('entityName', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jurisdiction">Jurisdiction</Label>
        <select
          id="jurisdiction"
          value={formData.jurisdiction}
          onChange={(e) => handleChange('jurisdiction', e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select jurisdiction</option>
          {jurisdictions.map((jurisdiction) => (
            <option key={jurisdiction.value} value={jurisdiction.value}>
              {jurisdiction.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meetingType">Meeting Type</Label>
        <select
          id="meetingType"
          value={formData.meetingType}
          onChange={(e) => handleChange('meetingType', e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select meeting type</option>
          {meetingTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Meeting Details
      </Button>
    </form>
  );
}
