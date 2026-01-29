/**
 * Meeting-related types
 */

/**
 * Metadata for a meeting form
 */
export interface MeetingMetadata {
  date: string;
  time: string;
  entityName: string;
  jurisdiction: string;
  meetingType: string;
  meetingTitle: string;
}

/**
 * Meeting status types
 */
export type MeetingStatus = 'DRAFT' | 'COMPLETED' | 'ARCHIVED';

/**
 * Full meeting record from the database
 */
export interface Meeting {
  id: string;
  title: string;
  date: string;
  time?: string;
  entity: string;
  jurisdiction: string;
  meetingType?: string;
  duration?: number;
  resolution?: Record<string, unknown>;
  transcript?: string;
  resolution_html?: string;
  file_link?: string;
  status?: MeetingStatus | string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Payload for creating a new meeting
 */
export interface CreateMeetingPayload {
  title: string;
  date: string;
  time?: string;
  entity: string;
  jurisdiction: string;
  duration?: number;
  resolution?: Record<string, unknown>;
  transcript: string;
  resolution_html?: string;
  file_link?: string;
  status?: MeetingStatus | string;
}

/**
 * Payload for updating a meeting
 */
export interface UpdateMeetingPayload {
  resolution_html?: string;
  resolution?: Record<string, unknown>;
  status?: MeetingStatus | string;
  [key: string]: unknown;
}

/**
 * Meeting card display status (for UI)
 */
export type MeetingCardStatus = 'drafting-complete' | 'signed-archived';

/**
 * Meeting card data for display
 */
export interface MeetingCardData {
  id: string;
  title: string;
  status: MeetingCardStatus;
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
