import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcription, metadata } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a legal document expert specializing in corporate governance documents. Based on the following meeting transcription and metadata, generate a formal corporate resolution in the Veridraft style.

MEETING METADATA:
- Entity Name: ${metadata.entityName || 'N/A'}
- Jurisdiction: ${metadata.jurisdiction || 'N/A'}
- Meeting Type: ${metadata.meetingType || 'N/A'}
- Date & Time: ${metadata.dateTime || 'N/A'}

MEETING TRANSCRIPTION:
${transcription}

Please generate a formal corporate resolution that:
1. Follows legal corporate resolution formatting standards
2. Includes proper headers with entity name, meeting type, date, and jurisdiction
3. Contains "WHEREAS" clauses that provide context and background
4. Contains "RESOLVED" clauses that clearly state the decisions made
5. Uses formal legal language appropriate for corporate governance
6. Includes signature blocks at the end
7. Is formatted professionally and ready for execution

The resolution should capture all decisions, motions, and votes mentioned in the transcription.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const resolution = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

      console.log('Generated Resolution:', resolution);

    return NextResponse.json({ resolution });
  } catch (error: any) {
    console.error('Error generating resolution:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate resolution' },
      { status: 500 }
    );
  }
}
