// Embedding generation utilities for semantic search
// Uses OpenAI text-embedding-3-small model (1536 dimensions)

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate embedding vector for text
 * @param text - Text to generate embedding for
 * @returns Float array of 1536 dimensions
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim(),
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embedding for project description
 * Combines title + description for better context
 */
export async function generateProjectEmbedding(
  projectTitle: string,
  projectDescription: string
): Promise<number[]> {
  const combinedText = `${projectTitle}\n\n${projectDescription}`;
  return generateEmbedding(combinedText);
}

/**
 * Generate embedding for vendor skills/services
 * Combines service categories + skills for comprehensive matching
 */
export async function generateVendorEmbedding(
  serviceCategories: string[],
  skills: string
): Promise<number[]> {
  const categoriesText = serviceCategories.join(', ');
  const combinedText = `Services: ${categoriesText}\n\nSkills: ${skills}`;
  return generateEmbedding(combinedText);
}

/**
 * Batch generate embeddings with rate limiting
 * @param texts - Array of texts to embed
 * @param delayMs - Delay between requests (default 100ms)
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  delayMs: number = 100
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    try {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
      
      // Rate limiting delay
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Failed to generate embedding for text: ${text.substring(0, 50)}...`, error);
      // Push null or empty array on error
      embeddings.push(new Array(EMBEDDING_DIMENSIONS).fill(0));
    }
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two embeddings
 * @returns Similarity score between 0 and 1 (1 = identical)
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have same dimensions');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Format embedding for PostgreSQL vector storage
 * @param embedding - Float array
 * @returns String representation for pgvector
 */
export function formatEmbeddingForDB(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}
