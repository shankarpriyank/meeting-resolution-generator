import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { 
    checkRateLimit, 
    getClientIdentifier, 
    createRateLimitHeaders,
    RATE_LIMIT_TIERS 
} from '@/lib/rate-limiter';

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
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title || 'Resolution Document'}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 12pt;
                        line-height: 1.6;
                        color: #000;
                        background: #fff;
                        padding: 40px 60px;
                    }
                    
                    .resolution-document {
                        max-width: 100%;
                    }
                    
                    h1 {
                        font-size: 18pt;
                        font-weight: bold;
                        text-align: center;
                        margin-bottom: 10px;
                    }
                    
                    h2 {
                        font-size: 14pt;
                        font-weight: bold;
                        margin-top: 20px;
                        margin-bottom: 10px;
                    }
                    
                    h3 {
                        font-size: 12pt;
                        font-weight: bold;
                        margin-top: 15px;
                        margin-bottom: 8px;
                    }
                    
                    p {
                        margin-bottom: 10px;
                        text-align: justify;
                    }
                    
                    .text-center {
                        text-align: center;
                    }
                    
                    .text-lg {
                        font-size: 14pt;
                    }
                    
                    .text-sm {
                        font-size: 10pt;
                    }
                    
                    .text-2xl {
                        font-size: 18pt;
                    }
                    
                    .font-bold {
                        font-weight: bold;
                    }
                    
                    .font-semibold {
                        font-weight: 600;
                    }
                    
                    .mb-1 { margin-bottom: 4px; }
                    .mb-2 { margin-bottom: 8px; }
                    .mb-4 { margin-bottom: 16px; }
                    .mb-6 { margin-bottom: 24px; }
                    .mb-8 { margin-bottom: 32px; }
                    .mt-2 { margin-top: 8px; }
                    .mt-12 { margin-top: 48px; }
                    .ml-4 { margin-left: 16px; }
                    .py-2 { padding-top: 8px; padding-bottom: 8px; }
                    .py-4 { padding-top: 16px; padding-bottom: 16px; }
                    .pt-2 { padding-top: 8px; }
                    .pt-6 { padding-top: 24px; }
                    
                    .border-t {
                        border-top: 1px solid #333;
                    }
                    
                    .border-b {
                        border-bottom: 1px solid #333;
                    }
                    
                    .border-gray-700 {
                        border-color: #444;
                    }
                    
                    .border-gray-800 {
                        border-color: #333;
                    }
                    
                    .border-gray-600 {
                        border-color: #555;
                    }
                    
                    .text-gray-400 {
                        color: #666;
                    }
                    
                    .grid {
                        display: grid;
                    }
                    
                    .grid-cols-2 {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .gap-4 {
                        gap: 16px;
                    }
                    
                    .gap-8 {
                        gap: 32px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    
                    th, td {
                        border: 1px solid #333;
                        padding: 8px 12px;
                        text-align: left;
                    }
                    
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    
                    tr:nth-child(even) {
                        background-color: #fafafa;
                    }
                    
                    ul, ol {
                        margin-left: 20px;
                        margin-bottom: 10px;
                    }
                    
                    li {
                        margin-bottom: 5px;
                    }
                    
                    blockquote {
                        border-left: 3px solid #333;
                        padding-left: 15px;
                        margin: 15px 0;
                        font-style: italic;
                    }
                    
                    code {
                        font-family: 'Courier New', Courier, monospace;
                        background-color: #f0f0f0;
                        padding: 2px 5px;
                        font-size: 10pt;
                    }
                    
                    pre {
                        background-color: #f0f0f0;
                        padding: 15px;
                        overflow-x: auto;
                        margin: 15px 0;
                    }
                    
                    hr {
                        border: none;
                        border-top: 1px solid #333;
                        margin: 20px 0;
                    }
                    
                    strong, b {
                        font-weight: bold;
                    }
                    
                    em, i {
                        font-style: italic;
                    }
                    
                    u {
                        text-decoration: underline;
                    }
                    
                    s, strike {
                        text-decoration: line-through;
                    }
                    
                    /* Page break utilities */
                    .page-break {
                        page-break-after: always;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;

        // Configure Chromium for serverless environment
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Launch Puppeteer with appropriate configuration
        const browser = await puppeteer.launch({
            args: isProduction 
                ? [
                    ...chromium.args,
                    '--disable-gpu',
                    '--single-process',
                    '--no-zygote',
                  ] 
                : ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: isProduction 
                ? await chromium.executablePath() 
                : process.platform === 'win32'
                    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                    : process.platform === 'darwin'
                        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
                        : '/usr/bin/google-chrome',
            headless: true,
        });

        const page = await browser.newPage();

        // Set content
        await page.setContent(fullHtml, {
            waitUntil: 'networkidle0',
        });

        // Generate PDF with selectable text
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm',
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
                    <span class="pageNumber"></span> / <span class="totalPages"></span>
                </div>
            `,
        });

        await browser.close();

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
