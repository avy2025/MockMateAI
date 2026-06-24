import React, { useState, useRef, useCallback } from 'react';
import { uploadResume } from '../services/resumeApi';
import ResumeContextDashboard from './ResumeContextDashboard';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeUpload = ({ interviewType, onUploadSuccess, onBack }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState('idle');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [chunks, setChunks] = useState([]);
  const [insights, setInsights] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [signedUrl, setSignedUrl] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.pdf', '.docx'];

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) return 'Only PDF and DOCX files are accepted.';
    if (file.size > 5 * 1024 * 1024) return 'File size must be under 5MB.';
    return null;
  };

  const handleFile = useCallback((selectedFile) => {
    setErrorMessage('');
    setUploadState('idle');
    const error = validateFile(selectedFile);
    if (error) { setErrorMessage(error); return; }
    setFile(selectedFile);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); const droppedFile = e.dataTransfer.files[0]; if (droppedFile) handleFile(droppedFile); };

  const handleUpload = async () => {
    if (!file) return;
    setUploadState('uploading');
    setUploadProgress(0);
    try {
      const data = await uploadResume(file, (progress) => setUploadProgress(progress));
      if (data.success) {
        setUploadState('success');
        setUploadedFilename(data.filename || file.name);
        setExtractedText(data.extractedText || '');
        setSessionId(data.sessionId || '');
        setChunks(data.chunks || []);
        setInsights(data.insights || null);
        setSignedUrl(data.signedUrl || '');
      } else {
        setUploadState('error');
        setErrorMessage(data.message || 'Upload failed.');
      }
    } catch (err) {
      setUploadState('error');
      setErrorMessage('Could not connect to server.');
    }
  };

  const handleRemoveFile = () => {
    setFile(null); setUploadState('idle'); setUploadedFilename(''); setExtractedText('');
    setSessionId(''); setChunks([]); setInsights(null); setSignedUrl(''); setErrorMessage('');
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--background-milk)', minHeight: '100vh', padding: '100px 48px 48px' }}>
      <header className="nav-container">
        <button onClick={onBack} className="btn btn-ghost">← Back</button>
        <div className="display-text" style={{ fontSize: '1.5rem' }}>MOCKMATE AI</div>
        <div style={{ width: '80px' }} />
      </header>

      <main className="container" style={{ maxWidth: '800px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ padding: '48px', textAlign: 'center' }}
        >
          <div style={{ marginBottom: '40px' }}>
            <span className="display-text" style={{ color: 'var(--accent)', fontSize: '0.9rem', display: 'block', marginBottom: '12px' }}>STEP 01 OF 02</span>
            <h1 className="display-text" style={{ fontSize: '3rem', marginBottom: '16px' }}>Architect Your Experience</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              Upload your resume. Our AI analyzes your background to construct a high-fidelity, personalized interview environment.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {uploadState !== 'success' ? (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="upload-dropzone"
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--glass-border)'}`,
                    borderRadius: '16px',
                    padding: '64px 20px',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    backgroundColor: isDragging ? 'rgba(56, 25, 50, 0.05)' : 'transparent',
                    marginBottom: '24px'
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={(e) => handleFile(e.target.files[0])} style={{ display: 'none' }} />
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
                  <h3 className="display-text" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                    {isDragging ? 'Release to Upload' : 'Drag & Drop Resume'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>or click to browse PDF or DOCX (Max 5MB)</p>
                </div>

                {file && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(56, 25, 50, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                      <span style={{ fontSize: '1.5rem' }}>{file.name.endsWith('pdf') ? '📕' : '📘'}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>{file.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <button onClick={handleRemoveFile} className="btn btn-ghost" style={{ padding: '8px' }}>✕</button>
                  </motion.div>
                )}

                {errorMessage && <div style={{ color: '#ba1a1a', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 500 }}>{errorMessage}</div>}

                <button 
                  className="btn btn-primary" 
                  onClick={handleUpload} 
                  disabled={!file || uploadState === 'uploading'}
                  style={{ width: '100%', padding: '18px', fontSize: '1.1rem' }}
                >
                  {uploadState === 'uploading' ? `Analyzing Background... ${uploadProgress}%` : 'Analyze Resume'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="success-zone"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✨</div>
                <h2 className="display-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>Intelligence Synthesized</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Resume "{uploadedFilename}" has been successfully mapped to our interview engine.</p>
                
                {(chunks.length > 0 || insights) && (
                  <div style={{ marginBottom: '32px' }}>
                    <ResumeContextDashboard chunks={chunks} insights={insights} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={handleRemoveFile} className="btn btn-secondary" style={{ flex: 1, backgroundColor: 'white' }}>Replace File</button>
                  <button 
                    onClick={() => onUploadSuccess({ filename: uploadedFilename, sessionId, chunks, insights, extractedText })} 
                    className="btn btn-primary" 
                    style={{ flex: 1.5 }}
                  >
                    Proceed to Role Selection →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default ResumeUpload;
