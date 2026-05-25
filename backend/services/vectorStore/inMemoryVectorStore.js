const { cosineSimilarity } = require('../../utils/vectorMath');

/**
 * In-memory similarity search over resume chunk embeddings.
 * Swap this module for a Pinecone-backed store with the same search() signature.
 *
 * @param {{ type: string, content: string, embedding?: number[] }[]} chunks
 * @param {number[]} queryEmbedding
 * @param {{ topK?: number, minScore?: number }} [options]
 * @returns {{ chunk: object, score: number }[]}
 */
function search(chunks, queryEmbedding, { topK = 8, minScore = 0 } = {}) {
  if (!queryEmbedding?.length || !chunks?.length) return [];

  const scored = [];

  for (const chunk of chunks) {
    if (!Array.isArray(chunk.embedding) || chunk.embedding.length === 0) {
      continue;
    }
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    if (score >= minScore) {
      scored.push({ chunk, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

module.exports = {
  search,
};
