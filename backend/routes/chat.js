const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getResumeSession } = require('../services/resumeSessionStore');
const {
  retrieveRelevantChunks,
  formatResumeContext,
} = require('../utils/resumeContextRetriever');
const { protect } = require('../middleware/auth');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

function buildInterviewPrompt({
  interviewType,
  chatHistory,
  message,
  resumeContext,
  isStart,
  interviewPlan
}) {
  const roleName = interviewPlan?.role || interviewType || 'Professional';
  const focusAreas = interviewPlan?.focusAreas ? interviewPlan.focusAreas.join(', ') : 'general technical skills';
  const difficulty = interviewPlan?.difficulty || 'Intermediate';
  const evaluationCriteria = interviewPlan?.criteria ? interviewPlan.criteria.join(', ') : 'correctness, clarity, and communication';

  const scoringBlock = `
YOUR TASK:
1. Evaluate the candidate's latest response for:
   - Relevance to ${roleName} requirements
   - ${evaluationCriteria}
   - Technical Depth (expecting ${difficulty} level)
2. Decide the score (out of 10).
3. Generate the NEXT question for the interview.
4. INTERVIEW RULES:
   - Ask ONLY ONE question at a time.
   - Keep questions concise.
   - Focus on these areas: ${focusAreas}.
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
- This is the first question of the ${roleName} interview. 
- Target difficulty: ${difficulty}.
- Start with their strongest project or a key technical skill from the resume that matches the role requirements.`
      : '';

    return `
You are MockMate AI conducting a personalized ${roleName} interview at a top tech firm.

Selected Role: ${roleName}
Interview Focus Areas: ${focusAreas}
Expected Difficulty: ${difficulty}

Candidate Resume Context:
${resumeContext}

Rules:
- Ask questions from projects and skills listed in the resume context
- Align questions with ${roleName} expectations
- Ask only ONE question at a time
- Ask follow-up questions when answers need more depth
- Keep tone professional
- Avoid generic questions not tied to their background or the target role
${startGuidance}

CURRENT INTERVIEW CONTEXT:
${chatHistory}

CANDIDATE'S LATEST RESPONSE:
"${message}"
${scoringBlock}`;
  }

  return `
You are an expert ${roleName} interviewer at a top tech company.

Interview Focus Areas: ${focusAreas}
Expected Difficulty: ${difficulty}

CURRENT INTERVIEW CONTEXT:
${chatHistory}

CANDIDATE'S LATEST RESPONSE:
"${message}"
${scoringBlock}`;
}

const InterviewSession = require('../models/InterviewSession');

router.post('/', protect, async (req, res) => {
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

    const isStart =
      !history?.length ||
      message === 'Hello, please start the interview.';

    let resumeContextBlock = null;
    let interviewPlan = null;

    if (sessionId) {
      const session = await getResumeSession(sessionId);
      if (session) {
        interviewPlan = session.interviewPlan;
        if (session.chunks?.length) {
          const relevantChunks = await retrieveRelevantChunks(session.chunks, {
            message,
            history,
            insights: session.insights,
            isStart,
          });
          resumeContextBlock = formatResumeContext(
            relevantChunks,
            session.insights
          );
        }
      }
    }

    const prompt = buildInterviewPrompt({
      interviewType,
      chatHistory,
      message,
      resumeContext: resumeContextBlock,
      isStart,
      interviewPlan
    });

    let isFallbackResponse = false;
    let responseText;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (apiError) {
      console.error('Gemini API Error:', apiError.message);
      isFallbackResponse = true;
      responseText = JSON.stringify({
        reply: resumeContextBlock
          ? "I see strong professional experience on your resume. Walk me through the architecture of your most significant project and the technical decisions you made that align with this role."
          : "That's a solid point. Can you explain how you handle complex technical challenges in this field?",
        evaluation: {
          score: null, // null signals this is a fallback — not a real score
          strengths: [],
          weaknesses: [],
          improvements: [],
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

    // Persist transcript to DB only if session exists and response is not a fallback
    if (sessionId && !isFallbackResponse) {
      try {
        await InterviewSession.findOneAndUpdate(
          { sessionId },
          {
            $push: {
              transcript: [
                { role: 'candidate', content: message },
                { role: 'interviewer', content: data.reply }
              ]
            }
          }
        );
      } catch (dbError) {
        console.error('Transcript logging error:', dbError);
      }
    }

    res.json({
      ...data,
      personalized: Boolean(resumeContextBlock),
      role: interviewPlan?.role || interviewType
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
