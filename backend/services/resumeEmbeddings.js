const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const hasGemini =
  Boolean(apiKey) && apiKey !== 'YOUR_API_KEY_HERE' && apiKey !== 'MOCK_KEY';

const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const BATCH_SIZE = 16;
const MAX_EMBED_CHARS = 8000;

const genAI = hasGemini ? new GoogleGenerativeAI(apiKey) : null;

function getEmbeddingModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
}

/**
 * @param {string} text
 * @param {string} taskType
 * @param {string} [title]
 */
function buildEmbedRequest(text, taskType, title) {
  const request = {
    content: { role: 'user', parts: [{ text: text.slice(0, MAX_EMBED_CHARS) }] },
    taskType,
  };
  if (title) request.title = title;
  return request;
}

/**
 * @param {string} text
 * @param {'RETRIEVAL_DOCUMENT'|'RETRIEVAL_QUERY'} taskType
 * @param {string} [title]
 * @returns {Promise<number[]|null>}
 */
async function embedText(text, taskType = 'RETRIEVAL_DOCUMENT', title) {
  const model = getEmbeddingModel();
  if (!model || !text?.trim()) return null;

  try {
    const result = await model.embedContent(
      buildEmbedRequest(text, taskType, title)
    );
    return result.embedding?.values || null;
  } catch (error) {
    console.error('Embedding error:', error.message);
    return null;
  }
}

/**
 * Embed a single resume chunk for storage / retrieval.
 * @param {{ type: string, content: string }} chunk
 * @returns {Promise<number[]|null>}
 */
async function embedChunk(chunk) {
  const text = `[${chunk.type}] ${chunk.content}`;
  return embedText(text, 'RETRIEVAL_DOCUMENT', chunk.type);
}

/**
 * Embed interview turn text for semantic retrieval.
 * @param {string} queryText
 * @returns {Promise<number[]|null>}
 */
async function embedQuery(queryText) {
  return embedText(queryText, 'RETRIEVAL_QUERY');
}

/**
 * Attach embedding vectors to resume chunks (batch when possible).
 * @param {{ type: string, content: string }[]} chunks
 * @returns {Promise<{ type: string, content: string, embedding?: number[] }[]>}
 */
async function generateEmbeddings(chunks) {
  if (!chunks?.length) return [];
  if (!hasGemini) {
    console.warn(
      'Resume embeddings skipped: GEMINI_API_KEY not configured. Using keyword retrieval fallback.'
    );
    return chunks.map((c) => ({ ...c }));
  }

  const model = getEmbeddingModel();
  if (!model) return chunks.map((c) => ({ ...c }));

  const embedded = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    try {
      const requests = batch.map((chunk) =>
        buildEmbedRequest(
          `[${chunk.type}] ${chunk.content}`,
          'RETRIEVAL_DOCUMENT',
          chunk.type
        )
      );
      const result = await model.batchEmbedContents({ requests });

      batch.forEach((chunk, idx) => {
        embedded.push({
          ...chunk,
          embedding: result.embeddings[idx]?.values || undefined,
        });
      });
    } catch (batchError) {
      console.warn(
        'Batch embed failed, falling back to per-chunk:',
        batchError.message
      );
      for (const chunk of batch) {
        const embedding = await embedChunk(chunk);
        embedded.push({ ...chunk, embedding: embedding || undefined });
      }
    }
  }

  const withVectors = embedded.filter((c) => c.embedding?.length).length;
  if (withVectors === 0) {
    console.warn('No chunk embeddings were produced.');
  } else {
    console.log(
      `Resume RAG: embedded ${withVectors}/${chunks.length} chunks (${EMBEDDING_MODEL}).`
    );
  }

  return embedded;
}

/**
 * Omit vectors from API payloads (keep them server-side in session only).
 * @param {{ embedding?: number[] }[]} chunks
 */
function stripEmbeddingsFromChunks(chunks) {
  if (!chunks) return [];
  return chunks.map(({ type, content }) => ({ type, content }));
}

module.exports = {
  generateEmbeddings,
  embedQuery,
  embedChunk,
  stripEmbeddingsFromChunks,
  hasGeminiEmbeddings: hasGemini,
};
