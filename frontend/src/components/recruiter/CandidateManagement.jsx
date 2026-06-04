import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidates, exportToCSV } from '../../services/recruiterApi';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCandidates();
        setCandidates(data);
        setFilteredCandidates(data);
      } catch (error) {
        console.error('Failed to load candidates:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = candidates.filter(c => 
      c.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedRole.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCandidates(filtered);
  }, [search, candidates]);

  const handleExport = () => {
    if (filteredCandidates.length > 0) {
      exportToCSV(filteredCandidates, 'mockmate_candidates_report');
    }
  };

  const handleCompare = () => {
    if (selectedIds.length > 1) {
      navigate(`/recruiter/compare?ids=${selectedIds.join(',')}`);
    }
  };

  const toggleSelection = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert('You can compare up to 3 candidates at a time.');
      }
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Ready': return 'status-ready';
      case 'Pending': return 'status-pending';
      default: return 'status-review';
    }
  };

  if (loading) return <div className="loading">Loading candidate data...</div>;

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div className="page-title">
          <h1>Candidate Management</h1>
          <p>Review and manage all candidate assessments in one place.</p>
        </div>
        <div className="table-actions">
          {selectedIds.length > 1 && (
            <button className="btn-primary" onClick={handleCompare} style={{ background: '#f4a261', color: '#381932' }}>
              ⚖️ Compare ({selectedIds.length})
            </button>
          )}
          <button className="btn-secondary" onClick={handleExport}>📤 Export CSV</button>
        </div>
      </header>

      <div className="content-card">
        <div className="table-toolbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by name or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Candidate Name</th>
              <th>Applied Role</th>
              <th>Interview Date</th>
              <th>Overall Score</th>
              <th>Tech</th>
              <th>Comm</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((c, idx) => (
                <tr key={idx} onClick={() => navigate(`/recruiter/candidate/${c.sessionId}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(c.sessionId)}
                      onChange={(e) => toggleSelection(e, c.sessionId)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '18px', height: '18px' }}
                    />
                  </td>
                  <td style={{ fontWeight: 700 }}>{c.candidateName}</td>
                  <td>{c.appliedRole}</td>
                  <td style={{ opacity: 0.7 }}>{new Date(c.interviewDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`score-badge ${getScoreClass(c.overallScore)}`}>
                      {c.overallScore}%
                    </span>
                  </td>
                  <td>{c.technicalScore}%</td>
                  <td>{c.communicationScore}%</td>
                  <td>
                    <span className={`status-chip ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View Profile</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                  No candidates found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default CandidateManagement;
