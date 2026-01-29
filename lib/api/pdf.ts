export interface GeneratePdfPayload {
  html: string;
  title: string;
}

/**
 * Generate a PDF from HTML content
 */
export async function generatePdf(payload: GeneratePdfPayload): Promise<Blob> {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Failed to generate PDF';
    try {
      const error = await response.json();
      if (error?.error) message = error.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return await response.blob();
}
