const { GoogleGenerativeAI } = require('@google/generative-ai');
const { groupChunksByType } = require('../utils/resumeChunker');

const apiKey = process.env.GEMINI_API_KEY;
const hasGemini =
  Boolean(apiKey) && apiKey !== 'YOUR_API_KEY_HERE' && apiKey !== 'MOCK_KEY';

const genAI = hasGemini ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Heuristic insights when Gemini is unavailable.
 * @param {{ type: string, content: string }[]} chunks
 */
function buildHeuristicInsights(chunks) {
  const grouped = groupChunksByType(chunks);
  const skillsText = (grouped.skills || []).join(' ');
  const topSkills = skillsText
    .split(/[,;|•\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 60)
    .slice(0, 8);

  const projects = grouped.project || [];
  const strongestProject =
    projects.sort((a, b) => b.length - a.length)[0] || null;

  const focusAreas = [];
  if (grouped.experience?.length) focusAreas.push('Work experience & impact');
  if (projects.length) focusAreas.push('Projects & hands-on builds');
  if (grouped.skills?.length) focusAreas.push('Technical skills depth');
  if (grouped.education?.length) focusAreas.push('Education & fundamentals');
  if (grouped.certifications?.length) focusAreas.push('Certifications & credentials');

  if (focusAreas.length === 0) {
    focusAreas.push('General background & communication');
  }

  return {
    topSkills,
    strongestProject,
    focusAreas: focusAreas.slice(0, 5),
    source: 'heuristic',
  };
}

/**
 * @param {string} responseText
 */
function parseJsonFromModel(responseText) {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
}

/**
 * Optional Gemini extraction for interview focus.
 * @param {string} extractedText
 * @param {{ type: string, content: string }[]} chunks
 */
async function generateResumeInsights(extractedText, chunks) {
  const fallback = buildHeuristicInsights(chunks);

  if (!hasGemini || !genAI) {
    return fallback;
  }

  const grouped = groupChunksByType(chunks);
  const summaryForModel = Object.entries(grouped)
    .map(([type, items]) => `${type.toUpperCase()}:\n${items.join('\n---\n')}`)
    .join('\n\n');

  const prompt = `
You are preparing structured interview context from a resume.

RESUME SECTIONS:
${summaryForModel}

FULL TEXT (truncated):
${extractedText.slice(0, 4000)}

Return ONLY valid JSON:
{
  "topSkills": ["skill1", "skill2"],
  "strongestProject": "one sentence describing the best project",
  "focusAreas": ["area1", "area2", "area3"]
}

Rules:
- topSkills: 5-8 most relevant technical/professional skills
- strongestProject: single best project for deep interview questions
- focusAreas: 3-5 likely interview themes based on the resume
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const parsed = parseJsonFromModel(result.response.text());

    return {
      topSkills: Array.isArray(parsed.topSkills)
        ? parsed.topSkills.slice(0, 10)
        : fallback.topSkills,
      strongestProject:
        typeof parsed.strongestProject === 'string'
          ? parsed.strongestProject
          : fallback.strongestProject,
      focusAreas: Array.isArray(parsed.focusAreas)
        ? parsed.focusAreas.slice(0, 6)
        : fallback.focusAreas,
      source: 'gemini',
    };
  } catch (error) {
    console.error('Resume insights (Gemini) error:', error.message);
    return { ...fallback, source: 'heuristic-fallback' };
  }
}

module.exports = {
  generateResumeInsights,
  buildHeuristicInsights,
};
