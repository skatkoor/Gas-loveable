import React from 'react';
import { parseInvoiceData } from '../utils/parseInvoiceData';
import { ParsedInvoice } from '../types/invoice';

interface OCRResultProps {
  result: string | null;
  isLoading: boolean;
  error: string | null;
}

export function OCRResult({ result, isLoading, error }: OCRResultProps) {
  if (isLoading) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { accountInfo, invoiceInfo, items, columns, totals } = parseInvoiceData(result);

  if (items.length === 0) {
    return (
      <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">No items found in the invoice. Please check the image quality and try again.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Account Number</p>
            <p className="font-medium">{accountInfo.accountNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Business Name</p>
            <p className="font-medium">{accountInfo.businessName}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium">{accountInfo.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{accountInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Invoice Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Invoice Number</p>
            <p className="font-medium">{invoiceInfo.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">TABC#</p>
            <p className="font-medium">{invoiceInfo.tabcNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Load</p>
            <p className="font-medium">{invoiceInfo.load}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Terms</p>
            <p className="font-medium">{invoiceInfo.terms}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Sales Representative</p>
            <p className="font-medium">{invoiceInfo.salesRep}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-lg font-semibold p-6 pb-4">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">Subtotal</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${totals.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">Tax</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${totals.tax.toFixed(2)}</td>
              </tr>
              <tr className="bg-gray-100">
                <td colSpan={4} className="px-6 py-4 text-sm font-bold text-gray-900 text-right">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">${totals.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}