const { SUPPORTED_ROLES } = require('../utils/roleConfigurations');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = (apiKey && apiKey !== 'YOUR_API_KEY_HERE') ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generates a tailored interview plan based on the role and resume insights.
 */
async function generateInterviewPlan(roleId, resumeInsights) {
  const role = SUPPORTED_ROLES.find(r => r.id === roleId);
  if (!role) {
    throw new Error(`Role ${roleId} not found`);
  }

  // Default plan if AI generation fails or is unavailable
  const fallbackPlan = {
    role: role.name,
    focusAreas: role.focusAreas.slice(0, 4),
    difficulty: 'Intermediate',
    criteria: role.evaluationCriteria
  };

  if (!genAI) return fallbackPlan;

  const prompt = `
    Generate a structured interview blueprint for a candidate applying for the role of ${role.name}.
    
    CANDIDATE RESUME SUMMARY:
    - Top Skills: ${resumeInsights.topSkills.join(', ')}
    - Strongest Project: ${resumeInsights.strongestProject}
    - Resume Focus Areas: ${resumeInsights.focusAreas.join(', ')}
    
    ROLE FOCUS AREAS:
    ${role.focusAreas.join(', ')}
    
    TASK:
    Create a JSON blueprint that selects 4-5 focus areas for the interview. 
    At least 2 should be from the role requirements, and at least 2 should be from the candidate's core strengths (resume).
    Estimate difficulty (Junior, Intermediate, Senior) based on resume experience indicators.
    
    OUTPUT FORMAT (JSON):
    {
      "role": "${role.name}",
      "focusAreas": ["area1", "area2", "area3", "area4"],
      "difficulty": "Junior | Intermediate | Senior",
      "criteria": ["criteria1", "criteria2", "criteria3"]
    }
    
    Return ONLY valid JSON.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    return {
      role: parsed.role || fallbackPlan.role,
      focusAreas: parsed.focusAreas || fallbackPlan.focusAreas,
      difficulty: parsed.difficulty || fallbackPlan.difficulty,
      criteria: parsed.criteria || fallbackPlan.criteria
    };
  } catch (error) {
    console.error('Error generating interview plan:', error);
    return fallbackPlan;
  }
}

module.exports = {
  generateInterviewPlan
};
