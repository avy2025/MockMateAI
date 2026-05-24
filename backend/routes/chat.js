const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getResumeSession } = require('../services/resumeSessionStore');
const {
  retrieveRelevantChunks,
  formatResumeContext,
} = require('../utils/resumeContextRetriever');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
  console.warn(
    'WARNING: GEMINI_API_KEY is missing or using placeholder. AI features will be limited.'
  );
}
const genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');

function buildInterviewPrompt({
  interviewType,
  chatHistory,
  message,
  resumeContext,
  isStart,
}) {
  const scoringBlock = `
YOUR TASK:
1. Evaluate the candidate's latest response for:
   - Clarity (how well they explained)
   - Correctness (accuracy of info)
   - Communication (tone/confidence)
   - Depth (technical/professional detail)
2. Decide the score (out of 10).
3. Generate the NEXT question for the interview.
4. INTERVIEW RULES:
   - Ask ONLY ONE question at a time.
   - Keep questions concise.
   - If answer is weak -> ask follow-up to probe deeper.
   - If answer is strong -> increase difficulty or move to the next topic.
   - No long paragraphs or preambles.

OUTPUT FORMAT (Strictly JSON):
{
  "reply": "The next concise interview question",
  "evaluation": {
    "score": number,
    "strengths": ["string"],
    "weaknesses": ["string"],
    "improvements": ["string"]
  }
}

Return ONLY valid JSON.`;

  if (resumeContext) {
    const startGuidance = isStart
      ? `
OPENING QUESTION:
- This is the first question. Start with their strongest project or a key technical skill from the resume.
- Do NOT ask generic questions like "Tell me about yourself" unless the resume lacks detail.`
      : '';

    return `
You are MockMate AI conducting a personalized ${interviewType} interview.

Candidate Resume Context:
${resumeContext}

Rules:
- Ask questions from projects and skills listed in the resume context
- Ask only ONE question at a time
- Ask follow-up questions when answers need more depth
- Keep tone professional
- Avoid generic questions not tied to their background
- Prioritize: projects, technical skills, experience, certifications
- If React (or similar) appears in skills, ask React-specific questions
- Ask project architecture and problem-solving questions from their projects
- Do not invent experience the candidate does not have on their resume
${startGuidance}

CURRENT INTERVIEW CONTEXT:
${chatHistory}

CANDIDATE'S LATEST RESPONSE:
"${message}"
${scoringBlock}`;
  }

  return `
You are an expert ${interviewType} interviewer at a top tech company.

CURRENT INTERVIEW CONTEXT:
${chatHistory}

CANDIDATE'S LATEST RESPONSE:
"${message}"
${scoringBlock}`;
}

router.post('/', async (req, res) => {
  try {
    const { message, history, interviewType, sessionId } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chatHistory = history
      ? history
          .map(
            (h) =>
              `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`
          )
          .join('\n')
      : '';

    let resumeContextBlock = null;
    if (sessionId) {
      const session = getResumeSession(sessionId);
      if (session?.chunks?.length) {
        const relevantChunks = retrieveRelevantChunks(session.chunks, {
          message,
          history,
        });
        resumeContextBlock = formatResumeContext(
          relevantChunks,
          session.insights
        );
      }
    }

    const isStart =
      !history?.length ||
      message === 'Hello, please start the interview.';

    const prompt = buildInterviewPrompt({
      interviewType,
      chatHistory,
      message,
      resumeContext: resumeContextBlock,
      isStart,
    });

    let responseText;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (apiError) {
      console.error('Gemini API Error:', apiError.message);
      responseText = JSON.stringify({
        reply: resumeContextBlock
          ? "I see strong project experience on your resume. Walk me through the architecture of your most significant project and the technical decisions you made."
          : "That's a solid point about React. Can you explain how you manage state in large applications?",
        evaluation: {
          score: 8,
          strengths: ['Clear articulation of experience', 'Technical relevance'],
          weaknesses: ['Could be more specific about project sizes'],
          improvements: [
            'Mention specific state management tools like Redux or Context API',
          ],
        },
      });
    }

    let data;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (e) {
      console.error('JSON Parsing Error:', e, responseText);
      data = {
        reply: resumeContextBlock
          ? 'Can you walk me through a challenging problem you solved on one of your listed projects?'
          : "That's interesting. Can you tell me more about your experience with that?",
        evaluation: {
          score: 7,
          strengths: ['Clear communication'],
          weaknesses: ['Lacked specific details'],
          improvements: ['Try to provide a concrete example (STAR method)'],
        },
      };
    }

    res.json({
      ...data,
      personalized: Boolean(resumeContextBlock),
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
