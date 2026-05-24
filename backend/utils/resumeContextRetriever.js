const PRIORITY_TYPES = ['project', 'skills', 'experience', 'certifications', 'education'];

const MAX_CONTEXT_CHARS = 6000;

/**
 * Score and select resume chunks relevant to the current interview turn.
 * Prioritizes projects, skills, experience, and certifications.
 * @param {{ type: string, content: string }[]} chunks
 * @param {{ message?: string, history?: { role: string, content: string }[] }} options
 * @returns {{ type: string, content: string }[]}
 */
function retrieveRelevantChunks(chunks, { message = '', history = [] } = {}) {
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

  const selected = [];
  let totalChars = 0;

  for (const { chunk } of scored) {
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
  formatResumeContext,
  getInterviewFocusTags,
};
