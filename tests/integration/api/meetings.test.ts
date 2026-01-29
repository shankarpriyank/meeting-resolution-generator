import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase before importing the route handlers
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

import { GET, POST } from '@/app/api/meetings/route';
import { supabase } from '@/lib/supabase';

describe('GET /api/meetings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return meetings list on success', async () => {
    const mockMeetings = [
      { id: '1', title: 'Meeting 1', status: 'DRAFT' },
      { id: '2', title: 'Meeting 2', status: 'COMPLETED' },
    ];

    vi.mocked(supabase!.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockMeetings, error: null }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/meetings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meetings).toEqual(mockMeetings);
  });

  it('should return 500 when Supabase returns an error', async () => {
    vi.mocked(supabase!.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/meetings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch meetings');
  });

  it('should return empty array when no meetings exist', async () => {
    vi.mocked(supabase!.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/meetings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meetings).toEqual([]);
  });
});

describe('POST /api/meetings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a meeting successfully', async () => {
    const mockMeeting = {
      id: 'new-meeting-id',
      title: 'New Meeting',
      date: '2024-01-15',
      entity: 'Test Corp',
      jurisdiction: 'Delaware',
      transcript: 'Meeting transcript...',
      status: 'DRAFT',
    };

    vi.mocked(supabase!.from).mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockMeeting, error: null }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Meeting',
        date: '2024-01-15',
        entity: 'Test Corp',
        jurisdiction: 'Delaware',
        transcript: 'Meeting transcript...',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.meeting).toEqual(mockMeeting);
  });

  it('should return 400 when required fields are missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Meeting',
        // Missing date, entity, jurisdiction, transcript
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('should return 500 when Supabase insert fails', async () => {
    vi.mocked(supabase!.from).mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Meeting',
        date: '2024-01-15',
        entity: 'Test Corp',
        jurisdiction: 'Delaware',
        transcript: 'Meeting transcript...',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create meeting');
  });

  it('should use default status DRAFT when not provided', async () => {
    const insertMock = vi.fn().mockReturnThis();

    vi.mocked(supabase!.from).mockReturnValue({
      insert: insertMock,
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: '1', status: 'DRAFT' },
        error: null,
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Meeting',
        date: '2024-01-15',
        entity: 'Test Corp',
        jurisdiction: 'Delaware',
        transcript: 'Meeting transcript...',
      }),
    });

    await POST(request);

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'DRAFT',
      })
    );
  });
});
