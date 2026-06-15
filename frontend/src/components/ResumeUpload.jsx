import React, { useState, useRef, useCallback } from 'react';
import { uploadResume } from '../services/resumeApi';
import ResumeContextDashboard from './ResumeContextDashboard';

const ResumeUpload = ({ interviewType, onUploadSuccess, onBack }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
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

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const allowedExtensions = ['.pdf', '.docx'];

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      return 'Only PDF and DOCX files are accepted.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be under 5MB.';
    }
    return null;
  };

  const handleFile = useCallback((selectedFile) => {
    setErrorMessage('');
    setUploadState('idle');

    const error = validateFile(selectedFile);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadState('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const data = await uploadResume(file, (progress) => {
        setUploadProgress(progress);
      });

      if (data.success) {
        setUploadState('success');
        setUploadedFilename(data.filename || file.name);
        setExtractedText(data.extractedText || '');
        setSessionId(data.sessionId || '');
        setChunks(data.chunks || []);
        setInsights(data.insights || null);
        setSignedUrl(data.signedUrl || '');
        setPreviewOpen(false);
      } else {
        setUploadState('error');
        setErrorMessage(data.message || 'Upload failed.');
      }
    } catch (err) {
      setUploadState('error');
      setErrorMessage('Could not connect to server. Please try again.');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadState('idle');
    setUploadedFilename('');
    setExtractedText('');
    setSessionId('');
    setChunks([]);
    setInsights(null);
    setPreviewOpen(false);
    setSignedUrl('');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx') return '📝';
    return '📎';
  };

  return (
    <div className="fade-in" style={styles.container}>
      <header style={styles.header}>
        <button
          onClick={onBack}
          style={styles.backBtn}
          className="secondary-btn resume-upload-back"
        >
          ← Back
        </button>
        <h1 style={styles.title}>MockMate AI</h1>
        <p style={styles.subtitle}>
          {interviewType
            ? `${interviewType} Interview — Upload Your Resume`
            : 'Upload Your Resume'}
        </p>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          {/* Step indicator */}
          <div style={styles.stepBadge}>
            <span style={styles.stepIcon}>📋</span>
            <span>Step 1 of 2</span>
          </div>

          <h2 style={styles.cardTitle}>Upload your resume to get started</h2>
          <p style={styles.cardText}>
            We'll use your resume to personalize the interview experience.
          </p>

          {/* Drag & Drop Zone */}
          {uploadState !== 'success' && (
            <div
              id="resume-dropzone"
              style={{
                ...styles.dropzone,
                ...(isDragging ? styles.dropzoneActive : {}),
                ...(errorMessage ? styles.dropzoneError : {}),
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleInputChange}
                style={styles.hiddenInput}
                id="resume-file-input"
              />

              <div style={styles.dropzoneContent}>
                <div style={styles.uploadIconWrapper}>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke={isDragging ? '#381932' : '#9e8a99'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <path d="M24 32V8" />
                    <path d="M16 16l8-8 8 8" />
                    <path d="M40 32v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6" />
                  </svg>
                </div>

                <p style={styles.dropzoneTitle}>
                  {isDragging ? 'Drop your file here' : 'Drag & drop your resume here'}
                </p>
                <p style={styles.dropzoneSubtext}>or click to browse</p>
                <div style={styles.formatBadges}>
                  <span style={styles.formatBadge}>PDF</span>
                  <span style={styles.formatBadge}>DOCX</span>
                </div>
                <p style={styles.sizeHint}>Maximum file size: 5MB</p>
              </div>
            </div>
          )}

          {/* File preview */}
          {file && uploadState !== 'success' && (
            <div style={styles.filePreview} className="scale-in">
              <div style={styles.fileInfo}>
                <span style={styles.fileIcon}>{getFileIcon(file.name)}</span>
                <div style={styles.fileDetails}>
                  <p style={styles.fileName}>{file.name}</p>
                  <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                style={styles.removeBtn}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div style={styles.errorBox} className="scale-in">
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.errorText}>{errorMessage}</p>
            </div>
          )}

          {/* Success state */}
          {uploadState === 'success' && (
            <div style={styles.successBox} className="scale-in">
              <div style={styles.successIconWrapper}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  style={styles.successCheckSvg}
                >
                  <circle cx="32" cy="32" r="30" fill="#381932" />
                  <path
                    d="M20 32l8 8 16-16"
                    stroke="#FFF3E6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 style={styles.successTitle}>Resume analyzed successfully</h3>
              <div style={styles.successFileInfo}>
                <span>{getFileIcon(uploadedFilename)}</span>
                <span style={styles.successFileName}>{uploadedFilename}</span>
              </div>

              {(chunks.length > 0 || insights) && (
                <ResumeContextDashboard chunks={chunks} insights={insights} />
              )}

              {extractedText && (
                <div style={styles.textPreviewSection}>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen((open) => !open)}
                    style={styles.previewToggle}
                    aria-expanded={previewOpen}
                  >
                    <span style={styles.previewToggleLabel}>
                      Extracted resume text
                    </span>
                    <span style={styles.previewChevron}>
                      {previewOpen ? '▾' : '▸'}
                    </span>
                  </button>
                  {previewOpen && (
                    <pre style={styles.textPreview}>{extractedText}</pre>
                  )}
                </div>
              )}

              {signedUrl && (
                <div style={styles.documentPreviewSection}>
                  <iframe src={signedUrl} style={styles.iframePreview} title="Resume Document Preview" />
                </div>
              )}

              <button
                onClick={handleRemoveFile}
                style={styles.changeFileBtn}
              >
                Change file
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            {uploadState !== 'success' && (
              <button
                id="upload-resume-btn"
                className="primary-btn"
                onClick={handleUpload}
                disabled={!file || uploadState === 'uploading'}
                style={{
                  ...styles.uploadBtn,
                  ...(!file || uploadState === 'uploading'
                    ? styles.uploadBtnDisabled
                    : {}),
                }}
              >
                {uploadState === 'uploading' ? (
                  <div style={styles.progressContainer}>
                    <div style={{...styles.progressBar, width: `${uploadProgress}%`}}></div>
                    <span style={styles.progressText}>Uploading... {uploadProgress}%</span>
                  </div>
                ) : uploadState === 'error' ? (
                  'Retry Upload'
                ) : (
                  'Upload Resume'
                )}
              </button>
            )}

            <button
              id="start-interview-btn"
              className="primary-btn"
              onClick={() =>
                onUploadSuccess({
                  filename: uploadedFilename,
                  sessionId,
                  chunks,
                  insights,
                  extractedText,
                })
              }
              disabled={uploadState !== 'success'}
              style={{
                ...styles.startInterviewBtn,
                ...(uploadState !== 'success' ? styles.uploadBtnDisabled : {}),
              }}
            >
              Start Interview →
            </button>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>© 2026 MockMate AI. Practice makes perfect.</p>
      </footer>

      {/* Spinner animation via inline style tag */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes successPulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        #resume-dropzone:hover {
          border-color: #381932 !important;
          background-color: rgba(56, 25, 50, 0.03) !important;
        }
        #start-interview-btn:not(:disabled):hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(56, 25, 50, 0.3) !important;
        }
        @media (max-width: 600px) {
          .resume-upload-back {
            position: static !important;
            margin-bottom: 16px;
            display: block;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '32px',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: '-120px',
    top: '0',
    padding: '8px 16px',
    fontSize: '0.9rem',
    borderRadius: '10px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#381932',
    letterSpacing: '-1px',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1.15rem',
    color: '#8a7085',
    fontWeight: '500',
  },
  main: {
    width: '100%',
    maxWidth: '720px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 12px 40px rgba(56, 25, 50, 0.08)',
    border: '1px solid rgba(56, 25, 50, 0.04)',
  },
  stepBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(56, 25, 50, 0.06)',
    color: '#381932',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '20px',
  },
  stepIcon: {
    fontSize: '0.9rem',
  },
  cardTitle: {
    fontSize: '1.6rem',
    marginBottom: '10px',
    color: '#381932',
    fontWeight: '700',
  },
  cardText: {
    color: '#8a7085',
    marginBottom: '28px',
    lineHeight: '1.6',
    fontSize: '0.95rem',
  },

  // Dropzone
  dropzone: {
    border: '2px dashed rgba(56, 25, 50, 0.2)',
    borderRadius: '16px',
    padding: '40px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 243, 230, 0.3)',
    marginBottom: '16px',
  },
  dropzoneActive: {
    borderColor: '#381932',
    backgroundColor: 'rgba(56, 25, 50, 0.05)',
    transform: 'scale(1.01)',
  },
  dropzoneError: {
    borderColor: '#e74c3c',
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  uploadIconWrapper: {
    marginBottom: '4px',
  },
  dropzoneTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#381932',
  },
  dropzoneSubtext: {
    fontSize: '0.85rem',
    color: '#9e8a99',
  },
  formatBadges: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  formatBadge: {
    backgroundColor: 'rgba(56, 25, 50, 0.08)',
    color: '#381932',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  sizeHint: {
    fontSize: '0.75rem',
    color: '#b3a5ae',
    marginTop: '2px',
  },
  hiddenInput: {
    display: 'none',
  },

  // File preview
  filePreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: 'rgba(56, 25, 50, 0.04)',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  fileIcon: {
    fontSize: '1.8rem',
  },
  fileDetails: {
    textAlign: 'left',
  },
  fileName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#381932',
    wordBreak: 'break-all',
  },
  fileSize: {
    fontSize: '0.75rem',
    color: '#9e8a99',
    marginTop: '2px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.1rem',
    color: '#9e8a99',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },

  // Error
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#fdf0ef',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid rgba(231, 76, 60, 0.15)',
  },
  errorIcon: {
    fontSize: '1.2rem',
  },
  errorText: {
    fontSize: '0.85rem',
    color: '#c0392b',
    fontWeight: '500',
    textAlign: 'left',
  },

  // Success
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '32px 20px',
    marginBottom: '16px',
  },
  successIconWrapper: {
    animation: 'successPulse 0.5s ease-out',
  },
  successCheckSvg: {
    filter: 'drop-shadow(0 4px 12px rgba(56, 25, 50, 0.2))',
  },
  successTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#381932',
    marginTop: '4px',
  },
  successFileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(56, 25, 50, 0.04)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#381932',
    fontWeight: '500',
  },
  successFileName: {
    wordBreak: 'break-all',
  },
  changeFileBtn: {
    background: 'none',
    border: 'none',
    color: '#9e8a99',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '4px',
  },
  textPreviewSection: {
    width: '100%',
    marginTop: '8px',
    textAlign: 'left',
  },
  previewToggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: 'rgba(56, 25, 50, 0.05)',
    border: '1px solid rgba(56, 25, 50, 0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#381932',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
  previewToggleLabel: {
    flex: 1,
    textAlign: 'left',
  },
  previewChevron: {
    fontSize: '0.85rem',
    color: '#8a7085',
  },
  textPreview: {
    margin: '10px 0 0',
    padding: '14px 16px',
    maxHeight: '220px',
    overflowY: 'auto',
    backgroundColor: '#FFF9F2',
    border: '1px solid rgba(56, 25, 50, 0.08)',
    borderRadius: '12px',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    lineHeight: '1.55',
    color: '#4a3a45',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    textAlign: 'left',
  },

  // Action Buttons
  actionButtons: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  uploadBtn: {
    width: '100%',
    fontSize: '1.05rem',
    padding: '16px',
    borderRadius: '14px',
    transition: 'all 0.3s ease',
  },
  uploadBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    transform: 'none',
  },
  startInterviewBtn: {
    width: '100%',
    fontSize: '1.1rem',
    padding: '16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #381932 0%, #5a2d52 100%)',
    transition: 'all 0.3s ease',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 243, 230, 0.3)',
    borderTopColor: '#FFF3E6',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  progressContainer: {
    width: '100%',
    height: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffb86c', // Using a distinct color to stand out inside the button
    position: 'absolute',
    left: '0',
    top: '0',
    transition: 'width 0.2s ease',
    zIndex: 1,
  },
  progressText: {
    position: 'relative',
    zIndex: 2,
    fontSize: '0.9rem',
    color: '#FFF',
    fontWeight: '600',
    textShadow: '0px 1px 2px rgba(0,0,0,0.3)'
  },
  documentPreviewSection: {
    width: '100%',
    marginTop: '16px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  iframePreview: {
    width: '100%',
    height: '400px',
    border: '1px solid rgba(56, 25, 50, 0.08)',
    borderRadius: '12px',
    backgroundColor: '#f9f9f9'
  },

  // Footer
  footer: {
    marginTop: '48px',
    fontSize: '0.9rem',
    color: '#999',
  },
};

export default ResumeUpload;
