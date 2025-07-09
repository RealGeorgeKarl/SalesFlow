import html2canvas from 'html2canvas';

export const printElement = (element: HTMLElement, title: string = 'Receipt'): void => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Unable to open print window. Please check your popup blocker.');
    return;
  }

  // Clone the element content
  const clonedContent = element.cloneNode(true) as HTMLElement;
  
  // Create the print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #000;
          }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .space-y-3 > * + * { margin-top: 0.75rem; }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-6 { gap: 1.5rem; }
          .gap-4 { gap: 1rem; }
          .p-6 { padding: 1.5rem; }
          .p-4 { padding: 1rem; }
          .p-3 { padding: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-lg { font-size: 1.125rem; }
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .border { border: 1px solid #e5e7eb; }
          .border-t { border-top: 1px solid #e5e7eb; }
          .rounded-lg { border-radius: 0.5rem; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-white { background-color: #ffffff; }
          .text-gray-900 { color: #111827; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          .text-green-600 { color: #059669; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .space-x-2 > * + * { margin-left: 0.5rem; }
          .space-x-3 > * + * { margin-left: 0.75rem; }
          .pt-3 { padding-top: 0.75rem; }
          .pt-4 { padding-top: 1rem; }
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${clonedContent.outerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const generateImageFromElement = async (element: HTMLElement, filename: string = 'receipt'): Promise<void> => {
  try {
    // Create a temporary container with the element content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '20px';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    
    // Clone the element content
    const clonedContent = element.cloneNode(true) as HTMLElement;
    tempContainer.appendChild(clonedContent);
    document.body.appendChild(tempContainer);

    // Generate the image
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    // Remove the temporary container
    document.body.removeChild(tempContainer);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}-${new Date().toISOString().split('T')[0]}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Failed to generate image. Please try again.');
  }
};