import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FolderContext = createContext(null);

// Default folders every user starts with
const DEFAULT_FOLDERS = [
  { id: 'philosophy', name: 'Philosophy', color: '#a78bfa', icon: '🧠' },
  { id: 'history',    name: 'History',    color: '#60a5fa', icon: '📜' },
  { id: 'comparative',name: 'Comparative',color: '#34d399', icon: '☪️' },
];

export const FolderProvider = ({ children }) => {
  const [folders, setFolders] = useState(() => {
    try {
      const saved = localStorage.getItem('at_folders');
      return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
    } catch { return DEFAULT_FOLDERS; }
  });

  // Map of conversationId → folderId
  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('at_folder_assignments');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('at_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('at_folder_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const createFolder = useCallback((name, color = '#7c3aed', icon = '💬') => {
    const newFolder = {
      id: `folder_${Date.now()}`,
      name: name.trim(),
      color,
      icon,
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  const deleteFolder = useCallback((folderId) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    // Remove all assignments to this folder
    setAssignments(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(convId => {
        if (next[convId] === folderId) delete next[convId];
      });
      return next;
    });
  }, []);

  const renameFolder = useCallback((folderId, newName) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
  }, []);

  const assignConversation = useCallback((conversationId, folderId) => {
    setAssignments(prev => {
      const next = { ...prev };
      if (folderId === null) {
        delete next[conversationId];
      } else {
        next[conversationId] = folderId;
      }
      return next;
    });
  }, []);

  const getFolderForConversation = useCallback((conversationId) => {
    const folderId = assignments[conversationId];
    return folderId ? folders.find(f => f.id === folderId) || null : null;
  }, [assignments, folders]);

  const getConversationsInFolder = useCallback((folderId) => {
    return Object.entries(assignments)
      .filter(([, fid]) => fid === folderId)
      .map(([convId]) => convId);
  }, [assignments]);

  return (
    <FolderContext.Provider value={{
      folders, assignments,
      createFolder, deleteFolder, renameFolder,
      assignConversation, getFolderForConversation, getConversationsInFolder,
    }}>
      {children}
    </FolderContext.Provider>
  );
};

export const useFolders = () => {
  const ctx = useContext(FolderContext);
  if (!ctx) throw new Error('useFolders must be used within FolderProvider');
  return ctx;
};