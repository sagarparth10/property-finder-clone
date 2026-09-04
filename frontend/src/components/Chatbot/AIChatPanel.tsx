'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { aiAPI } from '@/utils/api';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { ChatMarkdown } from './ChatMarkdown';

export type ChatRole = 'assistant' | 'user';

export interface ConversationMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

const defaultAssistantGreeting =
  "Hi there! I'm the Property Nexus AI concierge. Ask me about neighborhoods, investment yields, or how to collaborate with agents and lawyers.";

const presetPrompts = [
  'Show me 2-bedroom apartments in Dubai Marina under AED 180k with marina views.',
  'Explain the legal steps to purchase an off-plan villa in Dubai.',
  'Compare average ROI between Downtown and Business Bay.',
  'What mortgage options can I explore with a 20% down payment?',
];

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export function AIChatPanel() {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: createId(),
      role: 'assistant',
      content: defaultAssistantGreeting,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const chatHistoryForApi = useMemo(
    () =>
      messages
        .filter((msg) => msg.role === 'assistant' || msg.role === 'user')
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
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

    try {
      const history = chatHistoryForApi.slice(-12);

      const response = await aiAPI.chat(text, {
        history,
      });

      const reply = (response?.response as string) || 'I could not generate a response at the moment. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.error('AI chat error', err);
      setError('Unable to contact the AI engine. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <Sparkles className="h-5 w-5 text-primary-600" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Concierge</h2>
            <p className="text-xs text-gray-500">Ask about listings, neighborhoods, and financing</p>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-6 py-4">
        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pb-3">
          {presetPrompts.map((prompt) => (
            <button
              key={prompt}
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
            placeholder="Ask about listings, financing, or legal workflows..."
            className="flex-1 resize-none bg-transparent text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-primary-600 p-2 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-200"
            disabled={isLoading || input.trim().length === 0}
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
