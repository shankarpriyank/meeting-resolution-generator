/**
 * PDF Document Styles
 * CSS styles for generating resolution PDF documents
 */

export const PDF_STYLES = `
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
`;

/**
 * Generate a complete HTML document for PDF rendering
 */
export function generatePDFDocument(html: string, title?: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title || 'Resolution Document'}</title>
            <style>${PDF_STYLES}</style>
        </head>
        <body>
            ${html}
        </body>
        </html>
    `;
}

/**
 * Default PDF options for resolution documents
 */
export const DEFAULT_PDF_OPTIONS = {
    format: 'A4' as const,
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
};
