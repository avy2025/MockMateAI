const SECTION_HEADERS = [
  {
    type: 'skills',
    patterns: [
      /^(technical\s+)?skills?$/i,
      /^core\s+competenc/i,
      /^technologies$/i,
      /^tools?\s*&\s*technologies$/i,
    ],
  },
  {
    type: 'experience',
    patterns: [
      /^experience$/i,
      /^work\s+experience$/i,
      /^professional\s+experience$/i,
      /^employment(\s+history)?$/i,
      /^relevant\s+experience$/i,
    ],
  },
  {
    type: 'education',
    patterns: [/^education$/i, /^academic(\s+background)?$/i, /^qualifications$/i],
  },
  {
    type: 'project',
    patterns: [
      /^projects?$/i,
      /^key\s+projects?$/i,
      /^selected\s+projects?$/i,
      /^personal\s+projects?$/i,
    ],
  },
  {
    type: 'certifications',
    patterns: [
      /^certifications?$/i,
      /^certificates$/i,
      /^licenses?(?:\s+(&|and)\s+certifications?)?$/i,
      /^licenses$/i,
    ],
  },
];

const BULLET_PREFIX = /^[\s]*(?:[-•*●▪◦]|\d+[.)])\s+/;

/**
 * @param {string} line
 * @returns {string|null}
 */
function matchSectionType(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 80) return null;

  const normalized = trimmed.replace(/[:\s]+$/, '');
  const isHeaderLike =
    normalized === normalized.toUpperCase() ||
    normalized.length < 50;

  if (!isHeaderLike) return null;

  for (const { type, patterns } of SECTION_HEADERS) {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      return type;
    }
  }

  return null;
}

/**
 * Split section body into individual items (bullets or paragraphs).
 * @param {string} body
 * @returns {string[]}
 */
function splitSectionItems(body) {
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const items = [];
  let current = [];

  for (const line of lines) {
    if (BULLET_PREFIX.test(line) && current.length > 0) {
      items.push(current.join(' '));
      current = [line.replace(BULLET_PREFIX, '').trim()];
    } else if (BULLET_PREFIX.test(line)) {
      current = [line.replace(BULLET_PREFIX, '').trim()];
    } else if (current.length === 0) {
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    items.push(current.join(' '));
  }

  if (items.length === 0 && body.trim()) {
    return [body.trim()];
  }

  return items.filter((item) => item.length > 2);
}

/**
 * Split resume text into meaningful typed chunks for semantic RAG retrieval.
 * @param {string} text - Normalized resume text
 * @returns {{ type: string, content: string }[]}
 */
function chunkResumeText(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const lines = text.split('\n');
  const chunks = [];
  let currentType = null;
  let buffer = [];

  const flushSection = () => {
    if (!currentType || buffer.length === 0) return;

    const body = buffer.join('\n').trim();
    if (!body) return;

    const multiItemTypes = ['project', 'experience', 'certifications', 'education'];

    if (multiItemTypes.includes(currentType)) {
      const items = splitSectionItems(body);
      if (items.length > 1) {
        for (const item of items) {
          chunks.push({ type: currentType, content: item });
        }
        return;
      }
    }

    chunks.push({ type: currentType, content: body });
  };

  for (const line of lines) {
    const sectionType = matchSectionType(line);

    if (sectionType) {
      flushSection();
      currentType = sectionType;
      buffer = [];
      continue;
    }

    if (currentType) {
      buffer.push(line);
    }
  }

  flushSection();

  if (chunks.length === 0) {
    chunks.push({ type: 'experience', content: text.trim() });
  }

  return chunks;
}

/**
 * Group chunks by type for API responses.
 * @param {{ type: string, content: string }[]} chunks
 */
function groupChunksByType(chunks) {
  return chunks.reduce((acc, chunk) => {
    const key = chunk.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(chunk.content);
    return acc;
  }, {});
}

module.exports = {
  chunkResumeText,
  groupChunksByType,
};
