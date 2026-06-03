/**
 * Aggregates scores from various interview segments.
 */
class ScoreAggregator {
  static calculateTechnicalScore(chatHistory) {
    const technicalEvaluations = chatHistory.filter(h => h.evaluation);
    if (technicalEvaluations.length === 0) return 70; // Baseline

    const totalScore = technicalEvaluations.reduce((acc, curr) => acc + (curr.evaluation.score || 0), 0);
    return Math.round((totalScore / (technicalEvaluations.length * 10)) * 100);
  }

  static calculateCommunicationScore(chatHistory, behaviorReport) {
    const evaluations = chatHistory.filter(h => h.evaluation);
    const avgEvalScore = evaluations.length > 0 
      ? (evaluations.reduce((acc, curr) => acc + (curr.evaluation.score || 0), 0) / evaluations.length) * 10
      : 70;

    const eyeContact = behaviorReport.eyeContactScore || 70;
    const attention = behaviorReport.attentionScore || 70;

    // Weighted average
    return Math.round((avgEvalScore * 0.6) + (eyeContact * 0.2) + (attention * 0.2));
  }

  static calculateIntegrityScore(behaviorReport) {
    return behaviorReport.integrityScore || 100;
  }

  static calculateOverallScore(techScore, commScore, integrityScore) {
    // Integrity acts as a slight modifier or weight
    const integrityFactor = integrityScore / 100;
    const baseScore = (techScore * 0.6) + (commScore * 0.4);
    return Math.round(baseScore * (0.9 + (0.1 * integrityFactor)));
  }

  static getPerformanceBand(score) {
    if (score >= 90) return 'Outstanding';
    if (score >= 80) return 'Strong';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Developing';
    return 'Needs Improvement';
  }

  static getHiringReadiness(score) {
    if (score >= 85) return 'Highly Prepared';
    if (score >= 70) return 'Interview Ready';
    return 'Requires Additional Preparation';
  }
}

module.exports = ScoreAggregator;
