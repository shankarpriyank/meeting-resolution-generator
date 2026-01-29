import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/meetings - Fetch all meetings
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server.' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meetings', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ meetings: data || [] });
  } catch (error) {
    console.error('Fetch meetings API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting entry
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      title,
      date,
      time,
      entity,
      jurisdiction,
      duration,
      resolution,
      transcript,
      resolution_html,
      file_link,
      status = 'DRAFT',
    } = body;

    // Validate required fields
    if (!title || !date || !entity || !jurisdiction || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date, entity, jurisdiction, transcript' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        title,
        date,
        time: time || '',
        entity,
        jurisdiction,
        duration: duration || 0,
        resolution: resolution || {},
        transcript,
        resolution_html: resolution_html || '',
        file_link: file_link || '',
        status: status || 'DRAFT',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create meeting', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ meeting: data }, { status: 201 });
  } catch (error) {
    console.error('Create meeting API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
