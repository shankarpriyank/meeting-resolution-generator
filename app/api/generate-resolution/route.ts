import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
    checkRateLimit, 
    getClientIdentifier, 
    createRateLimitHeaders,
    RATE_LIMIT_TIERS 
} from '@/lib/rate-limiter';
import { recordAPICall, calculateCost } from '@/lib/api-monitoring';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
});

export async function POST(request: NextRequest) {
  const clientIp = getClientIdentifier(request);
  
  // Apply strict rate limiting for AI endpoints
  const rateLimitResult = checkRateLimit(
    clientIp, 
    'generate-resolution', 
    RATE_LIMIT_TIERS.AI_STRICT
  );
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`,
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  const startTime = Date.now();
  
  try {
    const { transcription, metadata } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a legal document expert specializing in corporate governance documents for Ireland. Based on the following meeting transcription and metadata, generate a structured board meeting resolution following the Irish corporate governance format.

MEETING METADATA:
- Meeting Title: ${metadata.meetingTitle || 'N/A'}
- Entity Name: ${metadata.entityName || 'N/A'}
- Jurisdiction: ${metadata.jurisdiction || 'Ireland'}
- Meeting Type: ${metadata.meetingType || 'Board Meeting'}
- Date: ${metadata.date || 'N/A'}
- Time: ${metadata.time || 'N/A'}

MEETING TRANSCRIPTION:
${transcription}

Extract and structure the following components from the transcription. 

CRITICAL: Your response must be ONLY the JSON object below. Do not include markdown code blocks, explanations, or any other text. Return raw JSON only.

JSON structure to return:

{
  "resolutionTitle": "RESOLUTION 1: [Extract the main resolution title from transcription]",
  "documentTitle": "BOARD MEETING MINUTES TEMPLATE: IRELAND - [Extract the resolution type]",
  "entityName": "[Entity name from metadata or transcription]",
  "meetingLocation": "[Extract meeting location]",
  "meetingDate": "[Extract or use metadata date]",
  "meetingTime": "[Extract or use metadata time]",
  "directors": [
    {"name": "[Director 1 name]", "position": "Director"},
    {"name": "[Director 2 name]", "position": "Director"}
  ],
  "attendees": [
    {"name": "[Attendee name]", "company": "[Company name]"}
  ],
  "chairperson": "[Name of chairperson]",
  "quorumNoted": "The Chairperson noted that a quorum of directors was present for the meeting.",
  "disclosureOfInterest": "The Chairperson reminded the directors present that each director was required to disclose to the meeting if they are disqualified from participating in the meeting and / or voting on any of the considerations, determinations and resolutions to be made. The Chairperson further reminded the directors that each director was required to disclose their interest in a contract or proposed contract with the Company to be considered at the meeting, or their interest in a contract which the Company has entered into, or a contract which was previously considered by the Board or a committee of the board of directors of which they are a member and in which they have since become interested.",
  "businessPurpose": "[Extract the main purpose/business of the meeting]",
  "agreementType": "[Extract type of agreement being approved]",
  "counterpartyName": "[Extract counterparty name]",
  "resolutions": [
    {
      "section": "5.2",
      "text": "Following consideration of the terms of the Agreement, IT WAS RESOLVED that the Agreement was in the best interests of the Company."
    },
    {
      "section": "5.3",
      "text": "IT WAS FURTHER RESOLVED to approve the Agreement in the form produced to the meeting and authorise each director or the company secretary (or in the case of execution of a deed any two directors or any director and the company secretary) to execute the Agreement, subject to such amendments as they think fit."
    },
    {
      "section": "6.1",
      "text": "IT WAS RESOLVED that each director or the company secretary (or in the case of execution of a deed any two directors or any director and the company secretary) of the Company be and is hereby authorised on behalf of the Company to negotiate, finalise, agree and approve the terms of, and execute, sign, date, time and/or deliver, and to take or procure to be taken any act or step considered necessary, desirable or expedient, in connection with implementing the matters dealt with above."
    },
    {
      "section": "6.2",
      "text": "IT WAS FURTHER RESOLVED that to the extent that any acts and/or things have already been implemented or carried out by or on behalf of the Company in connection with the matters approved at the meeting, such acts and/or things be and are hereby authorised and ratified."
    }
  ],
  "filingInstructions": "The Chairperson instructed the company secretary to make all necessary and appropriate entries in the books and registers of the Company and to arrange for any necessary forms and documents to be filed at the Companies Registration Office.",
  "closingStatement": "There was no further business and the Chairperson declared the meeting closed."
}

Extract all relevant information from the transcription. If specific information is not available, use placeholder text like "[To be determined]" or make reasonable inferences based on the context.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      system: 'You are a JSON API that returns only valid JSON objects. Never include markdown formatting, explanations, or any text outside the JSON object.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const latencyMs = Date.now() - startTime;
    const resolutionText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Record successful API call with token usage
    const inputTokens = message.usage?.input_tokens || 0;
    const outputTokens = message.usage?.output_tokens || 0;
    const estimatedCost = calculateCost('claude-3-haiku-20240307', inputTokens, outputTokens);

    recordAPICall({
      endpoint: 'generate-resolution',
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      status: 'success',
      latency_ms: latencyMs,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost: estimatedCost,
      client_ip: clientIp,
    });

    console.log('Generated Resolution Text:', resolutionText);

    // Parse the JSON response
    let resolution;
    try {
      // Try to extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = resolutionText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        resolutionText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : resolutionText;
      resolution = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // If parsing fails, return the raw text
      resolution = { rawText: resolutionText };
    }

    return NextResponse.json(
      { resolution },
      { headers: createRateLimitHeaders(rateLimitResult) }
    );
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    
    // Record failed API call
    recordAPICall({
      endpoint: 'generate-resolution',
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      status: 'error',
      latency_ms: latencyMs,
      error_message: error.message || 'Unknown error',
      client_ip: clientIp,
    });

    console.error('Error generating resolution:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate resolution' },
      { status: 500 }
    );
  }
}
