import React from 'react';

/**
 * BehaviorSidebar
 * ---------------
 * Slide-out right sidebar for real-time behavioral analysis.
 * Collapsed by default — only a slim vertical tab is visible.
 * Expands over the existing layout (position: fixed) on toggle.
 *
 * Props:
 *   isOpen      {boolean}
 *   onToggle    {() => void}
 *   metrics     {object}  — from useBehaviorAnalysis
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}

function attentionColor(status) {
  if (status === 'focused') return 'green';
  if (status === 'scanning') return 'amber';
  return 'red';
}

function engagementLevel(metrics) {
  const score = metrics.eyeContact.score;
  const attn  = metrics.headPose.attentionStatus;
  if (score >= 70 && attn === 'focused') return { label: 'High',   color: 'green' };
  if (score >= 40 || attn === 'scanning') return { label: 'Medium', color: 'amber' };
  return { label: 'Low', color: 'red' };
}

function visibilityColor(status) {
  if (status === 'visible')      return 'green';
  if (status === 'initializing') return 'amber';
  return 'red';
}

function visibilityLabel(status) {
  if (status === 'visible')      return 'Visible';
  if (status === 'missing')      return 'Not Detected';
  if (status === 'multiple')     return 'Multiple Faces';
  return 'Initializing…';
}

function fmtMs(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Score Ring (SVG) ────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  const ringColors = {
    green: '#6ee7a0',
    amber: '#fbbf24',
    red:   '#f87171',
  };

  return (
    <div className="bsb-ring" aria-label={`Eye contact score: ${score}%`}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        {/* Track */}
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke="rgba(255,243,230,0.08)"
          strokeWidth="7"
        />
        {/* Progress */}
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={ringColors[color]}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset="0"
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="bsb-ring__label">
        <span className={`bsb-ring__score bsb-ring__score--${color}`}>{score}</span>
        <span className="bsb-ring__unit">%</span>
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ icon, title, value, color, sub }) {
  return (
    <div className="bsb-card">
      <div className="bsb-card__icon" aria-hidden="true">{icon}</div>
      <div className="bsb-card__body">
        <span className="bsb-card__title">{title}</span>
        <span className={`bsb-card__value bsb-card__value--${color}`}>{value}</span>
        {sub && <span className="bsb-card__sub">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function BehaviorSidebar({ isOpen, onToggle, metrics, onSecretToggle }) {
  const engagement = engagementLevel(metrics);
  const log = [...(metrics.sessionLog || [])].reverse().slice(0, 20);

  return (
    <>
      {/* Slim vertical tab — always visible */}
      <button
        id="behavior-sidebar-toggle"
        className={`behavior-tab ${isOpen ? 'behavior-tab--open' : ''}`}
        onClick={onToggle}
        onDoubleClick={onSecretToggle}
        aria-label={isOpen ? 'Close Behavior Analysis' : 'Open Behavior Analysis'}
        aria-expanded={isOpen}
      >
        <span className="behavior-tab__icon" aria-hidden="true">📊</span>
        <span className="behavior-tab__text">Analysis</span>
        {/* Ready dot */}
        {metrics.isReady && (
          <span className="behavior-tab__dot" aria-label="Analysis active" />
        )}
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="behavior-backdrop"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`behavior-sidebar ${isOpen ? 'behavior-sidebar--open' : ''}`}
        aria-label="Behavior Analysis Panel"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="bsb-header" onDoubleClick={onSecretToggle}>
          <div className="bsb-header__title">
            <span aria-hidden="true">📊</span>
            Behavior Analysis
          </div>
          <div className="bsb-header__badge">Live</div>
          <button
            className="bsb-header__close"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="bsb-disclaimer">
          Observable behavioral indicators only — not psychological assessments.
        </div>

        {/* Eye Contact Score ring */}
        <section className="bsb-section" aria-label="Eye Contact">
          <h3 className="bsb-section__title">Eye Contact Score</h3>
          <div className="bsb-ring-wrap">
            <ScoreRing score={metrics.eyeContact.score} />
            <div className="bsb-ring-stats">
              <div className="bsb-stat">
                <span className="bsb-stat__label">Deviations</span>
                <span className="bsb-stat__value">{metrics.eyeContact.deviationCount}</span>
              </div>
              <div className="bsb-stat">
                <span className="bsb-stat__label">On Screen</span>
                <span className="bsb-stat__value">{fmtMs(metrics.eyeContact.onScreenMs)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Metric cards grid */}
        <section className="bsb-section" aria-label="Behavioral Indicators">
          <h3 className="bsb-section__title">Behavioral Indicators</h3>
          <div className="bsb-cards">
            <MetricCard
              icon="🎯"
              title="Attention"
              value={metrics.headPose.attentionStatus.charAt(0).toUpperCase() + metrics.headPose.attentionStatus.slice(1)}
              color={attentionColor(metrics.headPose.attentionStatus)}
              sub={`↔ ${metrics.headPose.lateralCount} lateral · ↓ ${metrics.headPose.downwardCount} downward`}
            />
            <MetricCard
              icon="⚡"
              title="Engagement"
              value={engagement.label}
              color={engagement.color}
            />
            <MetricCard
              icon="📷"
              title="Face Visibility"
              value={visibilityLabel(metrics.faceVisibility.status)}
              color={visibilityColor(metrics.faceVisibility.status)}
              sub={metrics.faceVisibility.missedFrames > 0
                ? `${metrics.faceVisibility.missedFrames} missed frames`
                : null}
            />
            <MetricCard
              icon="🎙"
              title="Speaking Time"
              value={fmtMs(metrics.communication.speakingDurationMs)}
              color="neutral"
            />
          </div>
        </section>

        {/* Session log */}
        {log.length > 0 && (
          <section className="bsb-section bsb-section--log" aria-label="Session Events">
            <h3 className="bsb-section__title">Session Events</h3>
            <ul className="bsb-log" aria-label="Behavioral event log">
              {log.map((entry, i) => (
                <li key={i} className="bsb-log__item">
                  <span className="bsb-log__time">{fmtTime(entry.ts)}</span>
                  <span className="bsb-log__msg">{entry.message}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!metrics.isReady && (
          <div className="bsb-loading">
            <div className="bsb-loading__spinner" aria-hidden="true" />
            <span>Loading analysis engine…</span>
          </div>
        )}
      </aside>
    </>
  );
}

export default BehaviorSidebar;
