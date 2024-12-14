import axios from 'axios';

export async function uploadInvoice(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post('/api/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.ocrResult;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to process the image');
    }
    throw new Error('An unexpected error occurred');
  }
}