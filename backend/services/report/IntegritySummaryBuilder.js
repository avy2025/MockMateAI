/**
 * Formats raw integrity events into neutral observations.
 */
class IntegritySummaryBuilder {
  static build(behaviorReport) {
    const {
      focusLossCount = 0,
      windowSwitchCount = 0,
      multipleFaceEvents = 0,
      cameraInterruptions = 0,
      integrityScore = 100
    } = behaviorReport;

    const observations = [];
    if (focusLossCount > 0) observations.push(`${focusLossCount} focus-loss event(s) observed.`);
    if (windowSwitchCount > 0) observations.push(`${windowSwitchCount} browser window switch(es) detected.`);
    if (multipleFaceEvents > 0) observations.push(`${multipleFaceEvents} event(s) of multiple faces in frame.`);
    if (cameraInterruptions > 0) observations.push(`${cameraInterruptions} camera interruption(s) occurred.`);
    
    if (observations.length === 0) {
      observations.push("No significant integrity events were observed during the session.");
    }

    return {
      integrityScore: Math.round(integrityScore),
      stats: {
        focusLossCount,
        windowSwitchCount,
        multipleFaceEvents,
        cameraInterruptions
      },
      observations,
      status: integrityScore > 85 ? 'Consistently Focused' : (integrityScore > 70 ? 'Minor Deviations' : 'Review Recommended')
    };
  }
}

module.exports = IntegritySummaryBuilder;
