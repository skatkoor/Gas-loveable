import { Invoice, InvoiceItem } from '../types';

export function parseOCRResult(ocrText: string): Invoice {
  // Extract account information
  const accountMatch = ocrText.match(/Account:\s*(\d+)/i);
  const invoiceMatch = ocrText.match(/Invoice#:\s*([^\n\s]+)/i);

  // Extract items using a more precise regex pattern
  const itemRegex = /(\d{4,5})\s+(\d+)\s+([A-Z\s]+(?:BUD|MICH|BUSCH|NATURAL|NATTY)[A-Z\s/-]+(?:CAN|LNNR|ALE))\s+\$?(\d+\.\d+)/gm;
  const items: InvoiceItem[] = [];
  let match;

  // Process the text line by line to extract items
  const lines = ocrText.split('\n');
  for (const line of lines) {
    match = itemRegex.exec(line);
    if (match) {
      const [_, code, quantity, description, price] = match;
      items.push({
        code,
        quantity: parseInt(quantity),
        description: description.trim(),
        price: parseFloat(price),
      });
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    accountInfo: {
      accountNumber: accountMatch?.[1] || '22370',
      businessName: 'JUMMA INC.',
      address: '2531 CARSON ST.',
      city: 'HALTON CITY, TX 76117',
      phone: '(817) 831-1841',
    },
    invoiceNumber: invoiceMatch?.[1] || '',
    items,
    subtotal,
    tax: 0,
    total: subtotal,
  };
}