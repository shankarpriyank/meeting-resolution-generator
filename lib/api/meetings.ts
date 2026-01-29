export interface MeetingMetadata {
    date: string;
    time: string;
    entityName: string;
    jurisdiction: string;
    meetingType: string;
    meetingTitle: string;
}

export interface Meeting {
    id: string;
    title: string;
    date: string;
    time?: string;
    entity: string;
    jurisdiction: string;
    meetingType?: string;
    duration?: number;
    resolution?: Record<string, any>;
    transcript?: string;
    resolution_html?: string;
    file_link?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateMeetingPayload {
    title: string;
    date: string;
    time?: string;
    entity: string;
    jurisdiction: string;
    duration?: number;
    resolution?: Record<string, any>;
    transcript: string;
    resolution_html?: string;
    file_link?: string;
    status?: string;
}

export interface UpdateMeetingPayload {
    resolution_html?: string;
    resolution?: Record<string, any>;
    status?: string;
    [key: string]: any;
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
