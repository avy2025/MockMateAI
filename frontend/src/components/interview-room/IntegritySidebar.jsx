import React from 'react';

/**
 * IntegritySidebar
 * ----------------
 * Slide-out right sidebar for interview integrity monitoring.
 * Professional, neutral, and data-driven.
 *
 * Props:
 *   isOpen      {boolean}
 *   onToggle    {() => void}
 *   metrics     {object}  — from useIntegrityMonitoring
 */

function scoreColor(score) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'amber';
  return 'red';
}

function fmtMs(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function IntegrityRing({ score }) {
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
    <div className="bsb-ring" aria-label={`Integrity score: ${score}%`}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke="rgba(255,243,230,0.08)"
          strokeWidth="7"
        />
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

function IntegrityCard({ icon, title, value, color, sub }) {
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

function IntegritySidebar({ isOpen, onToggle, metrics }) {
  const log = [...(metrics.events || [])].reverse().slice(0, 20);

  return (
    <>
      {isOpen && (
        <div
          className="behavior-backdrop"
          style={{ zIndex: 930 }}
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`behavior-sidebar ${isOpen ? 'behavior-sidebar--open' : ''}`}
        style={{ zIndex: 940, background: 'rgba(56, 25, 50, 0.98)' }}
        aria-label="Integrity Monitoring Panel"
        aria-hidden={!isOpen}
      >
        <div className="bsb-header">
          <div className="bsb-header__title">
            <span aria-hidden="true">🛡️</span>
            Integrity Monitoring
          </div>
          <button
            className="bsb-header__close"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="bsb-disclaimer">
          Observable system signals and focus events. Non-judgmental verification data.
        </div>

        <section className="bsb-section">
          <h3 className="bsb-section__title">Overall Integrity Score</h3>
          <div className="bsb-ring-wrap">
            <IntegrityRing score={metrics.integrityScore} />
            <div className="bsb-ring-stats">
              <div className="bsb-stat">
                <span className="bsb-stat__label">Focus Losses</span>
                <span className="bsb-stat__value">{metrics.focusLossCount}</span>
              </div>
              <div className="bsb-stat">
                <span className="bsb-stat__label">Away Duration</span>
                <span className="bsb-stat__value">{fmtMs(metrics.timeAwayMs)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bsb-section">
          <h3 className="bsb-section__title">Signal Summary</h3>
          <div className="bsb-cards">
            <IntegrityCard
              icon="🏠"
              title="Window Focus"
              value={metrics.focusLossCount === 0 ? 'Consistent' : 'Interrupted'}
              color={metrics.focusLossCount === 0 ? 'green' : (metrics.focusLossCount < 3 ? 'amber' : 'red')}
              sub={`${metrics.focusLossCount} events recorded`}
            />
            <IntegrityCard
              icon="👁️"
              title="Eye Gaze"
              value="Monitored"
              color="neutral"
              sub="Tracking off-screen gaze"
            />
            <IntegrityCard
              icon="👥"
              title="Presence"
              value="Verified"
              color="neutral"
              sub="Checking person count"
            />
          </div>
        </section>

        {log.length > 0 && (
          <section className="bsb-section bsb-section--log">
            <h3 className="bsb-section__title">Integrity Events</h3>
            <ul className="bsb-log">
              {log.map((entry, i) => (
                <li key={i} className="bsb-log__item">
                  <span className="bsb-log__time">{fmtTime(entry.ts)}</span>
                  <span className="bsb-log__msg">{entry.message}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </>
  );
}

export default IntegritySidebar;
