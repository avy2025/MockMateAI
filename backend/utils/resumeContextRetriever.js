const vectorStore = require('../services/vectorStore');
const { embedQuery } = require('../services/resumeEmbeddings');

const PRIORITY_TYPES = [
  'project',
  'skills',
  'experience',
  'certifications',
  'education',
];

const MAX_CONTEXT_CHARS = 6000;
const SEMANTIC_TOP_K = 12;

/**
 * Keyword + section-priority fallback when embeddings are unavailable.
 * @param {{ type: string, content: string }[]} chunks
 * @param {{ message?: string, history?: { role: string, content: string }[] }} options
 */
function retrieveRelevantChunksKeyword(chunks, { message = '', history = [] } = {}) {
  if (!chunks || chunks.length === 0) return [];

  const conversationText = [message, ...(history || []).map((h) => h.content)]
    .join(' ')
    .toLowerCase();

  const conversationWords = conversationText
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const scored = chunks.map((chunk) => {
    const typeIndex = PRIORITY_TYPES.indexOf(chunk.type);
    let score = typeIndex === -1 ? PRIORITY_TYPES.length : typeIndex;

    const contentLower = chunk.content.toLowerCase();
    for (const word of conversationWords) {
      if (contentLower.includes(word)) {
        score -= 0.5;
      }
    }

    return { chunk, score };
  });

  scored.sort((a, b) => a.score - b.score);
  return selectChunksWithinCharBudget(scored.map((s) => s.chunk));
}

/**
 * @param {{ type: string, content: string }[]} chunks
 */
function selectChunksWithinCharBudget(chunks) {
  const selected = [];
  let totalChars = 0;

  for (const chunk of chunks) {
    const section = `[${chunk.type.toUpperCase()}]\n${chunk.content}\n`;
    if (totalChars + section.length > MAX_CONTEXT_CHARS && selected.length > 0) {
      break;
    }
    selected.push(chunk);
    totalChars += section.length;
  }

  return selected;
}

/**
 * Build text to embed for the current interview turn.
 */
function buildRetrievalQuery({
  message = '',
  history = [],
  insights,
  isStart = false,
} = {}) {
  if (isStart && insights) {
    const parts = [
      insights.strongestProject,
      ...(insights.topSkills || []),
      ...(insights.focusAreas || []),
    ].filter(Boolean);
    if (parts.length) return parts.join('. ');
  }

  const recent = (history || []).slice(-4).map((h) => h.content);
  return [message, ...recent].filter(Boolean).join('\n');
}

/**
 * Semantic retrieval: embed the query, search chunk vectors, trim to context budget.
 * Falls back to keyword scoring when embeddings are missing.
 *
 * @param {{ type: string, content: string, embedding?: number[] }[]} chunks
 * @param {{
 *   message?: string,
 *   history?: { role: string, content: string }[],
 *   insights?: object,
 *   isStart?: boolean,
 * }} options
 * @returns {Promise<{ type: string, content: string }[]>}
 */
async function retrieveRelevantChunks(chunks, options = {}) {
  if (!chunks?.length) return [];

  const hasEmbeddings = chunks.some(
    (c) => Array.isArray(c.embedding) && c.embedding.length > 0
  );

  if (!hasEmbeddings) {
    return retrieveRelevantChunksKeyword(chunks, options);
  }

  const queryText = buildRetrievalQuery(options);
  const queryEmbedding = await embedQuery(queryText);

  if (!queryEmbedding) {
    return retrieveRelevantChunksKeyword(chunks, options);
  }

  const hits = vectorStore.search(chunks, queryEmbedding, {
    topK: SEMANTIC_TOP_K,
  });

  if (!hits.length) {
    return retrieveRelevantChunksKeyword(chunks, options);
  }

  const ranked = hits.map((h) => h.chunk);
  return selectChunksWithinCharBudget(ranked);
}

/**
 * Format selected chunks and insights into prompt-ready resume context.
 * @param {{ type: string, content: string }[]} chunks
 * @param {object} [insights]
 */
function formatResumeContext(chunks, insights) {
  const parts = [];

  if (insights) {
    if (insights.topSkills?.length) {
      parts.push(`KEY SKILLS: ${insights.topSkills.join(', ')}`);
    }
    if (insights.strongestProject) {
      parts.push(`STRONGEST PROJECT: ${insights.strongestProject}`);
    }
    if (insights.focusAreas?.length) {
      parts.push(`INTERVIEW FOCUS AREAS: ${insights.focusAreas.join(', ')}`);
    }
  }

  const grouped = {};
  for (const chunk of chunks) {
    if (!grouped[chunk.type]) grouped[chunk.type] = [];
    grouped[chunk.type].push(chunk.content);
  }

  for (const type of PRIORITY_TYPES) {
    if (!grouped[type]) continue;
    parts.push(`\n=== ${type.toUpperCase()} ===`);
    grouped[type].forEach((content, i) => {
      parts.push(`${i + 1}. ${content}`);
    });
  }

  return parts.join('\n').trim();
}

/**
 * Build display tags for the interview UI from resume insights.
 * @param {object} [insights]
 */
function getInterviewFocusTags(insights) {
  if (!insights) return [];

  const tags = [];
  if (Array.isArray(insights.topSkills)) {
    tags.push(...insights.topSkills.slice(0, 6));
  }
  if (Array.isArray(insights.focusAreas)) {
    tags.push(...insights.focusAreas.slice(0, 3));
  }

  return [...new Set(tags.map((t) => t.trim()).filter(Boolean))].slice(0, 8);
}

module.exports = {
  retrieveRelevantChunks,
  retrieveRelevantChunksKeyword,
  formatResumeContext,
  getInterviewFocusTags,
  buildRetrievalQuery,
};
