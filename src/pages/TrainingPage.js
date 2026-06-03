import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const TrainingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [persona, setPersona] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Knowledge Base State
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [reindexing, setReindexing] = useState(false);

  // Pinecone Status
  const [pineconeStatus, setPineconeStatus] = useState(null);

  // Clear alerts after 6 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => { setError(null); setSuccess(null); }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchTrainingData = useCallback(async () => {
    try {
      const { data } = await api.get('/api/training/persona');
      if (data) {
        setPersona(data.persona || '');
        setSystemPrompt(data.text || '');
      }
    } catch (err) {
      console.error('Failed to fetch training data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchKnowledge = useCallback(async () => {
    try {
      const { data } = await api.get('/api/training/knowledge');
      setKnowledgeList(data);
    } catch (err) {
      console.error('Failed to fetch knowledge:', err);
    }
  }, []);

  const fetchPineconeStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/api/training/knowledge/status');
      setPineconeStatus(data);
    } catch (err) {
      console.error('Failed to fetch Pinecone status:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrainingData();
    fetchKnowledge();
    fetchPineconeStatus();
  }, [fetchTrainingData, fetchKnowledge, fetchPineconeStatus]);

  const handleSavePersona = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/training/persona', { persona, text: systemPrompt });
      setSuccess('✅ Persona and strategy updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update persona');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadDefault = async () => {
    try {
      const { data } = await api.get('/api/training/default-persona');
      setSystemPrompt(data.text);
      setSuccess('Default persona loaded — click "Commit Changes" to save.');
    } catch (err) {
      setError('Failed to load default persona');
    }
  };

  const handleFolderUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError(null);
    setSuccess(null);
    setUploadProgress(null);

    const existingNames = new Set(knowledgeList.map((item) => item.fileName.toLowerCase()));
    const seenNames = new Set();
    const pdfFiles = selectedFiles.filter((file) => file.name.toLowerCase().endsWith('.pdf'));
    const queuedFiles = [];
    let skippedDuplicates = 0;

    pdfFiles.forEach((file) => {
      const normalizedName = file.name.toLowerCase();
      if (existingNames.has(normalizedName) || seenNames.has(normalizedName)) {
        skippedDuplicates++;
        return;
      }
      seenNames.add(normalizedName);
      queuedFiles.push(file);
    });

    if (pdfFiles.length === 0) {
      setError('No PDF files were found in that folder.');
      e.target.value = null;
      return;
    }

    if (queuedFiles.length === 0) {
      setSuccess(`Skipped ${skippedDuplicates} PDF${skippedDuplicates === 1 ? '' : 's'} already in the knowledge base.`);
      e.target.value = null;
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress({
      current: 0,
      total: queuedFiles.length,
      fileName: '',
      processed: 0,
      skipped: skippedDuplicates,
      failed: 0
    });

    let processed = 0;
    let skipped = skippedDuplicates;
    let failed = 0;
    const failedNames = [];

    for (const [index, file] of queuedFiles.entries()) {
      setUploadProgress({
        current: index + 1,
        total: queuedFiles.length,
        fileName: file.name,
        processed,
        skipped,
        failed
      });

      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('fileName', file.name);

      try {
        const { data } = await api.post('/api/training/knowledge/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (data.skipped) {
          skipped++;
        } else {
          processed++;
        }
      } catch (err) {
        failed++;
        failedNames.push(file.name);
        console.error(`Failed to upload ${file.name}:`, err);
      }
    }

    await fetchKnowledge();
    await fetchPineconeStatus();

    setUploadProgress({
      current: queuedFiles.length,
      total: queuedFiles.length,
      fileName: '',
      processed,
      skipped,
      failed
    });

    if (failed > 0) {
      setError(`Failed to ingest ${failed} PDF${failed === 1 ? '' : 's'}: ${failedNames.slice(0, 3).join(', ')}${failedNames.length > 3 ? '...' : ''}`);
    }

    const summary = `Folder ingest complete: ${processed} processed, ${skipped} skipped, ${failed} failed.`;
    setSuccess(summary);
    setUploading(false);
    e.target.value = null;
  };

  const handleDeleteKnowledge = async (fileName) => {
    if (!window.confirm(`Permanently remove knowledge extracted from "${fileName}"?`)) return;
    try {
      await api.delete(`/api/training/knowledge/${encodeURIComponent(fileName)}`);
      fetchKnowledge();
      fetchPineconeStatus();
      setSuccess(`🗑️ "${fileName}" removed from knowledge base and Pinecone`);
    } catch (err) {
      setError('Failed to delete knowledge');
    }
  };

  const handleReindex = async () => {
    if (!window.confirm('Re-index ALL knowledge into Pinecone? This may take a few minutes for large collections.')) return;
    setReindexing(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await api.post('/api/training/knowledge/reindex');
      setSuccess(`✅ Reindex complete — ${data.totalIndexed} vectors indexed into Pinecone`);
      fetchPineconeStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Reindex failed');
    } finally {
      setReindexing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/logo.png" alt="Logo" className="spinner-logo" style={{ width: '60px', height: '60px', marginBottom: '2rem', animation: 'pulse 2s infinite' }} />
        <p className="fade-in">Establishing secure connection to Hub...</p>
      </div>
    );
  }

  return (
    <div className="layout-root">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`main ${sidebarOpen ? 'main--sidebar-open' : ''}`}>
        <div className="topbar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="topbar__menu-btn">
            <img src="/logo.png" alt="Menu" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </button>
          <div className="topbar__title">AI Command Center</div>
        </div>

        <div className="training-scroll">
          <div className="training-container">
            <header className="training-header">
              <h1 className="training-title" style={{ marginTop: '1rem' }}>Sovereign AI Hub</h1>
              <p className="training-subtitle">
                Configure your AI's worldview, logical strategies, and semantic knowledge base.
              </p>
            </header>

          {/* Alert Notifications */}
          <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
            {error && <div className="alert alert--error"><span>⚠️</span> {error}</div>}
            {success && <div className="alert alert--success"><span>✅</span> {success}</div>}
          </div>

          {/* ── Pinecone Status Card ── */}
          {pineconeStatus && (
            <div className="training-card" style={{ borderColor: pineconeStatus.pineconeConfigured ? 'rgba(34,197,94,0.25)' : 'rgba(240,79,79,0.2)' }}>
              <div className="training-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.1rem' }}>🧠</span>
                Semantic Search Engine (Pinecone)
                <span style={{
                  marginLeft: 'auto',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: pineconeStatus.pineconeConfigured ? 'rgba(34,197,94,0.15)' : 'rgba(240,79,79,0.15)',
                  color: pineconeStatus.pineconeConfigured ? '#4ade80' : '#f87171',
                  border: `1px solid ${pineconeStatus.pineconeConfigured ? 'rgba(34,197,94,0.3)' : 'rgba(240,79,79,0.3)'}`,
                  letterSpacing: '0.05em'
                }}>
                  {pineconeStatus.pineconeConfigured ? '● ACTIVE' : '● NOT CONFIGURED'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MongoDB Chunks</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pineconeStatus.mongoDocuments}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search Method</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: pineconeStatus.pineconeConfigured ? '#4ade80' : '#a78bfa' }}>
                    {pineconeStatus.pineconeConfigured ? 'Semantic Vector' : 'Text Keyword'}
                  </div>
                </div>
              </div>
              {pineconeStatus.pineconeConfigured && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={handleReindex}
                    disabled={reindexing}
                    className="training-btn"
                    style={{ margin: 0, padding: '9px 18px', fontSize: '0.82rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', boxShadow: 'none' }}
                  >
                    {reindexing ? (
                      <><div className="spinner-small" /> Re-indexing...</>
                    ) : (
                      <><span>🔄</span> Re-index All Books into Pinecone</>
                    )}
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Run this if books were uploaded before Pinecone was configured
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Persona Config ── */}
          <section className="training-grid">
            <div className="training-card">
              <div className="training-label">Designated Persona</div>
              <input
                type="text"
                className="training-input"
                placeholder="e.g. Intellectual Islamic Defender"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              />
              <div className="training-subtitle" style={{ fontSize: '0.8rem', margin: '8px 0 0' }}>
                This name defines the AI's identity across all chat sessions.
              </div>
            </div>

            <div className="training-card">
              <div className="training-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                Core Logic & Strategy
                <button
                  onClick={handleLoadDefault}
                  style={{
                    marginLeft: 'auto', padding: '4px 10px', background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.25)', borderRadius: '6px',
                    color: 'var(--text-accent)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-sans)'
                  }}
                >
                  Load Default
                </button>
              </div>
              <textarea
                className="training-textarea"
                placeholder="Instructions on how to argue logically for Islam and respectfully refute other perspectives..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
              <div className="training-subtitle" style={{ fontSize: '0.8rem', margin: '8px 0 0' }}>
                Define the logical framework. The AI uses this along with your uploaded books.
              </div>
            </div>
          </section>

          <button className="save-button" onClick={handleSavePersona} disabled={saving}>
            {saving ? <div className="spinner-small" /> : null}
            {saving ? 'Synchronizing Strategy...' : 'Commit Changes to Core'}
          </button>

          {/* ── Knowledge Base ── */}
          <section className="kb-section">
            <div className="section-header">
              <h2 className="section-title">Global Knowledge Base</h2>
              <span className="training-label" style={{ opacity: 0.6 }}>
                {pineconeStatus?.pineconeConfigured ? '🧠 Semantic RAG Active' : '📝 Keyword RAG Active'}
              </span>
            </div>

            <p className="training-subtitle" style={{ margin: '0 0 2rem 0', textAlign: 'left', maxWidth: '100%' }}>
              Select a folder of scholarly PDFs. Each PDF is queued, chunked, and indexed into Pinecone for deep semantic search.
              The AI will find the most relevant passages from your books to ground every answer.
            </p>

            <div className="kb-upload-zone">
              <input
                type="file"
                id="kb-file-upload"
                onChange={handleFolderUpload}
                accept=".pdf,application/pdf"
                disabled={uploading}
                multiple
                directory=""
                webkitdirectory=""
                hidden
              />
              <label htmlFor="kb-file-upload" className={`kb-upload-label ${uploading ? 'kb-upload-label--disabled' : ''}`}>
                {uploading ? (
                  <>
                    <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1.5rem' }} />
                    <span className="training-label">Queueing PDFs one by one...</span>
                    <span style={{ fontSize: '0.78rem', marginTop: '0.5rem', opacity: 0.6 }}>
                      {uploadProgress?.fileName
                        ? `Processing ${uploadProgress.current} of ${uploadProgress.total}: ${uploadProgress.fileName}`
                        : 'Finalizing folder ingest...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="kb-upload-icon">💠</span>
                    <span className="training-label">Ingest New Knowledge Folder</span>
                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.6 }}>Select a folder · PDFs auto-detected · duplicates skipped</span>
                  </>
                )}
              </label>
              {uploadProgress && (
                <div className="kb-upload-progress">
                  <div className="kb-upload-progress__bar">
                    <div
                      className="kb-upload-progress__fill"
                      style={{
                        width: `${uploadProgress.total > 0
                          ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                  <div className="kb-upload-progress__meta">
                    <span>{uploadProgress.processed} processed</span>
                    <span>{uploadProgress.skipped} skipped</span>
                    <span>{uploadProgress.failed} failed</span>
                  </div>
                </div>
              )}
            </div>

            <div className="knowledge-list">
              {knowledgeList.length > 0 ? (
                knowledgeList.map((item) => (
                  <div key={item._id} className="knowledge-item fade-in">
                    <div className="knowledge-item__info">
                      <span className="knowledge-item__icon">
                        {item.fileType === 'pdf' ? '📜' : '🗒️'}
                      </span>
                      <div>
                        <div className="knowledge-item__name">{item.fileName}</div>
                        <div className="knowledge-item__meta">
                          {item.chunks} chunks
                          {item.pineconeIndexed
                            ? <span style={{ marginLeft: '8px', color: '#4ade80', fontSize: '0.7rem' }}>● Pinecone</span>
                            : <span style={{ marginLeft: '8px', color: '#a78bfa', fontSize: '0.7rem' }}>○ MongoDB only</span>
                          }
                        </div>
                      </div>
                    </div>
                    <button
                      className="knowledge-item__delete"
                      onClick={() => handleDeleteKnowledge(item.fileName)}
                      title="Purge Knowledge"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="knowledge-empty" style={{ gridColumn: '1 / -1' }}>
                  No knowledge sources indexed yet. Upload a PDF or TXT file above to begin.
                </div>
              )}
            </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainingPage;
