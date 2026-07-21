import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAIChat } from '../context/AIChatContext';
import { FiMessageSquare, FiX, FiSend, FiTrash2, FiCpu, FiRefreshCw, FiUser, FiZap } from 'react-icons/fi';

const AIChatBot: React.FC = () => {
  const { messages, isOpen, isTyping, isStreaming, aiStatus, sendMessage, toggleChat, clearChat, loadHistory } = useAIChat();
  const [input, setInput] = useState('');
  const [context, setContext] = useState<{ skillId?: string; skillTitle?: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, loadHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const text = input;
    setInput('');
    await sendMessage(text, Object.keys(context).length ? context : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = context.skillTitle
    ? [
        `Explain ${context.skillTitle} simply`,
        `Give me an example of ${context.skillTitle}`,
        `Quiz me on ${context.skillTitle}`,
        `Why is ${context.skillTitle} important?`,
      ]
    : [
        'What life skills should I learn?',
        'How do I stay motivated?',
        'Help me with time management',
        'Give me study tips',
      ];

  return (
    <>
      {/* Chat button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-secondary-green to-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-secondary-green/30 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-10rem)] bg-slate-800/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-slate-800/80">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-secondary-green to-emerald-600 rounded-lg flex items-center justify-center">
                  <FiCpu className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">AI Study Buddy</h3>
                  <p className="text-xs text-slate-400">
                    {aiStatus.mock ? 'Offline mode' : 'AI Powered'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => loadHistory()}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
                  title="Refresh"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                  title="Clear chat"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary-green/20 to-emerald-600/20 rounded-2xl flex items-center justify-center">
                    <FiZap className="w-8 h-8 text-secondary-green" />
                  </div>
                  <p className="text-white font-medium mb-1">Hi! I'm your AI study buddy</p>
                  <p className="text-slate-400 text-sm mb-4">Ask me anything about life skills, learning, or personal growth</p>
                  <div className="space-y-2">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(q);
                          sendMessage(q, Object.keys(context).length ? context : undefined);
                        }}
                        className="block w-full text-left text-sm px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  {aiStatus.mock && (
                    <p className="text-xs text-amber-400/70 mt-4">
                      Running offline mode.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-secondary-green text-white rounded-br-md'
                          : 'bg-slate-700/50 text-slate-200 rounded-bl-md'
                      }`}>
                        <div className="text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-emerald-300 prose-code:text-emerald-400">
                          {msg.role === 'assistant' ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content || ''}
                            </ReactMarkdown>
                          ) : (
                            msg.content
                          )}
                          {msg.streaming && <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />}
                        </div>
                        <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-emerald-200' : 'text-slate-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700/60">
              <div className="flex items-center space-x-2 bg-slate-700/30 rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={context.skillTitle ? `Ask about ${context.skillTitle}...` : 'Ask me anything...'}
                  className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm"
                  disabled={isTyping || isStreaming}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || isStreaming}
                  className="p-2 text-white bg-secondary-green rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatBot;