// [R1.3] [R-QW2+C3] src/lib/ai.ts: Initializes and exports AI clients.
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables.');
}
export const openai = new OpenAI({ apiKey: openaiKey });

const anthropicKey = process.env.ANTHROPIC_API_KEY;
if (!anthropicKey) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables.');
}
export const anthropic = new Anthropic({ apiKey: anthropicKey });
