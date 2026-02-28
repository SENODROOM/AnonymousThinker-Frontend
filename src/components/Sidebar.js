import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { conversations, createConversation, deleteConversation, renameConversation, loading } = useChat();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoverId, setHoverId] = useState(null);

  const handleNewChat = async () => {
    const conv = await createConversation();
    if (conv) navigate(`/chat/${conv._id}`);
  };

  const handleSelect = (conv) => {
    navigate(`/chat/${conv._id}`);
  };

  const startRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  const saveRename = async (id) => {
    if (editTitle.trim()) await renameConversation(id, editTitle.trim());
    setEditingId(null);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteConversation(id);
      if (activeId === id) navigate('/chat');
    }
  };

  const groupByDate = (convs) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const week = new Date(today); week.setDate(today.getDate() - 7);
    const groups = { Today: [], Yesterday: [], 'This Week': [], Older: [] };
    convs.forEach(c => {
      const d = new Date(c.updatedAt || c.createdAt); d.setHours(0, 0, 0, 0);
      if (d >= today) groups['Today'].push(c);
      else if (d >= yesterday) groups['Yesterday'].push(c);
      else if (d >= week) groups['This Week'].push(c);
      else groups['Older'].push(c);
    });
    return groups;
  };

  const groups = groupByDate(conversations);

  return (
    <>
      {isOpen && (
        <div className="sidebar__overlay" onClick={onToggle} />
      )}

      <aside className={`sidebar${isOpen ? '' : ' sidebar--closed'}`}>
        {/* Header */}
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="sidebar__logo-text">AnonymousThinker</span>
          </div>
          <button onClick={handleNewChat} className="sidebar__new-btn" title="New Chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Conversations */}
        <div className="sidebar__list">
          {loading && conversations.length === 0 ? (
            <div className="sidebar__loading">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="sidebar__empty">
              <p>No conversations yet</p>
              <p>Start a new chat above</p>
            </div>
          ) : (
            Object.entries(groups).map(([groupName, items]) =>
              items.length > 0 && (
                <div key={groupName}>
                  <div className="sidebar__group-label">{groupName}</div>
                  {items.map(conv => (
                    <div
                      key={conv._id}
                      onClick={() => handleSelect(conv)}
                      onMouseEnter={() => setHoverId(conv._id)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`sidebar__item${activeId === conv._id ? ' sidebar__item--active' : ''}`}
                    >
                      <svg className="sidebar__item-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>

                      {editingId === conv._id ? (
                        <input
                          className="sidebar__edit-input"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={() => saveRename(conv._id)}
                          onKeyDown={e => e.key === 'Enter' && saveRename(conv._id)}
                          onClick={e => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span className="sidebar__item-title">{conv.title}</span>
                      )}

                      {(hoverId === conv._id || activeId === conv._id) && editingId !== conv._id && (
                        <div className="sidebar__item-actions" onClick={e => e.stopPropagation()}>
                          <button onClick={(e) => startRename(conv, e)} className="sidebar__action-btn" title="Rename">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button onClick={(e) => handleDelete(conv._id, e)} className="sidebar__action-btn sidebar__action-btn--delete" title="Delete">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </div>

        {/* Footer */}
        <div className="sidebar__footer">
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/training')} className="sidebar__footer-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Train AI
            </button>
          )}
          <div className="sidebar__user-row">
            <div className="sidebar__user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <span className="sidebar__user-name">{user?.username}</span>
            <button onClick={logout} className="sidebar__logout-btn" title="Logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;