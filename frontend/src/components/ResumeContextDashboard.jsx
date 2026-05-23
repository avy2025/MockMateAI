import React from 'react';

const ResumeContextDashboard = ({ chunks = [], insights = {} }) => {
  const projects = chunks
    .filter((c) => c.type === 'project')
    .map((c) => c.content);
  const skillsChunks = chunks.filter((c) => c.type === 'skills');
  const skillTags =
    insights.topSkills?.length > 0
      ? insights.topSkills
      : skillsChunks
          .flatMap((c) => c.content.split(/[,;|•\n]/))
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 50)
          .slice(0, 12);

  const focusAreas = insights.focusAreas || [];
  const strongestProject = insights.strongestProject;

  return (
    <div style={styles.dashboard} className="resume-context-dashboard">
      <p style={styles.dashboardLabel}>Interview context</p>
      <div style={styles.grid} className="resume-context-grid">
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>⚡</span>
            <h4 style={styles.cardTitle}>Extracted skills</h4>
          </div>
          {skillTags.length > 0 ? (
            <div style={styles.tagList}>
              {skillTags.map((skill) => (
                <span key={skill} style={styles.tag}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>No skills section detected yet.</p>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🚀</span>
            <h4 style={styles.cardTitle}>Projects</h4>
          </div>
          {projects.length > 0 ? (
            <ul style={styles.list}>
              {projects.map((project, index) => (
                <li key={index} style={styles.listItem}>
                  {project}
                </li>
              ))}
            </ul>
          ) : strongestProject ? (
            <p style={styles.highlightText}>{strongestProject}</p>
          ) : (
            <p style={styles.emptyText}>No projects section detected yet.</p>
          )}
        </div>

        <div
          style={{ ...styles.card, ...styles.cardWide }}
          className="resume-context-card-wide"
        >
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🎯</span>
            <h4 style={styles.cardTitle}>AI interview focus areas</h4>
            {insights.source === 'gemini' && (
              <span style={styles.aiBadge}>Gemini</span>
            )}
          </div>
          {focusAreas.length > 0 ? (
            <div style={styles.focusList}>
              {focusAreas.map((area) => (
                <div key={area} style={styles.focusItem}>
                  <span style={styles.focusDot} />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>Focus areas will appear after analysis.</p>
          )}
          {strongestProject && projects.length > 0 && (
            <div style={styles.strongestProject}>
              <p style={styles.strongestLabel}>Strongest project</p>
              <p style={styles.strongestText}>{strongestProject}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

const styles = {
  dashboard: {
    width: '100%',
    marginTop: '20px',
    textAlign: 'left',
  },
  dashboardLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#9e8a99',
    marginBottom: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  card: {
    backgroundColor: '#FFF9F2',
    border: '1px solid rgba(56, 25, 50, 0.08)',
    borderRadius: '16px',
    padding: '18px',
    minHeight: '120px',
  },
  cardWide: {
    gridColumn: '1 / -1',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  cardIcon: {
    fontSize: '1.1rem',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#381932',
    flex: 1,
  },
  aiBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(56, 25, 50, 0.1)',
    color: '#381932',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    fontSize: '0.78rem',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '20px',
    backgroundColor: '#FFFFFF',
    color: '#381932',
    border: '1px solid rgba(56, 25, 50, 0.1)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    fontSize: '0.82rem',
    lineHeight: '1.5',
    color: '#4a3a45',
    paddingLeft: '12px',
    borderLeft: '3px solid rgba(56, 25, 50, 0.15)',
  },
  focusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  focusItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    color: '#4a3a45',
  },
  focusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#381932',
    marginTop: '6px',
    flexShrink: 0,
  },
  strongestProject: {
    marginTop: '16px',
    paddingTop: '14px',
    borderTop: '1px solid rgba(56, 25, 50, 0.08)',
  },
  strongestLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#9e8a99',
    marginBottom: '6px',
  },
  strongestText: {
    fontSize: '0.85rem',
    lineHeight: '1.55',
    color: '#381932',
    fontWeight: '500',
  },
  highlightText: {
    fontSize: '0.82rem',
    lineHeight: '1.55',
    color: '#4a3a45',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: '#9e8a99',
    fontStyle: 'italic',
  },
};

export default ResumeContextDashboard;
