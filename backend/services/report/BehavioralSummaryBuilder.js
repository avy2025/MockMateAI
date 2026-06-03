/**
 * Formats raw behavioral metrics into presentable observations.
 */
class BehavioralSummaryBuilder {
  static build(behaviorReport) {
    const {
      eyeContactScore = 0,
      faceVisibilityScore = 0,
      attentionScore = 0,
      headMovementStats = { stable: 0, moderate: 0, high: 0 },
      speakingPace = 'Normal',
      sessionEngagement = 0
    } = behaviorReport;

    return {
      metrics: {
        eyeContact: Math.round(eyeContactScore),
        faceVisibility: Math.round(faceVisibilityScore),
        attention: Math.round(attentionScore),
        engagement: Math.round(sessionEngagement)
      },
      headMovement: {
        stable: Math.round(headMovementStats.stable || 0),
        moderate: Math.round(headMovementStats.moderate || 0),
        high: Math.round(headMovementStats.high || 0)
      },
      speakingPace,
      observations: [
         `Candidate maintained eye contact for ${Math.round(eyeContactScore)}% of the session.`,
         `Face was visible and centered for ${Math.round(faceVisibilityScore)}% of the interview.`,
         `Attention indicators suggest a ${Math.round(attentionScore)}% focus rate.`,
         `Speaking pace was observed as ${speakingPace.toLowerCase()}.`
      ]
    };
  }
}

module.exports = BehavioralSummaryBuilder;
