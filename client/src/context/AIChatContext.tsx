import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  streaming?: boolean;
}

interface AIChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  isStreaming: boolean;
  aiStatus: { configured: boolean; mock: boolean; message: string };
  sendMessage: (text: string, context?: { skillId?: string; skillTitle?: string; lessonId?: string }) => Promise<void>;
  generateQuiz: (topic: string, count?: number) => Promise<any[]>;
  summarizeLesson: (title: string, description: string) => Promise<string>;
  toggleChat: () => void;
  clearChat: () => void;
  loadHistory: (skillId?: string) => Promise<void>;
  checkStatus: () => Promise<void>;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const AIChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiStatus, setAiStatus] = useState({ configured: false, mock: true, message: 'Checking...' });
  const messagesRef = useRef<ChatMessage[]>([]);
  const streamMsgId = useRef<string | null>(null);

  messagesRef.current = messages;

  const checkStatus = useCallback(async () => {
    try {
      const data = await apiRequest('/api/v1/ai/status');
      setAiStatus({
        configured: data.configs?.openai || false,
        mock: data.usingMock,
        message: data.message || '',
      });
    } catch {
      setAiStatus({ configured: false, mock: true, message: 'Could not connect to AI service' });
    }
  }, []);

  const sendMessage = useCallback(async (text: string, context?: { skillId?: string; skillTitle?: string; lessonId?: string }) => {
    if (!text.trim() || isTyping || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const assistantId = `ai-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsTyping(true);
    setIsStreaming(true);
    streamMsgId.current = assistantId;

    try {
      const token = localStorage.getItem('afterbell_token');
      const res = await fetch('/api/v1/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ message: text.trim(), context: context || {} }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.done) { streamDone = true; break; }
            if (data.clear) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: data.content }
                    : m
                )
              );
              streamDone = true;
              break;
            }
            if (data.content) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + data.content }
                    : m
                )
              );
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, I had trouble connecting. Please try again.' }
            : m
        )
      );
    } finally {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );
      setIsTyping(false);
      setIsStreaming(false);
      streamMsgId.current = null;
    }
  }, [isTyping, isStreaming]);

  const generateQuiz = useCallback(async (topic: string, count = 5): Promise<any[]> => {
    try {
      const data = await apiRequest('/api/v1/ai/quiz', {
        method: 'POST',
        body: JSON.stringify({ topic: topic.trim(), count }),
      });
      return data.questions || [];
    } catch {
      return [];
    }
  }, []);

  const summarizeLesson = useCallback(async (title: string, description: string): Promise<string> => {
    try {
      const data = await apiRequest('/api/v1/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      return data.summary || 'Summary not available.';
    } catch {
      return 'Could not generate summary. Please try again.';
    }
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!messagesRef.current.length) {
      checkStatus();
    }
  }, [checkStatus]);

  const clearChat = useCallback(async () => {
    try {
      await apiRequest('/api/v1/ai/history', { method: 'DELETE' });
    } catch {}
    setMessages([]);
  }, []);

  const loadHistory = useCallback(async (skillId?: string) => {
    try {
      const params = skillId ? `?skillId=${skillId}` : '';
      const data = await apiRequest(`/api/v1/ai/history${params}`);
      setMessages((data.messages || []).map((m: any) => ({
        id: m._id || `${m.role}-${m.createdAt}`,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt).getTime(),
      })));
    } catch {}
  }, []);

  return (
    <AIChatContext.Provider value={{
      messages, isOpen, isTyping, isStreaming, aiStatus,
      sendMessage, generateQuiz, summarizeLesson,
      toggleChat, clearChat, loadHistory, checkStatus,
    }}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};