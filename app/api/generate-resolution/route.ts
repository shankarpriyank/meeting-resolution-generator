import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from '@/lib/rate-limiter';
import { recordAPICall, calculateCost } from '@/lib/api-monitoring';
import {
  buildSystemPrompt,
  buildResolutionPrompt,
} from '@/lib/prompts/resolution-prompt';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
  baseURL: 'https://api.anthropic.com',
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

    // Build dynamic prompts based on jurisdiction
    const jurisdiction = metadata?.jurisdiction || 'Ireland';
    const systemPrompt = buildSystemPrompt(jurisdiction);
    const userPrompt = buildResolutionPrompt(metadata || {}, transcription);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const latencyMs = Date.now() - startTime;
    const resolutionText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Record successful API call with token usage
    const inputTokens = message.usage?.input_tokens || 0;
    const outputTokens = message.usage?.output_tokens || 0;
    const estimatedCost = calculateCost(
      'claude-3-5-haiku-latest',
      inputTokens,
      outputTokens
    );

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
      metadata: { jurisdiction },
    });

    console.log('Generated Resolution Text:', resolutionText);

    // Parse the JSON response
    let resolution;
    try {
      // Try to extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch =
        resolutionText.match(/```json\s*([\s\S]*?)\s*```/) ||
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
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Record failed API call
    recordAPICall({
      endpoint: 'generate-resolution',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-latest',
      status: 'error',
      latency_ms: latencyMs,
      error_message: errorMessage,
      client_ip: clientIp,
    });

    console.error('Error generating resolution:', error);
    return NextResponse.json(
      { error: errorMessage || 'Failed to generate resolution' },
      { status: 500 }
    );
  }
}
