import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

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
      const res = await axios.get('/api/chat/conversations');
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
      const res = await axios.post('/api/chat/conversations', { title: 'New Chat' });
      const newConv = res.data;
      setConversations(prev => [{
        ...newConv,
        messageCount: 0,
        lastMessage: ''
      }, ...prev]);
      setCurrentConversation(newConv);
      return newConv;
    } catch (err) {
      setError('Failed to create conversation');
    }
  }, []);

  const loadConversation = useCallback(async (id) => {
    if (!id) return;

    // Don't reload if already the current one
    if (currentConversation?._id === id && currentConversation.messages?.length > 0) {
      return currentConversation;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/chat/conversations/${id}`);
      setCurrentConversation(res.data);
      return res.data;
    } catch (err) {
      // Only set error if it's not a cancelled request or a simple navigation hiccup
      if (err.response?.status !== 404 || !currentConversation) {
        setError('Failed to load conversation');
      }
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentConversation]);

  const sendMessage = useCallback(async (conversationId, content, compare = false) => {
    try {
      setSending(true);
      setError(null);
      const res = await axios.post(
        `/api/chat/conversations/${conversationId}/message`,
        { content, compare }
      );

      const { userMessage, assistantMessage, title } = res.data;

      // Update current conversation with new messages
      setCurrentConversation(prev => {
        if (!prev || prev._id !== conversationId) return prev;
        return {
          ...prev,
          title,
          messages: [...prev.messages, userMessage, assistantMessage]
        };
      });

      // Update sidebar preview
      setConversations(prev => prev.map(conv =>
        conv._id === conversationId
          ? { ...conv, title, lastMessage: assistantMessage.content.substring(0, 100), updatedAt: new Date() }
          : conv
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));

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
      await axios.delete(`/api/chat/conversations/${id}`);
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
      await axios.put(`/api/chat/conversations/${id}`, { title });
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

  return (
    <ChatContext.Provider value={{
      conversations, currentConversation, loading, sending, error,
      fetchConversations, createConversation, loadConversation,
      sendMessage, deleteConversation, renameConversation,
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
