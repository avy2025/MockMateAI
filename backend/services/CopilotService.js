const { GoogleGenerativeAI } = require('@google/generative-ai');
const knowledgeStore = require('./vectorStore/CandidateKnowledgeStore');
const { getReport } = require('./report/reportStore');

class CopilotService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || 'MOCK_KEY';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: `
        You are the "MockMate AI Recruiter Copilot", a professional executive assistant for recruiters.
        Your goal is to provide evidence-based insights about candidates based on their resumes, interview transcripts, and evaluation reports.

        STRICT GUIDELINES:
        1. Always be evidence-based. Use phrases like "Strong evidence of...", "Limited evidence of...", "Demonstrated during interview...".
        2. Do NOT make final hiring decisions (e.g., "You should hire them"). Instead, say "The candidate is well-positioned for..." or "There are notable gaps in...".
        3. Maintain explainability. If you claim a candidate has a skill, be ready to point to where it was demonstrated.
        4. When comparing candidates, be neutral and focus on specific data points (scores, specific answers).
        5. If information is missing, clearly state "No evidence found in the provided data".
        6. Avoid unsupported or subjective personality claims. Focus on observed behaviors and stated facts.

        TONE:
        Professional, efficient, SaaS-executive style.
      `
    });
  }

  /**
   * Main chat entry point.
   * @param {object} params
   * @param {string[]} params.sessionIds - IDs of candidates to discuss.
   * @param {string} params.query - User message.
   * @param {Array} params.history - Chat history.
   */
  async chat({ sessionIds, query, history }) {
    try {
      // 1. Ensure candidates are indexed
      for (const id of sessionIds) {
        const report = getReport(id);
        if (report && !knowledgeStore.candidatePool.has(id)) {
          // We need original transcript and resumeInsights which are in the report object
          await knowledgeStore.indexCandidate(
            id, 
            report, 
            report.chatHistory || [], 
            report.resumeInsights || { summary: report.resumeSummary, skills: report.skillsDetected }
          );
        }
      }

      // 2. Retrieve relevant context
      const contextChunks = await knowledgeStore.retrieve(sessionIds, query);
      
      // 3. Format context for Gemini
      const formattedContext = contextChunks.map(c => 
        `[Source: ${c.type}][Candidate: ${c.sessionId}]\n${c.content}`
      ).join('\n\n---\n\n');

      // 4. Build prompt
      const prompt = `
        User Query: ${query}

        RELEVANT CONTEXT FROM CANDIDATE DATA:
        ${formattedContext}

        Please answer the user query based ONLY on the provided context and the candidate reports.
      `;

      // 5. Generate response
      const chat = this.model.startChat({
        history: history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        }))
      });

      const result = await chat.sendMessage(prompt);
      return result.response.text();

    } catch (error) {
      console.error('Copilot Service Error:', error);
      throw new Error('Copilot failed to generate a response.');
    }
  }
}

module.exports = new CopilotService();
