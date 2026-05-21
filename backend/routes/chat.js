const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
  console.warn("WARNING: GEMINI_API_KEY is missing or using placeholder. AI features will be limited.");
}
const genAI = new GoogleGenerativeAI(apiKey || "MOCK_KEY");

router.post('/', async (req, res) => {
  try {
    const { message, history, interviewType } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt for Gemini
    const chatHistory = history ? history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`).join('\n') : "";
    
    const prompt = `
      You are an expert ${interviewType} interviewer at a top tech company.
      
      CURRENT INTERVIEW CONTEXT:
      ${chatHistory}
      
      CANDIDATE'S LATEST RESPONSE:
      "${message}"
      
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
         - If answer is strong -> increase difficulty or move to next topic.
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
      
      Return ONLY valid JSON.
    `;

    let responseText;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (apiError) {
      console.error("Gemini API Error:", apiError.message);
      // Mock response for UI testing if API fails
      responseText = JSON.stringify({
        "reply": "That's a solid point about React. Can you explain how you manage state in large applications?",
        "evaluation": {
          "score": 8,
          "strengths": ["Clear articulation of experience", "Technical relevance"],
          "weaknesses": ["Could be more specific about project sizes"],
          "improvements": ["Mention specific state management tools like Redux or Context API"]
        }
      });
    }
    
    // Fallback parsing for Gemini's response
    let data;
    try {
      // Find the first { and last } to extract JSON if there's markdown wrapping
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (e) {
      console.error("JSON Parsing Error:", e, responseText);
      data = {
        reply: "That's interesting. Can you tell me more about your experience with that?",
        evaluation: {
          score: 7,
          strengths: ["Clear communication"],
          weaknesses: ["Lacked specific details"],
          improvements: ["Try to provide a concrete example (STAR method)"]
        }
      };
    }

    res.json(data);
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
