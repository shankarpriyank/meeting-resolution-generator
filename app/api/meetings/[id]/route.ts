import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT /api/meetings/[id] - Update a meeting entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server.' },
        { status: 500 }
      );
    }

    // Handle both Promise and direct params (for Next.js version compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    let { id } = resolvedParams;

    // Fallback: extract ID from URL if params didn't work
    if (!id || id === 'undefined') {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const idFromPath = pathParts[pathParts.length - 1];
      if (idFromPath && idFromPath !== 'meetings' && idFromPath !== 'api') {
        id = idFromPath;
      }
    }

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid meeting ID provided', details: `ID received: ${id}` },
        { status: 400 }
      );
    }
    const body = await request.json();
    const {
      resolution_html,
      status,
      resolution,
      ...otherFields
    } = body;

    // Build update object - only include fields that are provided
    const updateData: Record<string, unknown> = {};
    
    if (resolution_html !== undefined) {
      updateData.resolution_html = resolution_html;
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (resolution !== undefined) {
      updateData.resolution = resolution;
    }

    // Allow updating other fields if provided
    Object.keys(otherFields).forEach(key => {
      if (otherFields[key] !== undefined) {
        updateData[key] = otherFields[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update meeting', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting: data });
  } catch (error) {
    console.error('Update meeting API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

// GET /api/meetings/[id] - Get a single meeting by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server.' },
        { status: 500 }
      );
    }

    // Handle both Promise and direct params (for Next.js version compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    let { id } = resolvedParams;

    // Fallback: extract ID from URL if params didn't work
    if (!id || id === 'undefined') {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const idFromPath = pathParts[pathParts.length - 1];
      if (idFromPath && idFromPath !== 'meetings' && idFromPath !== 'api') {
        id = idFromPath;
      }
    }

    console.log('Meeting ID from params:', id);
    console.log('Meeting ID type:', typeof id);
    console.log('Request URL:', request.url);

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid meeting ID provided', details: `ID received: ${id}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meeting', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting: data });
  } catch (error) {
    console.error('Get meeting API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}
