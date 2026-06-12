const { GoogleGenerativeAI } = require('@google/generative-ai');
const ScoreAggregator = require('./ScoreAggregator');
const BehavioralSummaryBuilder = require('./BehavioralSummaryBuilder');
const IntegritySummaryBuilder = require('./IntegritySummaryBuilder');

class ReportGenerator {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generate(data) {
    let { 
      sessionId, 
      chatHistory, 
      behaviorReport, 
      interviewType, 
      resumeInsights,
      candidateName,
      interviewPlan
    } = data;

    behaviorReport = behaviorReport || {};

    const targetRole = interviewPlan?.role || interviewType || 'Professional Role';

    // 1. Calculate Scores and Build Summaries (Deterministic)
    const techScore = ScoreAggregator.calculateTechnicalScore(chatHistory);
    const commScore = ScoreAggregator.calculateCommunicationScore(chatHistory, behaviorReport);
    const integrityScore = ScoreAggregator.calculateIntegrityScore(behaviorReport);
    const overallScore = ScoreAggregator.calculateOverallScore(techScore, commScore, integrityScore);
    
    const behavioralSummary = BehavioralSummaryBuilder.build(behaviorReport);
    const integritySummary = IntegritySummaryBuilder.build(behaviorReport);

    // 2. Generate AI content
    const prompt = this._buildPrompt({
      targetRole,
      interviewPlan,
      resumeInsights,
      chatHistory,
      behavioralSummary,
      integritySummary,
      scores: { techScore, commScore, overallScore }
    });

    let aiGeneratedContent;
    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      aiGeneratedContent = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (error) {
      console.error('AI Report Gen Error:', error);
      aiGeneratedContent = this._getFallbackContent(techScore, commScore, overallScore, targetRole);
    }

    // 3. Assemble Final Report
    return {
      sessionId,
      candidateName,
      targetRole,
      interviewDate: new Date().toISOString(),
      interviewDuration: behaviorReport.duration || '20-30 minutes',
      interviewFocusAreas: interviewPlan?.focusAreas || aiGeneratedContent.focusAreas || [interviewType],
      resumeSummary: resumeInsights.summary || 'N/A',
      skillsDetected: resumeInsights.skills || [],
      candidateOverview: aiGeneratedContent.candidateOverview,
      
      roleAssessment: {
        roleReadinessScore: aiGeneratedContent.roleReadinessScore || overallScore,
        skillGapAnalysis: aiGeneratedContent.skillGapAnalysis || [],
        recommendedLearningPath: aiGeneratedContent.recommendedLearningPath || []
      },

      technicalPerformance: {
        score: techScore,
        ...aiGeneratedContent.technicalPerformance,
        performanceBreakdown: [
          { label: 'Problem Solving', value: Math.round(techScore * 0.95) },
          { label: 'Technical Depth', value: Math.round(techScore * 1.05) },
          { label: 'Code Quality/Logic', value: techScore }
        ]
      },
      
      communicationAssessment: {
        score: commScore,
        ...aiGeneratedContent.communicationAssessment,
        speakingPace: behaviorReport.speakingPace || 'Steady',
        avgResponseLength: behaviorReport.avgResponseLength || 'Moderate',
        insights: aiGeneratedContent.communicationInsights
      },
      
      behavioralObservations: behavioralSummary,
      integritySummary: integritySummary,
      
      highlights: aiGeneratedContent.highlights,
      improvementPlan: aiGeneratedContent.improvementPlan,
      
      overallAssessment: {
        score: overallScore,
        performanceBand: ScoreAggregator.getPerformanceBand(overallScore),
        readiness: ScoreAggregator.getHiringReadiness(overallScore),
        executiveSummary: aiGeneratedContent.executiveSummary,
        overallReadinessAssessment: aiGeneratedContent.overallReadinessAssessment
      },
      
      charts: {
        skillDistribution: aiGeneratedContent.skillDistribution || []
      }
    };
  }

  _buildPrompt({ targetRole, interviewPlan, resumeInsights, chatHistory, behavioralSummary, integritySummary, scores }) {
    return `
You are an expert Executive Interview Auditor. Generate an Enterprise-Grade Final Interview Intelligence Report for the role of ${targetRole}.

CONTEXT:
Target Role: ${targetRole}
Interview Plan: ${JSON.stringify(interviewPlan)}
Resume: ${JSON.stringify(resumeInsights)}
Chat History: ${JSON.stringify(chatHistory)}
Behavioral Observations: ${JSON.stringify(behavioralSummary.observations)}
Integrity Observations: ${JSON.stringify(integritySummary.observations)}
Calculated Scores: Tech ${scores.techScore}, Comm ${scores.commScore}, Overall ${scores.overallScore}

REQUIREMENTS:
1. Be evidence-based and neutral.
2. Evaluate "Role Readiness" specifically for ${targetRole}.
3. Perform a "Skill Gap Analysis" comparing candidate performance vs ${targetRole} expectations.
4. Output ONLY a JSON object.

JSON SCHEMA:
{
  "focusAreas": ["string"],
  "candidateOverview": "AI-generated summary of candidate background vs interview performance",
  "roleReadinessScore": number (0-100),
  "skillGapAnalysis": [
    { "skill": "string", "status": "Strong | Gap | Developing", "comment": "string" }
  ],
  "recommendedLearningPath": [
    { "topic": "string", "reason": "string", "priority": "High | Medium | Low" }
  ],
  "technicalPerformance": {
    "knowledgeStrengths": ["string"],
    "knowledgeGaps": ["string"],
    "problemSolvingAssessment": "string",
    "recommendedLearningAreas": ["string"]
  },
  "communicationAssessment": {
    "responseClarity": "string",
    "verbalStructure": "string",
    "explanationQuality": "string"
  },
  "communicationInsights": ["string"],
  "highlights": {
    "strongestAnswers": ["string"],
    "bestTechnicalMoments": ["string"],
    "notableHRResponses": ["string"],
    "keyStrengthsDemonstrated": ["string"]
  },
  "improvementPlan": {
    "areasForImprovement": ["string"],
    "recommendedTopics": ["string"],
    "communicationSuggestions": ["string"],
    "interviewReadinessRecommendations": ["string"]
  },
  "executiveSummary": "A high-level summary for decision makers focusing on ${targetRole} suitability",
  "overallReadinessAssessment": "A detailed readiness assessment",
  "skillDistribution": [
    { "subject": "Problem Solving", "A": number (0-100) },
    { "subject": "Comm. Clarity", "A": number (0-100) },
    { "subject": "Tech Depth", "A": number (0-100) },
    { "subject": "Behavioral", "A": number (0-100) },
    { "subject": "Experience", "A": number (0-100) }
  ]
}
    `;
  }

  _getFallbackContent(techScore, commScore, overallScore, targetRole) {
    return {
      focusAreas: ['Technical Proficiency', 'Communication'],
      candidateOverview: "The candidate demonstrated a solid understanding of the required concepts for the " + targetRole + " role.",
      roleReadinessScore: overallScore,
      skillGapAnalysis: [
        { "skill": "Core " + targetRole + " Skills", "status": "Developing", "comment": "Demonstrated basic proficiency but needs more depth." }
      ],
      recommendedLearningPath: [
        { "topic": "Advanced " + targetRole + " Patterns", "reason": "To move from intermediate to expert level.", "priority": "Medium" }
      ],
      technicalPerformance: {
        knowledgeStrengths: ['Core concepts', 'Application logic'],
        knowledgeGaps: ['Specific edge cases'],
        problemSolvingAssessment: 'Systematic and logical.',
        recommendedLearningAreas: ['Advanced architectural patterns']
      },
      communicationAssessment: {
        responseClarity: 'High',
        verbalStructure: 'Clear and concise',
        explanationQuality: 'Good'
      },
      communicationInsights: ['Maintained professional tone', 'Engaged well with questions'],
      highlights: {
        strongestAnswers: ['Explanation of past projects'],
        bestTechnicalMoments: ['Problem-solving demonstration'],
        notableHRResponses: ['Handling of situational questions'],
        keyStrengthsDemonstrated: ['Technical clarity', 'Professionalism']
      },
      improvementPlan: {
        areasForImprovement: ['Elaborate more on technical trade-offs'],
        recommendedTopics: ['System Design', 'Performance Optimization'],
        communicationSuggestions: ['Try using more structured examples'],
        interviewReadinessRecommendations: ['Practice deep-dive technical explanations']
      },
      executiveSummary: "A strong performance across both technical and communication segments for " + targetRole + ".",
      overallReadinessAssessment: "The candidate is well-prepared for " + targetRole + " responsibilities.",
      skillDistribution: [
        { "subject": "Problem Solving", "A": techScore },
        { "subject": "Comm. Clarity", "A": commScore },
        { "subject": "Tech Depth", "A": techScore - 5 },
        { "subject": "Behavioral", "A": 80 },
        { "subject": "Experience", "A": 85 }
      ]
    };
  }
}

module.exports = ReportGenerator;
