import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/chat/conversations');
      setConversations(res.data);
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async () => {
    try {
      setError(null);
      const res = await api.post('/api/chat/conversations', { title: 'New Chat' });
      const newConv = res.data;
      setConversations(prev => [{
        ...newConv,
        messageCount: 0,
        lastMessage: '',
        isPinned: false
      }, ...prev]);
      setCurrentConversation(newConv);
      return newConv;
    } catch (err) {
      setError('Failed to create conversation');
    }
  }, []);

  const loadConversation = useCallback(async (id) => {
    if (!id) return;
    if (currentConversation?._id === id && currentConversation.messages?.length > 0) {
      return currentConversation;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/chat/conversations/${id}`);
      setCurrentConversation(res.data);
      return res.data;
    } catch (err) {
      if (err.response?.status !== 404 || !currentConversation) {
        setError('Failed to load conversation');
      }
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentConversation]);

  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      setSending(true);
      setError(null);
      const res = await api.post(
        `/api/chat/conversations/${conversationId}/message`,
        { content }
      );

      const { userMessage, assistantMessage, title } = res.data;

      setCurrentConversation(prev => {
        if (!prev || prev._id !== conversationId) return prev;
        return {
          ...prev,
          title,
          messages: [...prev.messages, userMessage, assistantMessage]
        };
      });

      setConversations(prev => prev.map(conv =>
        conv._id === conversationId
          ? { ...conv, title, lastMessage: assistantMessage.content.substring(0, 100), updatedAt: new Date() }
          : conv
      ).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }));

      return { userMessage, assistantMessage };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to send message';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setSending(false);
    }
  }, []);

  const deleteConversation = useCallback(async (id) => {
    try {
      setError(null);
      await api.delete(`/api/chat/conversations/${id}`);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (currentConversation?._id === id) {
        setCurrentConversation(null);
      }
    } catch (err) {
      setError('Failed to delete conversation');
    }
  }, [currentConversation]);

  const renameConversation = useCallback(async (id, title) => {
    try {
      setError(null);
      await api.put(`/api/chat/conversations/${id}`, { title });
      setConversations(prev => prev.map(c =>
        c._id === id ? { ...c, title } : c
      ));
      if (currentConversation?._id === id) {
        setCurrentConversation(prev => ({ ...prev, title }));
      }
    } catch (err) {
      setError('Failed to rename conversation');
    }
  }, [currentConversation]);

  // ── NEW: Pin / Unpin ─────────────────────────────────────────────────────────
  const togglePin = useCallback(async (id) => {
    try {
      const res = await api.patch(`/api/chat/conversations/${id}/pin`);
      const { isPinned } = res.data;
      setConversations(prev => prev.map(c =>
        c._id === id ? { ...c, isPinned } : c
      ).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }));
    } catch (err) {
      setError('Failed to pin conversation');
    }
  }, []);

  // ── NEW: Archive ─────────────────────────────────────────────────────────────
  const archiveConversation = useCallback(async (id) => {
    try {
      await api.patch(`/api/chat/conversations/${id}/archive`);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (currentConversation?._id === id) setCurrentConversation(null);
    } catch (err) {
      setError('Failed to archive conversation');
    }
  }, [currentConversation]);

  // ── NEW: Message reaction ─────────────────────────────────────────────────────
  const reactToMessage = useCallback(async (conversationId, msgIndex, reaction) => {
    try {
      const res = await api.post(
        `/api/chat/conversations/${conversationId}/messages/${msgIndex}/react`,
        { reaction }
      );
      const { reactions, userReaction } = res.data;

      setCurrentConversation(prev => {
        if (!prev || prev._id !== conversationId) return prev;
        const messages = [...prev.messages];
        messages[msgIndex] = { ...messages[msgIndex], reactions, userReaction };
        return { ...prev, messages };
      });
    } catch (err) {
      console.error('Reaction error:', err);
    }
  }, []);

  // ── NEW: Export conversation ─────────────────────────────────────────────────
  const exportConversation = useCallback(async (id, title) => {
    try {
      const res = await api.get(`/api/chat/conversations/${id}/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/plain' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(title || 'conversation').replace(/[^a-z0-9]/gi, '_')}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export conversation');
    }
  }, []);

  return (
    <ChatContext.Provider value={{
      conversations, currentConversation, loading, sending, error,
      fetchConversations, createConversation, loadConversation,
      sendMessage, deleteConversation, renameConversation,
      togglePin, archiveConversation, reactToMessage, exportConversation,
      setCurrentConversation, setError
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};