import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import winston from 'winston';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Configure LowDB
const adapter = new JSONFile('db.json');
const db = new Low(adapter, { invoices: [] });
await db.read();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG files are allowed'));
    }
  },
});

// OCR endpoint
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract text from this invoice image. Focus on account information, invoice details, and itemized list with quantities and prices.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ];

    logger.info('Sending request to OCR API');
    
    const response = await axios.post(
      process.env.OCR_API_URL,
      {
        model: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.2,
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OCR service');
    }

    const ocrResult = response.data.choices[0].message.content;

    // Store the OCR result in the database
    const invoice = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: ocrResult
    };

    db.data.invoices.push(invoice);
    await db.write();

    res.json({ ocrResult });
  } catch (error) {
    logger.error('OCR Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to process the image',
      error: error.response?.data || error.message,
    });
  }
});

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    await db.read();
    res.json(db.data.invoices);
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});