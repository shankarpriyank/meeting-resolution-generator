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

    const prompt = `You are a legal document expert specializing in corporate governance documents. Based on the following meeting transcription and metadata, generate a structured board meeting resolution following the Irish corporate governance format.

MEETING METADATA:
- Meeting Title: ${metadata.meetingTitle || 'N/A'}
- Entity Name: ${metadata.entityName || 'N/A'}
- Jurisdiction: ${metadata.jurisdiction || ''}
- Meeting Type: ${metadata.meetingType || ''}
- Date: ${metadata.date || 'N/A'}
- Time: ${metadata.time || 'N/A'}

MEETING TRANSCRIPTION:
${transcription}

EXAMPLE RESOLUTION FORMAT (use this as a reference how to structure the resolution):

[Entity Name] 
(the "Company")

Minutes of a meeting of the board of the Company (the "Board") duly convened, constituted and held at [Meeting Location] on [Meeting Date] at [Meeting Time]. 

PRESENT
POSITION
[Director Name]
Director
[Director Name]
Director

IN ATTENDANCE
COMPANY 
[NAME]
[                   ]

1. Chairperson
It was agreed that [		] would Chair the meeting. 

2. Quorum
The Chairperson noted that a quorum of directors was present for the meeting. 

3. Disclosure of Interest
The Chairperson reminded the directors present that each director was required to disclose to the meeting if they are disqualified from participating in the meeting and / or the considerations, determinations and resolutions to be made. The Chairperson further reminded the directors that each director was required to disclose their interest in a contract or proposed contract with the Company to be considered at the meeting, or their interest in a contract which the Company has entered into, or a contract which was previously considered by the Board or a committee of the board of directors of which they are a member and in which they have since become interested.

4. Business of the meeting
The Chairperson reported that the purpose of the meeting was to consider and, if deemed fit:
Approve the entry by the Company into a [Describe Type of Commercial Agreement] agreement with [Counterparty Name] on the terms set out in the draft document attached to these minutes (the "Agreement").

5. Approval of Agreement
5.1 The following documents were produced to the meeting:
A draft of the Agreement.

5.2 Following consideration of the terms of the Agreement, IT WAS RESOLVED that the Agreement was in the best interests of the Company. 

5.3 IT WAS FURTHER RESOLVED to approve the Agreement in the form produced to the meeting and authorise each director or the company secretary (or in the case of execution of a deed any two directors or any director and the company secretary) to execute the Agreement, subject to such amendments as they think fit. 

6. Further and Prior Acts
6.1 IT WAS RESOLVED that each director or the company secretary (or in the case of execution of a deed any two directors or any director and the company secretary) of the Company be and is hereby authorised on behalf of the Company:

6.1.1 to negotiate, finalise, agree and approve the terms of, and execute, sign, date, time and/or deliver, either under hand or seal, any document, agreement, notice, resolution, certificate, annexure, deed or document expressed to be signed as a deed or under the Company's seal; and

6.1.2 to take or procure to be taken any act or step considered by him in his absolute discretion to be necessary, desirable or expedient,

in connection with any of the foregoing or for the purposes of approving or implementing any aspect, part, step or matter connected with the matters dealt with above.

6.2 IT WAS FURTHER RESOLVED that to the extent that any acts and/or things have already been implemented or carried out by or on behalf of the Company in connection with the matters approved at the meeting, such acts and/or things be and are hereby authorised and ratified.

7. Filing
The Chairperson instructed the company secretary to make all necessary and appropriate entries in the books and registers of the Company and to arrange for any necessary forms and documents to be filed at the Companies Registration Office.

8. Close
There was no further business and the Chairperson declared the meeting closed.

Chairperson signature

CRITICAL INSTRUCTIONS:

1. Include placeholder text like "[To be determined]" when information is not available in the transcription .
2. Use metadata values as fallback only when information cannot be extracted from the transcription.
3. Extract ALL resolutions mentioned in the transcription. Do NOT limit to specific sections - extract every resolution that was discussed, with appropriate section numbering. Number them sequentially based on the structure shown in the example.
4. Your response must be ONLY the JSON object. Do not include markdown code blocks, explanations, or any other text. Return raw JSON only.

REQUIRED JSON STRUCTURE (replace descriptions below with actual extracted values):

{
  "entityName": "[Entity name or the company name from transcription - use metadata if not found in transcription]",
  "meetingLocation": "[Extract meeting location from transcription, empty if not mentioned]",
  "meetingDate": "[Extract date from transcription or use metadata date formatted as DD Month YYYY only if not found in transcription]",
  "meetingTime": "[Extract time from transcription or use metadata time only if not found in transcription]",
  "meetingType": "[Extract meeting type from transcription or use metadata meeting type only if not found in transcription]",
  "directors": [
    {"name": "[Director name from transcription]", "position": "Director"}
  ],
  "attendees": [
    {"name": "[Attendee name from transcription]", "company": "[Company name from transcription]"}
  ],
  "chairperson": "[Name of chairperson from transcription, empty if not mentioned]",
  "quorumNoted": "[Extract quorum discussion from transcription, empty if not mentioned]",
  "disclosureOfInterest": "[Extract disclosure discussion from transcription, empty if not mentioned]",
  "businessPurpose": "[Extract the main purpose/business of the meeting from transcription, empty if not mentioned]",
  "agreementType": "[Extract type of agreement being approved from transcription, empty if not mentioned]",
  "counterpartyName": "[Extract counterparty name from transcription, empty if not mentioned]",
  "approvalOfAgreement": [
    {
      "section": "[Section number like '5.2', '5.3', etc. - number sequentially based on what was discussed]",
      "text": "[Extract the complete resolution text from transcription. Include phrases like 'IT WAS RESOLVED' or 'IT WAS FURTHER RESOLVED' as they appear in the transcription]"
    }
  ],
  "furtherAndPriorActs": [
    {
      "section": "[Section number like '6.1', '6.1.1', '6.1.2', '6.2', etc. - number sequentially based on what was discussed]",
      "text": "[Extract the complete resolution text from transcription. Include phrases like 'IT WAS RESOLVED' or 'IT WAS FURTHER RESOLVED' as they appear in the transcription]"
    }
  ],
  "filingInstructions": "[Extract filing instructions from transcription, empty if not mentioned]",
  "closingStatement": "[Extract closing statement from transcription, empty if not mentioned]",

}

Extract all relevant information from the transcription. If specific information is not available, use placeholder text like "[To be determined]" or make reasonable inferences based on the context.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
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
    const estimatedCost = calculateCost('claude-3-5-haiku-latest', inputTokens, outputTokens);

    recordAPICall({
      endpoint: 'generate-resolution',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-latest',
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
      model: 'claude-3-5-haiku-latest',
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
