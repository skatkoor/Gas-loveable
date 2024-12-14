import axios from 'axios';

export async function parseOCRWithLLM(ocrText) {
  try {
    const response = await axios.post(
      process.env.OCR_API_URL,
      {
        model: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that converts unstructured invoice text into a structured JSON format.',
          },
          {
            role: 'user',
            content: `Parse this OCR text into structured JSON with sections for account info, invoice info, and items:\n\n${ocrText}`,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error parsing OCR with LLM:', error);
    throw new Error('Failed to parse OCR text');
  }
}