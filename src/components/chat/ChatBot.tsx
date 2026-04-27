'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle, HeadphonesIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatBot() {
  const { tr, locale } = useI18n();

  const WELCOME: Message = {
    id: 'welcome',
    role: 'assistant',
    content: tr.chat.welcome,
  };

  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showFaq, setShowFaq]   = useState(true);
  const [escalated, setEscalated] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  // Scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  // Sync welcome message on locale change
  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.id === 'welcome' ? { ...m, content: tr.chat.welcome } : m
    ));
  }, [tr]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    setInput('');
    setError(null);
    setShowFaq(false);

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    const assistantId = crypto.randomUUID();

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setLoading(true);

    const history = [...messages, userMsg]
      .filter(m => m.id !== 'welcome' && m.role !== 'system' && m.content.trim())
      .map(({ role, content }) => ({ role: role as 'user' | 'assistant', content }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, locale }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            const token = chunk.message?.content ?? '';
            if (token) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + token } : m
                )
              );
            }
          } catch {
            // ignore malformed JSON lines
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message ?? 'Erreur inconnue');
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, loading, messages, locale]);

  const send = useCallback(() => sendMessage(input), [input, sendMessage]);

  const handleFaqClick = (question: string) => sendMessage(question);

  const handleEscalate = () => {
    setEscalated(true);
    setShowFaq(false);
    const sysMsg: Message = {
      id: crypto.randomUUID(),
      role: 'system',
      content: tr.chat.escalateMsg,
    };
    setMessages(prev => [...prev, sysMsg]);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col bg-white"
            role="dialog"
            aria-label={tr.chat.title}
            aria-modal="true"
            style={{ height: 540 }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #003d5c 0%, #005580 100%)' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,168,181,.25)' }}
              >
                <Bot className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">{tr.chat.title}</p>
                <p className="text-white/60 text-xs mt-0.5">
                  {loading ? tr.chat.typing : tr.chat.online}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label={tr.chat.closeChat}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ background: '#f8fafc' }}
              role="log"
              aria-live="polite"
              aria-label={tr.chat.title}
            >
              {messages.map(msg => {
                /* System escalation card */
                if (msg.role === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="rounded-xl border border-[#00a8b5]/30 bg-[#e0f7f9] px-4 py-3 text-sm text-[#003d5c] max-w-[85%] text-center space-y-2">
                        <p className="font-semibold flex items-center justify-center gap-1.5">
                          <HeadphonesIcon className="w-4 h-4" />
                          {tr.chat.escalateTitle}
                        </p>
                        <p className="text-xs opacity-80">{tr.chat.escalateDesc}</p>
                        <Link
                          href="/contact"
                          onClick={handleClose}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#00a8b5] hover:underline"
                        >
                          {tr.chat.openContact} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ background: '#e0f7f9' }}
                        aria-hidden="true"
                      >
                        <Bot className="w-3.5 h-3.5" style={{ color: '#00a8b5' }} />
                      </div>
                    )}

                    <div
                      className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                      style={
                        msg.role === 'user'
                          ? { background: '#00a8b5', color: '#fff', borderBottomRightRadius: 4 }
                          : { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderBottomLeftRadius: 4 }
                      }
                    >
                      {msg.content || (
                        <span className="flex items-center gap-1.5 text-slate-400 text-xs" aria-label={tr.chat.typing}>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-slate-200" aria-hidden="true">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700" role="alert">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── FAQ quick-replies ── */}
            <AnimatePresence>
              {showFaq && !escalated && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 border-t border-slate-100 bg-white overflow-hidden"
                >
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {tr.chat.faqTitle}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      {tr.chat.faq.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleFaqClick(q)}
                          className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-[#00a8b5] hover:text-[#00a8b5] transition-colors text-start"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input + escalate ── */}
            <div className="flex-shrink-0 border-t border-slate-100 bg-white">
              {/* Escalation bar */}
              {!escalated && (
                <div className="px-3 pt-2 pb-1 flex items-center justify-end">
                  <button
                    onClick={handleEscalate}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#00a8b5] transition-colors"
                  >
                    <HeadphonesIcon className="w-3.5 h-3.5" />
                    {tr.chat.escalateBtn}
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 pb-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                  placeholder={tr.chat.placeholder}
                  aria-label={tr.chat.placeholder}
                  className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none focus:border-[#00a8b5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,168,181,.12)] transition-all disabled:opacity-50"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  aria-label={tr.common.send}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/30"
                  style={{ background: '#00a8b5', color: '#fff' }}
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle Button ── */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? tr.chat.closeChat : tr.chat.openChat}
        aria-expanded={open}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/40 focus:ring-offset-2"
        style={{ background: 'linear-gradient(135deg, #00a8b5 0%, #0098a4 100%)', color: '#fff' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X className="w-6 h-6" /></motion.span>
            : <motion.span key="mc" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><MessageCircle className="w-6 h-6" /></motion.span>
          }
        </AnimatePresence>

        {/* Unread dot — shown only when closed */}
        {!open && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ background: '#003d5c' }}
            aria-hidden="true"
          />
        )}
      </motion.button>
    </div>
  );
}
