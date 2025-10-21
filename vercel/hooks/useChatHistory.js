import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'studyspace.chat.history';

function normalizeHistory(raw = {}) {
  const entries = Object.entries(raw || {});
  return entries.reduce((acc, [id, convo]) => {
    if (!Array.isArray(convo?.messages)) return acc;
    acc[id] = {
      ...convo,
      updatedAt: convo.updatedAt || Date.now(),
    };
    return acc;
  }, {});
}

export function useChatHistory(userId) {
  const storageId = userId ? `${STORAGE_KEY}.${userId}` : STORAGE_KEY;
  const [conversations, setConversations] = useState({});
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageId);
      if (raw) {
        const parsed = JSON.parse(raw);
        setConversations(normalizeHistory(parsed));
        const latest = Object.entries(parsed || {})
          .sort((a, b) => (b[1]?.updatedAt || 0) - (a[1]?.updatedAt || 0))
          .map(([id]) => id)[0];
        if (latest) setActiveId(latest);
      }
    } catch (error) {
      console.warn('Failed to restore chat history', error);
    }
  }, [storageId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageId, JSON.stringify(conversations));
    } catch (error) {
      console.warn('Failed to persist chat history', error);
    }
  }, [storageId, conversations]);

  const activeConversation = useMemo(() => {
    if (!activeId) return null;
    return conversations[activeId] || null;
  }, [activeId, conversations]);

  const upsertConversation = useCallback((id, data) => {
    setConversations((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...data,
        updatedAt: Date.now(),
      },
    }));
    setActiveId(id);
  }, []);

  const removeConversation = useCallback((id) => {
    setConversations((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const reset = useCallback(() => {
    setConversations({});
    setActiveId(null);
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    upsertConversation,
    removeConversation,
    reset,
  };
}
