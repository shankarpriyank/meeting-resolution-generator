import { NextRequest, NextResponse } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import {
    checkRateLimit,
    getClientIdentifier,
    createRateLimitHeaders,
    RATE_LIMIT_TIERS
} from '@/lib/rate-limiter';
import { generatePDFDocument, DEFAULT_PDF_OPTIONS } from '@/lib/pdf/styles';

export const dynamic = 'force-dynamic';

// Remote Chromium executable for Vercel serverless
const remoteExecutablePath =
    'https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar';

// Browser instance cache
let browser: Awaited<ReturnType<typeof puppeteerCore.launch>> | null = null;

async function getBrowser() {
    if (browser) return browser;

    if (process.env.VERCEL) {
        browser = await puppeteerCore.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(remoteExecutablePath),
            headless: true,
        });
    } else {
        // Local development - use local Chrome
        browser = await puppeteerCore.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath:
                process.platform === 'win32'
                    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                    : process.platform === 'darwin'
                        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
                        : '/usr/bin/google-chrome',
            headless: true,
        });
    }
    return browser;
}

export async function POST(request: NextRequest) {
    const clientIp = getClientIdentifier(request);
    
    // Apply standard rate limiting for PDF generation
    const rateLimitResult = checkRateLimit(
        clientIp, 
        'generate-pdf', 
        RATE_LIMIT_TIERS.STANDARD
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

    try {
        const { html, title } = await request.json();

        if (!html) {
            return NextResponse.json(
                { error: 'HTML content is required' },
                { status: 400 }
            );
        }

        // Create a full HTML document with styles
        const fullHtml = generatePDFDocument(html, title);

        // Get browser instance
        const browser = await getBrowser();
        const page = await browser.newPage();

        // Set content
        await page.setContent(fullHtml, {
            waitUntil: 'networkidle0',
        });

        // Generate PDF with selectable text
        const pdfBuffer = await page.pdf(DEFAULT_PDF_OPTIONS);

        await page.close();

        // Return PDF as response with rate limit headers
        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${title || 'resolution'}.pdf"`,
                ...rateLimitHeaders,
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
