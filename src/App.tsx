import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { OCRResult } from './components/OCRResult';
import { ClipboardList } from 'lucide-react';
import { uploadInvoice } from './utils/api';

function App() {
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await uploadInvoice(file);
      setOcrResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ClipboardList className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gas Station Inventory Management
          </h1>
          <p className="text-gray-600">
            Upload an invoice to extract and process inventory data
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <FileUpload 
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
          />
        </div>

        <OCRResult 
          result={ocrResult}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}

export default App;