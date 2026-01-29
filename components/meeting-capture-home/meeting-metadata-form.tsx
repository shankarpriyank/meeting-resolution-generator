'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  validateField,
  isFieldRequired,
} from '@/lib/validation/meeting-schema';
import { cn } from '@/lib/utils';

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

export function MeetingMetadataForm({
  onSubmit,
  initialData,
}: MeetingMetadataFormProps) {
  const [formData, setFormData] = useState<MeetingMetadata>({
    date: initialData?.date || '',
    time: initialData?.time || '',
    entity: initialData?.entity || '',
    jurisdiction: initialData?.jurisdiction || '',
    meetingType: initialData?.meetingType || 'Board Meeting',
    meetingTitle: initialData?.meetingTitle || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate field on blur
  const handleBlur = useCallback((field: keyof MeetingMetadata) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: error || '',
    }));
  }, [formData]);

  // Update form data and trigger validation if field was touched
  const handleChange = (field: keyof MeetingMetadata, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // Validate if field was already touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error || '',
      }));
    }

    onSubmit?.(updatedData);
  };

  // Check if form has any errors
  const hasErrors = Object.values(errors).some((error) => error);

  // Effect to validate on initial load if there's initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || '',
        time: initialData.time || '',
        entity: initialData.entity || '',
        jurisdiction: initialData.jurisdiction || '',
        meetingType: initialData.meetingType || 'Board Meeting',
        meetingTitle: initialData.meetingTitle || '',
      });
    }
  }, [initialData]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Meeting Metadata</h2>

      <div className="space-y-6">
        {/* Meeting Title */}
        <div className="space-y-2">
          <Label htmlFor="meetingTitle" className="text-sm text-white">
            Meeting Title
            {isFieldRequired('meetingTitle') && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          <Input
            id="meetingTitle"
            type="text"
            placeholder="e.g., Q4 2024 Board Meeting"
            value={formData.meetingTitle}
            onChange={(e) => handleChange('meetingTitle', e.target.value)}
            onBlur={() => handleBlur('meetingTitle')}
            className={cn(
              'h-12 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-400 rounded-sm',
              touched.meetingTitle &&
                errors.meetingTitle &&
                'border-red-500 focus:border-red-500'
            )}
          />
          {touched.meetingTitle && errors.meetingTitle && (
            <p className="text-xs text-red-500">{errors.meetingTitle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm text-white">
              Meeting Date
              {isFieldRequired('date') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <DatePicker
              value={formData.date}
              onChange={(value) => handleChange('date', value)}
              placeholder="dd/mm/yyyy"
            />
            {touched.date && errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm text-white">
              Meeting Time
              {isFieldRequired('time') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              onBlur={() => handleBlur('time')}
              className="h-12 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-400 rounded-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            {touched.time && errors.time && (
              <p className="text-xs text-red-500">{errors.time}</p>
            )}
          </div>

          {/* Entity */}
          <div className="space-y-2">
            <Label htmlFor="entity" className="text-sm text-white">
              Entity
              {isFieldRequired('entity') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id="entity"
              type="text"
              placeholder="e.g., Acme Corporation"
              value={formData.entity}
              onChange={(e) => handleChange('entity', e.target.value)}
              onBlur={() => handleBlur('entity')}
              className={cn(
                'h-12 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-400 rounded-sm',
                touched.entity &&
                  errors.entity &&
                  'border-red-500 focus:border-red-500'
              )}
            />
            {touched.entity && errors.entity && (
              <p className="text-xs text-red-500">{errors.entity}</p>
            )}
          </div>

          {/* Jurisdiction */}
          <div className="space-y-2">
            <Label htmlFor="jurisdiction" className="text-sm text-white">
              Jurisdiction
              {isFieldRequired('jurisdiction') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id="jurisdiction"
              type="text"
              placeholder="e.g., Ireland, UK, Delaware"
              value={formData.jurisdiction}
              onChange={(e) => handleChange('jurisdiction', e.target.value)}
              onBlur={() => handleBlur('jurisdiction')}
              className={cn(
                'h-12 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-400 rounded-sm',
                touched.jurisdiction &&
                  errors.jurisdiction &&
                  'border-red-500 focus:border-red-500'
              )}
            />
            {touched.jurisdiction && errors.jurisdiction && (
              <p className="text-xs text-red-500">{errors.jurisdiction}</p>
            )}
          </div>
        </div>

        {/* Meeting Type */}
        <div className="space-y-2">
          <Label className="text-sm text-white">
            Meeting Type
            {isFieldRequired('meetingType') && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          <div className="flex gap-2">
            {meetingTypes.map((type) => (
              <Button
                key={type}
                type="button"
                onClick={() => handleChange('meetingType', type)}
                className={`cursor-pointer rounded-sm px-4 py-2 ${
                  formData.meetingType === type
                    ? 'bg-white text-[#1A1A1A] hover:bg-gray-200'
                    : 'bg-[#0A0A0A] text-white hover:bg-[#3A3A3A]'
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
          {touched.meetingType && errors.meetingType && (
            <p className="text-xs text-red-500">{errors.meetingType}</p>
          )}
        </div>

        {/* Validation Summary */}
        {hasErrors && Object.values(touched).some((t) => t) && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">
              Please fix the errors above before proceeding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
