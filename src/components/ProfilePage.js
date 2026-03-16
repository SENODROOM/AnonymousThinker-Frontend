import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { SHORTCUTS } from '../utils/useKeyboardShortcuts';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const isMac = navigator.platform.toUpperCase().includes('MAC');

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting, resetSettings, playSound } = useSettings();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Active tab
  const [tab, setTab] = useState('profile'); // 'profile' | 'appearance' | 'sound' | 'shortcuts'

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/api/auth/password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwSuccess('✅ Password updated successfully');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const previewSound = useCallback((type) => {
    playSound(type === 'send' ? 'send' : 'receive');
  }, [playSound]);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const TABS = [
    { id: 'profile',    label: 'Profile',    icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'sound',      label: 'Sound',      icon: '🔊' },
    { id: 'shortcuts',  label: 'Shortcuts',  icon: '⌨️' },
  ];

  return (
    <div className="layout-root">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`main${sidebarOpen ? ' main--sidebar-open' : ''}`}>
        {/* Topbar */}
        <div className="topbar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="topbar__menu-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="topbar__title">Settings &amp; Profile</div>
          <button onClick={() => navigate('/chat')} className="topbar__icon-btn" title="Back to chat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>

        <div className="profile-page">
          {/* Tab nav */}
          <nav className="profile-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`profile-tab${tab === t.id ? ' profile-tab--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </nav>

          <div className="profile-content">

            {/* ── PROFILE TAB ─────────────────────────────────────────── */}
            {tab === 'profile' && (
              <div className="profile-section-group">
                {/* Avatar & Info card */}
                <div className="profile-card">
                  <div className="profile-avatar-area">
                    <div className="profile-avatar-xl">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="profile-username">{user?.username}</div>
                      <div className="profile-email">{user?.email}</div>
                      <div className="profile-meta">
                        <span className={`profile-badge${user?.role === 'admin' ? ' profile-badge--admin' : ''}`}>
                          {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
                        </span>
                        <span className="profile-meta-text">Joined {joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change password */}
                <div className="profile-card">
                  <div className="profile-card__title">Change Password</div>
                  {pwError && <div className="profile-alert profile-alert--error">{pwError}</div>}
                  {pwSuccess && <div className="profile-alert profile-alert--success">{pwSuccess}</div>}
                  <form onSubmit={handlePasswordChange} className="profile-form">
                    {[
                      { label: 'Current Password', key: 'current', placeholder: '••••••••' },
                      { label: 'New Password', key: 'next', placeholder: '••••••••' },
                      { label: 'Confirm New Password', key: 'confirm', placeholder: '••••••••' },
                    ].map(f => (
                      <div className="profile-field" key={f.key}>
                        <label className="profile-label">{f.label}</label>
                        <input
                          className="profile-input"
                          type="password"
                          placeholder={f.placeholder}
                          value={pwForm[f.key]}
                          onChange={e => setPwForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          required
                        />
                      </div>
                    ))}
                    <button type="submit" className="profile-btn" disabled={pwLoading}>
                      {pwLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Danger zone */}
                <div className="profile-card profile-card--danger">
                  <div className="profile-card__title" style={{ color: '#f87171' }}>Danger Zone</div>
                  <p className="profile-hint">Logging out will clear your session token.</p>
                  <button
                    className="profile-btn profile-btn--danger"
                    onClick={() => { logout(); navigate('/login'); }}
                  >
                    Sign out of this device
                  </button>
                </div>
              </div>
            )}

            {/* ── APPEARANCE TAB ──────────────────────────────────────── */}
            {tab === 'appearance' && (
              <div className="profile-section-group">
                <div className="profile-card">
                  <div className="profile-card__title">Theme</div>

                  <div className="theme-selector">
                    {['dark', 'light'].map(t => (
                      <button
                        key={t}
                        className={`theme-option${theme === t ? ' theme-option--active' : ''}`}
                        onClick={() => theme !== t && toggleTheme()}
                      >
                        <div className={`theme-preview theme-preview--${t}`}>
                          <div className="theme-preview__sidebar" />
                          <div className="theme-preview__main">
                            <div className="theme-preview__bubble theme-preview__bubble--ai" />
                            <div className="theme-preview__bubble theme-preview__bubble--user" />
                          </div>
                        </div>
                        <span className="theme-label">
                          {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                          {theme === t && <span className="theme-active-dot">●</span>}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="profile-hint">
                    Shortcut: {isMac ? '⌘ + ⇧ + D' : 'Ctrl + Shift + D'}
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-card__title">Font Size</div>
                  <div className="radio-group">
                    {[
                      { val: 'sm', label: 'Small', desc: '13px' },
                      { val: 'md', label: 'Medium', desc: '15px' },
                      { val: 'lg', label: 'Large',  desc: '17px' },
                    ].map(opt => (
                      <label key={opt.val} className={`radio-option${settings.fontSize === opt.val ? ' radio-option--active' : ''}`}>
                        <input
                          type="radio"
                          name="fontSize"
                          value={opt.val}
                          checked={settings.fontSize === opt.val}
                          onChange={() => updateSetting('fontSize', opt.val)}
                          hidden
                        />
                        <span className="radio-dot" />
                        <span className="radio-label">{opt.label}</span>
                        <span className="radio-desc">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-card__title">Layout</div>
                  <label className="toggle-row">
                    <div>
                      <div className="toggle-row__label">Compact Mode</div>
                      <div className="toggle-row__desc">Tighter message spacing for more content on screen</div>
                    </div>
                    <button
                      className={`toggle-btn${settings.compactMode ? ' toggle-btn--on' : ''}`}
                      onClick={() => updateSetting('compactMode', !settings.compactMode)}
                    >
                      <span className="toggle-btn__knob" />
                    </button>
                  </label>
                </div>

                <button className="profile-btn profile-btn--ghost" onClick={resetSettings}>
                  Reset all settings to defaults
                </button>
              </div>
            )}

            {/* ── SOUND TAB ───────────────────────────────────────────── */}
            {tab === 'sound' && (
              <div className="profile-section-group">
                <div className="profile-card">
                  <div className="profile-card__title">Notification Sounds</div>

                  <label className="toggle-row">
                    <div>
                      <div className="toggle-row__label">Enable Sounds</div>
                      <div className="toggle-row__desc">Play audio feedback when sending and receiving messages</div>
                    </div>
                    <button
                      className={`toggle-btn${settings.soundEnabled ? ' toggle-btn--on' : ''}`}
                      onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                    >
                      <span className="toggle-btn__knob" />
                    </button>
                  </label>

                  {settings.soundEnabled && (
                    <>
                      <div className="profile-divider" />

                      <div className="profile-field">
                        <label className="profile-label">Master Volume</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={settings.soundVolume}
                            onChange={e => updateSetting('soundVolume', parseFloat(e.target.value))}
                            className="profile-range"
                          />
                          <span className="profile-hint">{Math.round(settings.soundVolume * 100)}%</span>
                        </div>
                      </div>

                      <div className="profile-divider" />

                      <div className="profile-field">
                        <label className="profile-label">Send Sound</label>
                        <div className="sound-selector">
                          {['whoosh', 'pop', 'none'].map(s => (
                            <button
                              key={s}
                              className={`sound-option${settings.sendSound === s ? ' sound-option--active' : ''}`}
                              onClick={() => { updateSetting('sendSound', s); if (s !== 'none') previewSound('send'); }}
                            >
                              {s === 'whoosh' ? '💨 Whoosh' : s === 'pop' ? '🫧 Pop' : '🔇 None'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="profile-field" style={{ marginTop: '16px' }}>
                        <label className="profile-label">Receive Sound</label>
                        <div className="sound-selector">
                          {['chime', 'ding', 'none'].map(s => (
                            <button
                              key={s}
                              className={`sound-option${settings.receiveSound === s ? ' sound-option--active' : ''}`}
                              onClick={() => { updateSetting('receiveSound', s); if (s !== 'none') previewSound('receive'); }}
                            >
                              {s === 'chime' ? '🎐 Chime' : s === 'ding' ? '🔔 Ding' : '🔇 None'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="profile-card">
                  <div className="profile-card__title">Voice Input Language</div>
                  <div className="profile-hint" style={{ marginBottom: '12px' }}>
                    Language used when transcribing your voice messages.
                  </div>
                  <select
                    className="profile-select"
                    value={settings.voiceInputLang}
                    onChange={e => updateSetting('voiceInputLang', e.target.value)}
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="ar-SA">Arabic (Saudi Arabia)</option>
                    <option value="ar-EG">Arabic (Egypt)</option>
                    <option value="ur-PK">Urdu (Pakistan)</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="es-ES">Spanish</option>
                    <option value="tr-TR">Turkish</option>
                  </select>
                </div>
              </div>
            )}

            {/* ── SHORTCUTS TAB ───────────────────────────────────────── */}
            {tab === 'shortcuts' && (
              <div className="profile-section-group">
                <div className="profile-card">
                  <div className="profile-card__title">Keyboard Shortcuts</div>

                  <label className="toggle-row" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="toggle-row__label">Enable keyboard shortcuts</div>
                      <div className="toggle-row__desc">Global hotkeys for faster navigation</div>
                    </div>
                    <button
                      className={`toggle-btn${settings.keyboardShortcuts ? ' toggle-btn--on' : ''}`}
                      onClick={() => updateSetting('keyboardShortcuts', !settings.keyboardShortcuts)}
                    >
                      <span className="toggle-btn__knob" />
                    </button>
                  </label>

                  <div className="shortcuts-table">
                    {SHORTCUTS.map((s, i) => (
                      <div key={i} className="shortcut-row">
                        <span className="shortcut-label">{s.label}</span>
                        <div className="shortcut-keys">
                          {(isMac ? s.mac : s.keys).map((k, j) => (
                            <React.Fragment key={j}>
                              <kbd className="kbd">{k}</kbd>
                              {j < (isMac ? s.mac : s.keys).length - 1 && <span className="kbd-plus">+</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;