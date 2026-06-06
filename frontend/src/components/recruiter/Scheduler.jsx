import React, { useState, useEffect } from 'react';
import { getSchedules, createSchedule } from '../../services/recruiterApi';

const Scheduler = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    scheduledDate: '',
    interviewType: 'Software Engineer'
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await getSchedules();
      setSchedules(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSchedule(formData);
      setShowModal(false);
      fetchSchedules();
      setFormData({
        candidateName: '',
        candidateEmail: '',
        scheduledDate: '',
        interviewType: 'Software Engineer'
      });
    } catch (err) {
      alert('Failed to create schedule');
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-title">
          <h1>Interview Scheduling</h1>
          <p>Generate invitation links and manage upcoming sessions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            padding: '12px 24px',
            background: '#381932',
            color: '#fff',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          New Invite
        </button>
      </header>

      <div className="content-card" style={{ marginTop: '2rem' }}>
        {loading ? (
          <p>Loading schedules...</p>
        ) : schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ opacity: 0.6 }}>No active invitations. Start by creating a new one.</p>
          </div>
        ) : (
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '15px' }}>Candidate</th>
                  <th style={{ padding: '15px' }}>Role</th>
                  <th style={{ padding: '15px' }}>Scheduled For</th>
                  <th style={{ padding: '15px' }}>Status</th>
                  <th style={{ padding: '15px' }}>Invite Link</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 600 }}>{s.candidateName}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{s.candidateEmail}</div>
                    </td>
                    <td style={{ padding: '15px' }}>{s.interviewType}</td>
                    <td style={{ padding: '15px' }}>{new Date(s.scheduledDate).toLocaleString()}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        background: s.status === 'pending' ? '#fff3e6' : '#e6fffa',
                        color: s.status === 'pending' ? '#d97706' : '#059669',
                        fontWeight: 600
                      }}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <button 
                        onClick={() => {
                          const url = `${window.location.origin}/invite/${s.inviteToken}`;
                          navigator.clipboard.writeText(url);
                          alert('Link copied to clipboard!');
                        }}
                        style={{ background: 'none', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Copy Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(56, 25, 50, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Create Interview Invite</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Candidate Name</label>
                <input 
                  type="text" 
                  value={formData.candidateName}
                  onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Candidate Email</label>
                <input 
                  type="email" 
                  value={formData.candidateEmail}
                  onChange={(e) => setFormData({...formData, candidateEmail: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Role</label>
                <input 
                  type="text" 
                  value={formData.interviewType}
                  onChange={(e) => setFormData({...formData, interviewType: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#381932', color: '#fff', fontWeight: 700 }}>Generate Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
