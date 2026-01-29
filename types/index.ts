/**
 * Centralized types for the application
 *
 * Import from here for type-only imports:
 * import type { Meeting, MeetingMetadata } from '@/types';
 */

// Meeting types
export type {
  Meeting,
  MeetingMetadata,
  MeetingStatus,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  MeetingCardStatus,
  MeetingCardData,
} from './meeting';

// Resolution types
export type {
  Director,
  Attendee,
  ResolutionSection,
  ResolutionData,
} from './resolution';

// Monitoring types
export type {
  APIProvider,
  APICallStatus,
  APICallRecord,
  DailyStats,
  TodayStats,
  RecentAPICall,
  MonitoringStats,
  RateLimitResult,
  RateLimitConfig,
} from './monitoring';
