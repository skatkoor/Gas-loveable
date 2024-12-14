export interface InvoiceItem {
  code: string;
  quantity: number;
  description: string;
  price: number;
}

export interface Invoice {
  id: string;
  date: string;
  accountInfo: {
    accountNumber: string;
    businessName: string;
    address: string;
    city: string;
    phone: string;
  };
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}