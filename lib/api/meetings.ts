// Re-export types from centralized location
export type {
    Meeting,
    MeetingMetadata,
    CreateMeetingPayload,
    UpdateMeetingPayload,
} from '@/types/meeting';

import type { Meeting, CreateMeetingPayload, UpdateMeetingPayload } from '@/types/meeting';

/**
 * Fetch all meetings
 */
export async function getMeetings(): Promise<Meeting[]> {
    const response = await fetch('/api/meetings');

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch meetings: ${errorText}`);
    }

    const data = await response.json();
    return data.meetings || [];
}

/**
 * Fetch a single meeting by ID
 */
export async function getMeetingById(id: string): Promise<Meeting> {
    const response = await fetch(`/api/meetings/${id}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load meeting: ${errorText}`);
    }
    
    const data = await response.json();
    return data.meeting;
}

/**
 * Create a new meeting
 */
export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
    const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create meeting: ${errorText}`);
    }
    
    const data = await response.json();
    return data.meeting;
}

/**
 * Update an existing meeting
 */
export async function updateMeeting(id: string, payload: UpdateMeetingPayload): Promise<Meeting> {
    const response = await fetch(`/api/meetings/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update meeting: ${errorText}`);
    }
    
    const data = await response.json();
    return data.meeting;
}
