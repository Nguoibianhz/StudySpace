import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useChatHistory } from '../hooks/useChatHistory';
import { AI_MODES, getModeById } from '../lib/aiModes';
import styles from '../styles/StudySpaceChat.module.css';

const MAX_CONTEXT_MESSAGES = 7;

function buildPayloadMessages(messages) {
  const trimmed = messages.slice(-MAX_CONTEXT_MESSAGES);
  return trimmed.map((item) => {
    const parts = [];
    if (item.content) {
      parts.push({ text: item.content });
    }
    if (Array.isArray(item.attachments)) {
      item.attachments.forEach((file) => {
        if (file.data && file.mimeType.startsWith('image/')) {
          parts.push({
            inline_data: {
              data: file.data,
              mime_type: file.mimeType,
            },
          });
        }
      });
    }
    return {
      role: item.role,
      parts,
    };
  });
}

function mergeStreamText(existing, incoming) {
  if (!incoming) return existing;
  if (!existing) return incoming;
  if (incoming.startsWith(existing)) return incoming;
  return incoming;
}

export default function StudySpaceChat({ user }) {
  const userId = user?.id || user?.email;
  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    upsertConversation,
    removeConversation,
  } = useChatHistory(userId);
  const [modeId, setModeId] = useState('auto');
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const conversationId = useMemo(() => activeId || uuid(), [activeId]);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    if (!activeId) {
      const newId = uuid();
      upsertConversation(newId, {
        title: 'Cuộc trò chuyện mới',
        modeId: 'auto',
        messages: [],
      });
    }
  }, [activeId, upsertConversation]);

  useEffect(() => {
    const handlePaste = async (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      const next = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          const base64 = await blobToBase64(blob);
          next.push({
            id: uuid(),
            name: blob.name || 'pasted-image.png',
            mimeType: blob.type,
            data: base64,
          });
        }
      }
      if (next.length) {
        setAttachments((prev) => [...prev, ...next]);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return;
    setIsStreaming(true);
    setError('');

    const userMessage = {
      id: uuid(),
      role: 'user',
      content: input.trim(),
      attachments,
      createdAt: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    const nextMode = modeId;

    upsertConversation(conversationId, {
      title: newMessages[0]?.content?.slice(0, 42) || 'Cuộc trò chuyện mới',
      modeId: nextMode,
      messages: newMessages,
    });

    setInput('');
    setAttachments([]);

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modeId: nextMode,
          messages: buildPayloadMessages(newMessages),
          user: {
            id: userId,
            name: user?.name,
            email: user?.email,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody?.message || 'Gemini trả về lỗi.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let lastText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';
        for (const event of events) {
          const parsed = parseEvent(event);
          if (!parsed) continue;
          if (parsed.event === 'error') {
            throw new Error(parsed.data?.message || 'Gemini stream error');
          }
          if (parsed.event === 'done') {
            continue;
          }
          const text = parsed?.data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || '')
            ?.join('');
          if (typeof text === 'string') {
            lastText = mergeStreamText(lastText, text);
            setStreamingText(lastText);
          }
        }
      }

      const assistantMessage = {
        id: uuid(),
        role: 'model',
        content: lastText,
        createdAt: Date.now(),
      };

      upsertConversation(conversationId, {
        messages: [...newMessages, assistantMessage],
      });
      setStreamingText('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể nhận phản hồi từ StudySpace AI');
    } finally {
      setIsStreaming(false);
    }
  }, [input, attachments, messages, modeId, conversationId, upsertConversation, userId, user]);

  const stopStreaming = useCallback(() => {
    // For simplicity we only reset streaming text
    setIsStreaming(false);
    setStreamingText('');
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Lịch sử chat</h3>
          <button
            className="button-secondary"
            onClick={() => {
              const newId = uuid();
              upsertConversation(newId, {
                title: 'Cuộc trò chuyện mới',
                modeId,
                messages: [],
              });
            }}
          >
            Chat mới
          </button>
        </div>
        <div className={styles.historyList}>
          {Object.entries(conversations)
            .sort((a, b) => (b[1]?.updatedAt || 0) - (a[1]?.updatedAt || 0))
            .map(([id, convo]) => (
              <div
                key={id}
                className={`${styles.historyItem} ${id === conversationId ? styles.active : ''}`}
                onClick={() => setActiveId(id)}
              >
                <div>
                  <div className={styles.historyTitle}>{convo.title || 'Cuộc trò chuyện'}</div>
                  <div className={styles.historyMeta}>
                    {getModeById(convo.modeId)?.name || 'Auto'}
                  </div>
                </div>
                <button
                  className={styles.removeHistory}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeConversation(id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </aside>

      <section className={styles.chatPanel}>
        <div className={styles.chatHeader}>
          <div>
            <h2>StudySpace AI</h2>
            <p>Ghi nhớ tối đa 7 tin nhắn gần nhất · streaming real-time</p>
          </div>
          <div className={styles.modeSelector}>
            {AI_MODES.map((mode) => (
              <button
                key={mode.id}
                className={`${styles.modeButton} ${modeId === mode.id ? styles.modeActive : ''}`}
                onClick={() => setModeId(mode.id)}
              >
                <span>{mode.name}</span>
                <small>{mode.hint}</small>
              </button>
            ))}
          </div>
        </div>

        <div className={`${styles.messages} scrollbar-hidden`}>
          {messages.map((message) => (
            <article
              key={message.id}
              className={`chat-bubble ${message.role === 'user' ? 'user' : 'ai'}`}
            >
              {message.content}
            </article>
          ))}
          {streamingText && (
            <article className={`chat-bubble ai`}>{streamingText}</article>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.composer}>
          <textarea
            ref={inputRef}
            className="input"
            placeholder="Nhập câu hỏi của bạn, nhấn Enter để gửi (Shift+Enter xuống dòng)."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          ></textarea>
          <div className={styles.attachmentBar}>
            {attachments.map((file) => (
              <div key={file.id} className={styles.attachmentChip}>
                <span>{file.name}</span>
                <button onClick={() => removeAttachment(file.id)}>×</button>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <div className={styles.hint}>Dán ảnh (Ctrl/Cmd + V) để gửi kèm.</div>
            <div className={styles.buttons}>
              {isStreaming ? (
                <button className="button-secondary" onClick={stopStreaming}>
                  Dừng
                </button>
              ) : (
                <button className="button-primary" onClick={sendMessage}>
                  Gửi
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  function removeAttachment(id) {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }
}

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function parseEvent(block) {
  const lines = block.trim().split('\n');
  let event = 'message';
  const dataLines = [];
  lines.forEach((line) => {
    if (line.startsWith('event:')) {
      event = line.replace('event:', '').trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.replace('data:', '').trim());
    }
  });
  if (!dataLines.length) return null;
  try {
    const data = JSON.parse(dataLines.join(''));
    return { event, data };
  } catch (error) {
    console.warn('Failed to parse SSE block', block, error);
    return null;
  }
}
