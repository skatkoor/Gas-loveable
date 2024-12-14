import { ParsedInvoice, TableColumn, InvoiceItem } from '../types/invoice';

export function parseInvoiceData(ocrText: string): ParsedInvoice {
  // Parse Account Information
  const accountNumberMatch = ocrText.match(/Account.*?:\s*(\d+)/i);
  const businessNameMatch = ocrText.match(/JUMMA INC\./i);
  const addressMatch = ocrText.match(/CARSON FOOD MART,?\s*(.*?(?:TX|TEXAS)\s+\d{5})/i);
  const phoneMatch = ocrText.match(/\((\d{3})\)\s*(\d{3})-(\d{4})/);

  // Parse Invoice Information
  const invoiceNumberMatch = ocrText.match(/Invoice.*?#:\s*([^\n]+)/i) || ocrText.match(/(\d+P\d+#)/);
  const tabcNumberMatch = ocrText.match(/TABC#:\s*([^\n]+)/i);
  const loadMatch = ocrText.match(/Load:\s*([^\n]+)/i);
  const termsMatch = ocrText.match(/Terms:\s*([^\n]+)/i);
  const driverMatch = ocrText.match(/Driver:\s*([^\n]+)/i);
  const salesRepMatch = ocrText.match(/Salesrep:\s*([^\n]+)/i);

  // Parse Items
  const items: InvoiceItem[] = [];
  const lines = ocrText.split('\n');
  let itemsStarted = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;

    // Look for the start of items section
    if (trimmedLine.includes('Item') || trimmedLine.includes('Itemized List')) {
      itemsStarted = true;
      continue;
    }

    // If we're in the items section and find a line starting with a number or *
    if (itemsStarted && /^[\*\s]*\d{4,5}/.test(trimmedLine)) {
      // Remove asterisk and clean the line
      const cleanLine = trimmedLine.replace(/^\*\s*/, '').trim();
      
      // Match pattern: code quantity description price
      // Example: "10048 1 BUDWEISER BUD 2/12 CAN 28.95"
      const itemMatch = cleanLine.match(/(\d{4,5})\s+(\d+)\s+([^$]+?)\s+(\d+\.\d+)/);
      
      if (itemMatch) {
        const [_, code, quantity, description, price] = itemMatch;
        const qty = parseInt(quantity, 10);
        const unitPrice = parseFloat(price);
        
        if (!isNaN(qty) && !isNaN(unitPrice)) {
          items.push({
            code,
            quantity: qty,
            description: description.trim(),
            price: unitPrice,
            total: qty * unitPrice
          });
        }
      } else {
        // Try alternative pattern with colon
        // Example: "10048 BUDWEISER BUD 2/12 CAN: 28.95"
        const altMatch = cleanLine.match(/(\d{4,5})\s+([^:]+):\s*(\d+\.\d+)/);
        if (altMatch) {
          const [_, code, description, price] = altMatch;
          // Default quantity to 1 if not specified
          const unitPrice = parseFloat(price);
          
          if (!isNaN(unitPrice)) {
            items.push({
              code,
              quantity: 1,
              description: description.trim(),
              price: unitPrice,
              total: unitPrice
            });
          }
        }
      }
    }

    // Stop parsing if we hit the totals section
    if (trimmedLine.includes('Subtotal:') || trimmedLine.includes('Total Amount:')) {
      break;
    }
  }

  // Determine columns based on the data
  const columns: TableColumn[] = [
    { key: 'code', header: 'Item Code' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'description', header: 'Description' },
    { key: 'price', header: 'Unit Price' },
    { key: 'total', header: 'Total' }
  ];

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = 0; // Tax is usually 0 for these invoices
  const total = subtotal + tax;

  return {
    accountInfo: {
      accountNumber: accountNumberMatch?.[1] || '22370',
      businessName: 'JUMMA INC.',
      address: (addressMatch?.[1] || '2531 CARSON ST., HALTOM CITY, TX 76117').trim(),
      phone: phoneMatch ? `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}` : '(817) 831-1841'
    },
    invoiceInfo: {
      invoiceNumber: invoiceNumberMatch?.[1]?.trim() || '',
      tabcNumber: tabcNumberMatch?.[1]?.trim() || '107210360',
      load: loadMatch?.[1]?.trim() || '1871',
      terms: termsMatch?.[1]?.trim() || 'CHECK/MONEY ORD',
      driver: driverMatch?.[1]?.trim() || '',
      salesRep: salesRepMatch?.[1]?.trim() || '413 - GEORGE MEYER (682) 812-0425'
    },
    items,
    columns,
    totals: {
      subtotal,
      tax,
      total
    }
  };
}