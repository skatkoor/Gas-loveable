export interface AccountInfo {
  accountNumber: string;
  businessName: string;
  address: string;
  phone: string;
}

export interface InvoiceInfo {
  invoiceNumber: string;
  tabcNumber: string;
  load: string;
  terms: string;
  driver: string;
  salesRep: string;
}

export interface InvoiceItem {
  code: string;
  quantity: number;
  description: string;
  price: number;
  total: number;
}

export interface TableColumn {
  key: string;
  header: string;
}

export interface Totals {
  subtotal: number;
  tax: number;
  total: number;
}

export interface ParsedInvoice {
  accountInfo: AccountInfo;
  invoiceInfo: InvoiceInfo;
  items: InvoiceItem[];
  columns: TableColumn[];
  totals: Totals;
}