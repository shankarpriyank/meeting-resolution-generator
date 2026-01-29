/**
 * Centralized formatting utility functions
 *
 * These functions are used across the application for consistent
 * formatting of timestamps and durations.
 */

/**
 * Formats a number of seconds into a timestamp string (HH:MM:SS)
 *
 * @param seconds - The number of seconds to format
 * @returns A formatted timestamp string in HH:MM:SS format
 *
 * @example
 * formatTimestamp(3661) // Returns "01:01:01"
 * formatTimestamp(65) // Returns "00:01:05"
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats a number of seconds into a human-readable duration string
 *
 * @param seconds - The number of seconds to format (optional)
 * @returns A formatted duration string (e.g., "1h 30m 45s")
 *
 * @example
 * formatDuration(3661) // Returns "1h 1m 1s"
 * formatDuration(65) // Returns "1m 5s"
 * formatDuration(0) // Returns "0m"
 * formatDuration(undefined) // Returns "0m"
 */
export function formatDuration(seconds?: number): string {
  if (!seconds || seconds === 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0m';
}
