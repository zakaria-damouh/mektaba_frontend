export function printElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} introuvable`);
    return;
  }

  // 1. Remove any previous print iframe
  const existingIframe = document.getElementById('print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  // 2. Create the hidden iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '80mm';
  iframe.style.height = 'auto';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // 3. Clone styles from the main page
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  // 4. Write receipt content with explicit visibility
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Ticket</title>
        ${styles}
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          /* Force everything inside the print iframe to be VISIBLE */
          *, *::before, *::after {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', Courier, monospace !important;
            display: block !important;
            visibility: visible !important;
          }
          .receipt-page-break {
            page-break-after: always;
            break-after: page;
          }
        </style>
      </head>
      <body>
        <div>
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // 5. Allow HTML to render, then print and remove iframe
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Erreur impression:', e);
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 1500);
    }
  }, 250);
}