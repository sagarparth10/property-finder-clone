'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { aiAPI } from '@/utils/api';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { ChatMarkdown } from './ChatMarkdown';
import {
  CONCIERGE_LANGS,
  ConciergeCopy,
  ConciergeLang,
} from '@/components/Avatar/conciergeI18n';

export type ChatRole = 'assistant' | 'user';

export interface ConversationMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

type AIChatPanelProps = {
  lang: ConciergeLang;
  copy: ConciergeCopy;
  isRtl: boolean;
  onLangChange: (lang: ConciergeLang) => void;
};

export function AIChatPanel({ lang, copy, isRtl, onLangChange }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const greetingLangRef = useRef<ConciergeLang | null>(null);

  useEffect(() => {
    if (greetingLangRef.current === lang) return;
    greetingLangRef.current = lang;
    setMessages([
      {
        id: createId(),
        role: 'assistant',
        content: copy.greeting,
        timestamp: Date.now(),
      },
    ]);
    setError(null);
  }, [lang, copy.greeting]);

  const chatHistoryForApi = useMemo(
    () =>
      messages
        .filter((msg) => msg.role === 'assistant' || msg.role === 'user')
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  const handleSend = async (prompt?: string) => {
    const text = (prompt ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: ConversationMessage = {
      id: createId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    const assistantId = createId();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      },
    ]);

    try {
      // Exclude the greeting-only turn and the empty assistant placeholder.
      const history = chatHistoryForApi
        .filter((entry) => entry.content.trim().length > 0)
        .slice(-8);

      let receivedToken = false;
      const reply = await aiAPI.chatStream(text, {
        history,
        language: lang,
        onToken: (token) => {
          if (!receivedToken) {
            receivedToken = true;
            setIsLoading(false);
          }
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + token }
                : msg,
            ),
          );
        },
      });

      if (!reply.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content:
                    'I could not generate a response at the moment. Please try again.',
                }
              : msg,
          ),
        );
      }
    } catch (err: unknown) {
      console.error('AI chat error', err);
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
      setError(copy.errorContact);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{copy.title}</h2>
              <p className="text-xs text-gray-500">{copy.panelSubtitle}</p>
            </div>
          </div>

          <div className="flex gap-1.5" role="group" aria-label="Language">
            {CONCIERGE_LANGS.map((item) => {
              const active = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onLangChange(item.code)}
                  aria-pressed={active}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ${
                    active
                      ? 'bg-primary-700 text-white shadow-sm'
                      : 'bg-primary-50 text-primary-800/70 ring-1 ring-primary-200/80 hover:bg-primary-100 hover:text-primary-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((message) => {
          // Hide empty placeholder bubble until the first streamed token arrives.
          if (message.role === 'assistant' && !message.content && isLoading) {
            return null;
          }
          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <ChatMarkdown content={message.content} variant={message.role} />
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              {copy.thinking}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-6 py-4">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        <div className="flex flex-wrap gap-2 pb-3">
          {copy.prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-100"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <textarea
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={copy.chatPlaceholder}
            className="flex-1 resize-none bg-transparent text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-primary-600 p-2 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-200"
            disabled={isLoading || input.trim().length === 0}
            aria-label={copy.sendAria}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
