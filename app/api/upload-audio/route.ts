import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = file.name.split('.').pop() || 'webm';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `audio/${fileName}`;

    const { data, error } = await supabase.storage
      .from('audio')
      .upload(filePath, buffer, {
        contentType: file.type || 'audio/webm',
        upsert: false,
      });

      console.log(error,'(&*^%')

    if (error || !data) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload audio file to storage. error: ' + error },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('audio')
      .getPublicUrl(data.path);

    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({ url: publicUrl, path: data.path });
  } catch (error) {
    console.error('Upload audio API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload audio file' },
      { status: 500 }
    );
  }
}

