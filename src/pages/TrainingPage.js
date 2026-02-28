import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchTrainingData = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/training/persona');
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
      const { data } = await axios.get('/api/training/knowledge');
      setKnowledgeList(data);
    } catch (err) {
      console.error('Failed to fetch knowledge:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrainingData();
    fetchKnowledge();
  }, [fetchTrainingData, fetchKnowledge]);

  const handleSavePersona = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post('/api/training/persona', {
        persona,
        text: systemPrompt
      });
      setSuccess('Persona and strategy updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update persona');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/training/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(`Knowledge source "${file.name}" added`);
      fetchKnowledge();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDeleteKnowledge = async (fileName) => {
    if (!window.confirm(`Permanently remove knowledge extracted from "${fileName}"?`)) return;

    try {
      await axios.delete(`/api/training/knowledge/${encodeURIComponent(fileName)}`);
      fetchKnowledge();
      setSuccess('Knowledge source removed');
    } catch (err) {
      setError('Failed to delete knowledge');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="topbar__title">AI Command Center</div>
        </div>

        <div className="training-container">

          <header className="training-header">
            <h1 className="training-title" style={{ marginTop: '1rem' }}>Sovereign AI Hub</h1>
            <p className="training-subtitle">
              Configure your AI's worldview and logical defense strategies.
            </p>
          </header>

          {/* Alert Notification Area */}
          <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div className="alert alert--error"><span>⚠️</span> {error}</div>}
            {success && <div className="alert alert--success"><span>✅</span> {success}</div>}
          </div>

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
              <div className="training-subtitle" style={{ fontSize: '0.8rem', margin: 0 }}>
                This name defines the AI's identity across all chat sessions.
              </div>
            </div>

            <div className="training-card">
              <div className="training-label">Core Logic & Strategy</div>
              <textarea
                className="training-textarea"
                placeholder="Instructions on how to refute atheistic claims logically..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
              <div className="training-subtitle" style={{ fontSize: '0.8rem', margin: 0 }}>
                Define the logical framework the AI must follow.
              </div>
            </div>
          </section>

          <button
            className="save-button"
            onClick={handleSavePersona}
            disabled={saving}
          >
            {saving ? <div className="spinner-small" /> : null}
            {saving ? 'Synchronizing Strategy...' : 'Commit Changes to Core'}
          </button>

          <section className="kb-section">
            <div className="section-header">
              <h2 className="section-title">Global Knowledge Base</h2>
              <span className="training-label" style={{ opacity: 0.6 }}>RAG System Active</span>
            </div>

            <p className="training-subtitle" style={{ margin: '0 0 2rem 0', textAlign: 'left', maxWidth: '100%' }}>
              Upload scholarly PDFs or text logs. The AI will prioritize this data when generating proofs or logical refutations.
            </p>

            <div className="kb-upload-zone">
              <input
                type="file"
                id="kb-file-upload"
                onChange={handleFileUpload}
                accept=".pdf,.txt"
                disabled={uploading}
                hidden
              />
              <label htmlFor="kb-file-upload" className={`kb-upload-label ${uploading ? 'kb-upload-label--disabled' : ''}`}>
                {uploading ? (
                  <>
                    <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1.5rem' }} />
                    <span className="training-label">Analyzing & Indexing...</span>
                  </>
                ) : (
                  <>
                    <span className="kb-upload-icon">💠</span>
                    <span className="training-label">Ingest New Knowledge Source</span>
                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.6 }}>Supports PDF and TXT</span>
                  </>
                )}
              </label>
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
                        <div className="knowledge-item__meta">{item.chunks} logical snippets</div>
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
                  No knowledge sources indexed yet. Start by uploading a file above.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TrainingPage;