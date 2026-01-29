/**
 * Transcript Parsing Utilities
 *
 * Parses various transcript file formats (SRT, VTT, TXT) into
 * a consistent formatted transcript string.
 */

export interface TranscriptSegment {
  startTime: string;
  endTime?: string;
  text: string;
}

export interface FormattedTranscript {
  segments: TranscriptSegment[];
  fullText: string;
}

/**
 * Parse SRT (SubRip) subtitle format
 *
 * Format:
 * 1
 * 00:00:01,000 --> 00:00:04,000
 * This is the first line of text.
 *
 * @param content - Raw SRT file content
 * @returns Formatted transcript
 */
export function parseSRT(content: string): FormattedTranscript {
  const segments: TranscriptSegment[] = [];
  const blocks = content.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n');

    // Skip if block doesn't have enough lines (index, timestamp, text)
    if (lines.length < 3) continue;

    // Skip the index line (first line is just a number)
    const timestampLine = lines[1];
    const textLines = lines.slice(2);

    // Parse timestamp: 00:00:01,000 --> 00:00:04,000
    const timestampMatch = timestampLine.match(
      /(\d{2}:\d{2}:\d{2})[,.](\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})[,.](\d{3})/
    );

    if (timestampMatch) {
      const startTime = timestampMatch[1];
      const endTime = timestampMatch[3];
      const text = textLines.join(' ').trim();

      if (text) {
        segments.push({ startTime, endTime, text });
      }
    }
  }

  return formatTranscriptOutput(segments);
}

/**
 * Parse VTT (WebVTT) subtitle format
 *
 * Format:
 * WEBVTT
 *
 * 00:00:01.000 --> 00:00:04.000
 * This is the first line of text.
 *
 * @param content - Raw VTT file content
 * @returns Formatted transcript
 */
export function parseVTT(content: string): FormattedTranscript {
  const segments: TranscriptSegment[] = [];

  // Remove WEBVTT header and any metadata
  const cleanContent = content
    .replace(/^WEBVTT.*$/m, '')
    .replace(/^NOTE.*$/gm, '')
    .replace(/^STYLE[\s\S]*?(?=\n\n)/gm, '')
    .trim();

  const blocks = cleanContent.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.trim());

    if (lines.length < 2) continue;

    // Check if first line is a cue identifier (optional in VTT)
    let timestampLineIndex = 0;
    if (!lines[0].includes('-->')) {
      timestampLineIndex = 1;
    }

    const timestampLine = lines[timestampLineIndex];
    const textLines = lines.slice(timestampLineIndex + 1);

    // Parse timestamp: 00:00:01.000 --> 00:00:04.000
    const timestampMatch = timestampLine.match(
      /(\d{2}:\d{2}:\d{2})[.](\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})[.](\d{3})/
    );

    if (timestampMatch) {
      const startTime = timestampMatch[1];
      const endTime = timestampMatch[3];
      // Remove VTT styling tags like <c>, </c>, <v Speaker>, etc.
      const text = textLines
        .join(' ')
        .replace(/<[^>]+>/g, '')
        .trim();

      if (text) {
        segments.push({ startTime, endTime, text });
      }
    }
  }

  return formatTranscriptOutput(segments);
}

/**
 * Parse plain text transcript
 *
 * Supports formats:
 * - [00:00:01] Text here
 * - 00:00:01 - Text here
 * - Speaker: Text here
 * - Plain paragraphs
 *
 * @param content - Raw text file content
 * @returns Formatted transcript
 */
export function parsePlainText(content: string): FormattedTranscript {
  const segments: TranscriptSegment[] = [];
  const lines = content.split('\n');

  // Try to detect format - timestamps must be at the START of a line
  // to distinguish from times mentioned in content like "Time: 10:00 AM"
  const hasTimestamps = lines.some((line) =>
    /^\s*\[?\d{1,2}:\d{2}(:\d{2})?\]?\s*[-:]/.test(line)
  );

  if (hasTimestamps) {
    // Parse timestamped format
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Match various timestamp formats
      const timestampMatch = trimmedLine.match(
        /^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-:]?\s*(.+)$/
      );

      if (timestampMatch) {
        const startTime = normalizeTimestamp(timestampMatch[1]);
        const text = timestampMatch[2].trim();

        if (text) {
          segments.push({ startTime, text });
        }
      } else if (segments.length > 0) {
        // Append to previous segment if no timestamp
        segments[segments.length - 1].text += ' ' + trimmedLine;
      }
    }
  } else {
    // Plain text without timestamps - create segments by paragraph
    // Normalize line endings first
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const paragraphs = normalizedContent.split(/\n\n+/);
    let currentTime = 0;

    for (const paragraph of paragraphs) {
      const text = paragraph.trim().replace(/\n/g, ' ');
      if (text) {
        const startTime = formatSecondsToTimestamp(currentTime);
        segments.push({ startTime, text });
        // Estimate ~3 seconds per sentence for display purposes
        currentTime += Math.max(3, Math.ceil(text.length / 50) * 3);
      }
    }

    // Fallback: if no segments found, try line-by-line parsing
    if (segments.length === 0) {
      const lines = normalizedContent.split('\n');
      for (const line of lines) {
        const text = line.trim();
        if (text) {
          const startTime = formatSecondsToTimestamp(currentTime);
          segments.push({ startTime, text });
          currentTime += Math.max(3, Math.ceil(text.length / 50) * 3);
        }
      }
    }

    // Last resort: treat entire content as single segment
    if (segments.length === 0 && normalizedContent.trim()) {
      segments.push({ startTime: '00:00:00', text: normalizedContent.trim() });
    }
  }

  return formatTranscriptOutput(segments);
}

/**
 * Normalize timestamp to HH:MM:SS format
 */
function normalizeTimestamp(timestamp: string): string {
  const parts = timestamp.split(':');

  if (parts.length === 2) {
    // MM:SS format
    return `00:${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  }

  return timestamp;
}

/**
 * Format seconds to HH:MM:SS timestamp
 */
function formatSecondsToTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format transcript segments into the output format
 */
function formatTranscriptOutput(
  segments: TranscriptSegment[]
): FormattedTranscript {
  const fullText = segments
    .map((segment) => `[${segment.startTime}] ${segment.text}`)
    .join('\n\n');

  return { segments, fullText };
}

/**
 * Detect file type and parse transcript accordingly
 */
export async function parseTranscriptFile(file: File): Promise<string> {
  const content = await file.text();
  const fileName = file.name.toLowerCase();

  let result: FormattedTranscript;

  if (fileName.endsWith('.srt')) {
    result = parseSRT(content);
  } else if (fileName.endsWith('.vtt')) {
    result = parseVTT(content);
  } else {
    // Default to plain text parsing
    result = parsePlainText(content);
  }

  if (result.segments.length === 0) {
    throw new Error('No transcript content could be parsed from the file');
  }

  return result.fullText;
}

/**
 * Get supported transcript file extensions
 */
export function getSupportedTranscriptExtensions(): string[] {
  return ['.txt', '.srt', '.vtt'];
}

/**
 * Check if a file is a supported transcript file
 */
export function isTranscriptFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return getSupportedTranscriptExtensions().some((ext) =>
    fileName.endsWith(ext)
  );
}
