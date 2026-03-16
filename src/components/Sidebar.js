import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useFolders } from "../context/FolderContext";

const Sidebar = ({ isOpen, onToggle }) => {
  const {
    conversations,
    createConversation,
    deleteConversation,
    renameConversation,
    loading,
  } = useChat();
  const { user, logout } = useAuth();
  const {
    folders,
    assignments,
    assignConversation,
    createFolder,
  } = useFolders();
  const navigate = useNavigate();
  const { id: activeId } = useParams();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [hoverId, setHoverId] = useState(null);

  // Folder UI state
  const [activeFolderFilter, setActiveFolderFilter] = useState(null); // null = show all
  const [showFolderMenu, setShowFolderMenu] = useState(null); // conv._id showing folder picker
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  const handleNewChat = async () => {
    const conv = await createConversation();
    if (conv) navigate(`/chat/${conv._id}`);
  };

  const handleSelect = (conv) => {
    if (editingId) return;
    setShowFolderMenu(null);
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
    if (window.confirm("Delete this conversation?")) {
      await deleteConversation(id);
      if (activeId === id) navigate("/chat");
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const groupByDate = (convs) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const week = new Date(today);
    week.setDate(today.getDate() - 7);
    const groups = { Today: [], Yesterday: [], "This Week": [], Older: [] };
    convs.forEach((c) => {
      const d = new Date(c.updatedAt || c.createdAt);
      d.setHours(0, 0, 0, 0);
      if (d >= today) groups["Today"].push(c);
      else if (d >= yesterday) groups["Yesterday"].push(c);
      else if (d >= week) groups["This Week"].push(c);
      else groups["Older"].push(c);
    });
    return groups;
  };

  // Filter conversations by folder if one is selected
  const filteredConversations = activeFolderFilter
    ? conversations.filter((c) => assignments[c._id] === activeFolderFilter)
    : conversations;

  const groups = groupByDate(filteredConversations);

  return (
    <>
      {isOpen && <div className="sidebar__overlay" onClick={onToggle} />}

      <aside className={`sidebar${isOpen ? "" : " sidebar--closed"}`}>
        {/* Header */}
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <span className="sidebar__logo-text">AnonymousThinker</span>
          </div>
          <button
            onClick={handleNewChat}
            className="sidebar__new-btn"
            title="New Chat"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Folder tabs */}
        <div className="sidebar__folders">
          <button
            className={`sidebar__folder-tab${!activeFolderFilter ? " sidebar__folder-tab--active" : ""}`}
            onClick={() => setActiveFolderFilter(null)}
          >
            All
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              className={`sidebar__folder-tab${activeFolderFilter === f.id ? " sidebar__folder-tab--active" : ""}`}
              style={
                activeFolderFilter === f.id
                  ? { borderColor: f.color, color: f.color }
                  : {}
              }
              onClick={() =>
                setActiveFolderFilter(activeFolderFilter === f.id ? null : f.id)
              }
              title={f.name}
            >
              {f.icon}
            </button>
          ))}
          <button
            className="sidebar__folder-tab sidebar__folder-tab--add"
            onClick={() => setShowNewFolder(!showNewFolder)}
            title="New folder"
          >
            +
          </button>
        </div>

        {/* New folder input */}
        {showNewFolder && (
          <div className="sidebar__new-folder">
            <input
              className="sidebar__edit-input"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              autoFocus
            />
            <button
              className="sidebar__action-btn"
              onClick={handleCreateFolder}
              title="Create"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Conversation list */}
        <div className="sidebar__list">
          {loading && conversations.length === 0 ? (
            <div className="sidebar__loading">Loading chats...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="sidebar__empty">
              <p>
                {activeFolderFilter
                  ? "No chats in this folder"
                  : "No conversations yet"}
              </p>
              <p>
                {activeFolderFilter
                  ? "Assign chats using the folder icon"
                  : "Start a new chat to begin"}
              </p>
            </div>
          ) : (
            Object.entries(groups).map(
              ([groupName, items]) =>
                items.length > 0 && (
                  <div key={groupName}>
                    <div className="sidebar__group-label">{groupName}</div>
                    {items.map((conv) => {
                      const folder = assignments[conv._id]
                        ? folders.find((f) => f.id === assignments[conv._id])
                        : null;
                      return (
                        <div
                          key={conv._id}
                          onClick={() => handleSelect(conv)}
                          onMouseEnter={() => setHoverId(conv._id)}
                          onMouseLeave={() => setHoverId(null)}
                          className={`sidebar__item${activeId === conv._id ? " sidebar__item--active" : ""}`}
                        >
                          {/* folder colour dot */}
                          {folder ? (
                            <span style={{ fontSize: "11px", flexShrink: 0 }}>
                              {folder.icon}
                            </span>
                          ) : (
                            <svg
                              className="sidebar__item-icon"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          )}

                          {editingId === conv._id ? (
                            <input
                              className="sidebar__edit-input"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => saveRename(conv._id)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && saveRename(conv._id)
                              }
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          ) : (
                            <span className="sidebar__item-title">
                              {conv.title}
                            </span>
                          )}

                          {(hoverId === conv._id || activeId === conv._id) &&
                            editingId !== conv._id && (
                              <div
                                className="sidebar__item-actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* folder assign button */}
                                <button
                                  className="sidebar__action-btn"
                                  title="Move to folder"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFolderMenu(
                                      showFolderMenu === conv._id
                                        ? null
                                        : conv._id,
                                    );
                                  }}
                                >
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => startRename(conv, e)}
                                  className="sidebar__action-btn"
                                  title="Rename"
                                >
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => handleDelete(conv._id, e)}
                                  className="sidebar__action-btn sidebar__action-btn--delete"
                                  title="Delete"
                                >
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                  </svg>
                                </button>
                              </div>
                            )}

                          {/* Folder picker dropdown */}
                          {showFolderMenu === conv._id && (
                            <div
                              className="sidebar__folder-picker"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className="sidebar__folder-option"
                                onClick={() => {
                                  assignConversation(conv._id, null);
                                  setShowFolderMenu(null);
                                }}
                              >
                                🚫 None
                              </div>
                              {folders.map((f) => (
                                <div
                                  key={f.id}
                                  className={`sidebar__folder-option${assignments[conv._id] === f.id ? " sidebar__folder-option--active" : ""}`}
                                  onClick={() => {
                                    assignConversation(conv._id, f.id);
                                    setShowFolderMenu(null);
                                  }}
                                >
                                  {f.icon} {f.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ),
            )
          )}
        </div>

        {/* Footer */}
        <div className="sidebar__footer">
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/training")}
              className="sidebar__footer-btn"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Train AI
            </button>
          )}
          <div className="sidebar__user-row">
            <div
              className="sidebar__user-avatar"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
              title="Profile & Settings"
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span
              className="sidebar__user-name"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
              title="Profile & Settings"
            >
              {user?.username}
            </span>
            <button
              onClick={() => navigate("/profile")}
              className="sidebar__action-btn"
              title="Settings"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="sidebar__logout-btn"
              title="Logout"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
