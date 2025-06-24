// [R1.3] src/lib/ai.ts: Initializes and exports the Google Generative AI client.
import { GoogleGenerativeAI } from '@google/generative-ai';

// [R4.1] Ensure the API key is handled securely and not exposed client-side.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

export const genAI = new GoogleGenerativeAI(apiKey);
