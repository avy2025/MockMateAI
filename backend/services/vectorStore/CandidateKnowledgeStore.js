const { generateEmbeddings, embedQuery } = require('../resumeEmbeddings');
const { search } = require('./inMemoryVectorStore');

/**
 * Manage candidate knowledge collections for RAG.
 */
class CandidateKnowledgeStore {
  constructor() {
    // In a real app, this would be a database or persistent vector store.
    // For this implementation, we index on demand or per session.
    this.candidatePool = new Map(); // sessionId -> { chunks }
  }

  /**
   * Prepares and indexes candidate data for retrieval.
   * @param {string} sessionId 
   * @param {object} report 
   * @param {Array} chatHistory 
   * @param {object} resumeInsights 
   */
  async indexCandidate(sessionId, report, chatHistory, resumeInsights) {
    if (this.candidatePool.has(sessionId)) return;

    const chunks = [];

    // 1. Resume Chunks
    if (resumeInsights?.summary) {
      chunks.push({ type: 'RESUME_SUMMARY', content: resumeInsights.summary, sessionId });
    }
    if (Array.isArray(resumeInsights?.skills)) {
      chunks.push({ type: 'RESUME_SKILLS', content: resumeInsights.skills.join(', '), sessionId });
    }

    // 2. Transcript Chunks (Grouped by turns)
    if (Array.isArray(chatHistory)) {
      chatHistory.forEach((turn, idx) => {
        chunks.push({ 
          type: 'INTERVIEW_TRANSCRIPT', 
          content: `Q: ${turn.question}\nA: ${turn.answer}`, 
          sessionId,
          metadata: { turnIndex: idx }
        });
      });
    }

    // 3. Evaluation Reports
    if (report?.technicalPerformance) {
      chunks.push({ 
        type: 'TECH_EVAL', 
        content: `Technical Strengths: ${report.technicalPerformance.knowledgeStrengths.join(', ')}. Gaps: ${report.technicalPerformance.knowledgeGaps.join(', ')}. Assessment: ${report.technicalPerformance.problemSolvingAssessment}`,
        sessionId 
      });
    }

    if (report?.roleAssessment) {
      chunks.push({
        type: 'ROLE_READINESS',
        content: `Readiness Score: ${report.roleAssessment.roleReadinessScore}. Gaps: ${report.roleAssessment.skillGapAnalysis.map(g => `${g.skill} (${g.status}): ${g.comment}`).join('; ')}`,
        sessionId
      });
    }

    if (report?.communicationAssessment) {
      chunks.push({
        type: 'COMM_EVAL',
        content: `Response Clarity: ${report.communicationAssessment.responseClarity}. Structure: ${report.communicationAssessment.verbalStructure}. Insights: ${report.communicationAssessment.insights.join('. ')}`,
        sessionId
      });
    }

    // Generate embeddings for all chunks
    const embeddedChunks = await generateEmbeddings(chunks);
    this.candidatePool.set(sessionId, embeddedChunks);
    
    console.log(`Indexed ${embeddedChunks.length} knowledge chunks for candidate ${sessionId}`);
  }

  /**
   * Retrieves relevant chunks across one or more candidates.
   * @param {string[]} sessionIds 
   * @param {string} query 
   * @param {number} topK 
   */
  async retrieve(sessionIds, query, topK = 10) {
    const queryEmbedding = await embedQuery(query);
    if (!queryEmbedding) return [];

    let allChunks = [];
    sessionIds.forEach(id => {
      const chunks = this.candidatePool.get(id);
      if (chunks) allChunks = allChunks.concat(chunks);
    });

    if (allChunks.length === 0) return [];

    const results = search(allChunks, queryEmbedding, { topK });
    return results.map(r => r.chunk);
  }
}

module.exports = new CandidateKnowledgeStore();
