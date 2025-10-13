// [R1.3] [R-QW2+C3] src/lib/ai.ts: Initializes and exports the OpenAI client for GPT-5.
import OpenAI from 'openai';

// [R4.1] Ensure the API key is handled securely and not exposed client-side.
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables.');
}

export const openai = new OpenAI({ apiKey });
