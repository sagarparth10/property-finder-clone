'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { aiAPI, chatHistoryAPI, ChatHistorySession } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, MessageSquare, Paperclip, Plus, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
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

const GUEST_CHAT_STORAGE_KEY = 'property-nexus-concierge-guest-chat';
const MAX_CHAT_IMAGES = 4;

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma !== -1 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

function greetingMessage(content: string): ConversationMessage {
  return {
    id: createId(),
    role: 'assistant',
    content,
    timestamp: Date.now(),
  };
}

function readGuestMessages(): ConversationMessage[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(GUEST_CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConversationMessage[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeGuestMessages(messages: ConversationMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(GUEST_CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function clearGuestMessages() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(GUEST_CHAT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

type AIChatPanelProps = {
  lang: ConciergeLang;
  copy: ConciergeCopy;
  isRtl: boolean;
  onLangChange: (lang: ConciergeLang) => void;
};

export function AIChatPanel({ lang, copy, isRtl, onLangChange }: AIChatPanelProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const promptParam = searchParams.get('prompt');

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatHistorySession[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const greetingLangRef = useRef<ConciergeLang | null>(null);
  const autoPromptDoneRef = useRef(false);
  const handleSendRef = useRef<(prompt?: string) => Promise<void>>(async () => undefined);
  const persistBusyRef = useRef(false);

  const chatHistoryForApi = useMemo(
    () =>
      messages
        .filter((msg) => msg.role === 'assistant' || msg.role === 'user')
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  const startFreshChat = useCallback(() => {
    setSessionId(null);
    setMessages([greetingMessage(copy.greeting)]);
    greetingLangRef.current = lang;
    setError(null);
    if (!user) clearGuestMessages();
  }, [copy.greeting, lang, user]);

  const loadSession = useCallback(
    async (id: string) => {
      const rows = await chatHistoryAPI.getMessages(id);
      setSessionId(id);
      if (rows.length === 0) {
        setMessages([greetingMessage(copy.greeting)]);
      } else {
        setMessages(
          rows.map((row) => ({
            id: row.id || createId(),
            role: row.role,
            content: row.content,
            timestamp: row.createdAt ? Date.parse(row.createdAt) : Date.now(),
          })),
        );
      }
      greetingLangRef.current = lang;
      setError(null);
    },
    [copy.greeting, lang],
  );

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    (async () => {
      setReady(false);
      try {
        if (user) {
          clearGuestMessages();
          const list = await chatHistoryAPI.listSessions();
          if (cancelled) return;
          setSessions(list);
          const hasIncomingPrompt =
            typeof window !== 'undefined' &&
            !!new URLSearchParams(window.location.search).get('prompt');
          if (hasIncomingPrompt) {
            startFreshChat();
          } else if (list[0]?.id) {
            await loadSession(list[0].id);
          } else {
            startFreshChat();
          }
        } else {
          setSessions([]);
          setSessionId(null);
          const guest = readGuestMessages();
          if (guest && guest.length > 0) {
            setMessages(guest);
          } else {
            setMessages([greetingMessage(copy.greeting)]);
          }
          greetingLangRef.current = lang;
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
        if (!cancelled) {
          setSessions([]);
          setSessionId(null);
          setMessages([greetingMessage(copy.greeting)]);
          greetingLangRef.current = lang;
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Reload when auth identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  useEffect(() => {
    if (!ready) return;
    if (greetingLangRef.current === lang) return;
    greetingLangRef.current = lang;
    setMessages((prev) => {
      const onlyGreeting =
        prev.length === 0 || (prev.length === 1 && prev[0].role === 'assistant');
      if (!onlyGreeting) return prev;
      return [greetingMessage(copy.greeting)];
    });
    setError(null);
  }, [lang, copy.greeting, ready]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (user || !ready) return;
    if (messages.length === 0) return;
    writeGuestMessages(messages);
  }, [messages, user, ready]);

  const persistExchange = useCallback(
    async (userText: string, assistantText: string) => {
      if (!user || persistBusyRef.current) return;
      persistBusyRef.current = true;
      try {
        let sid = sessionId;
        if (!sid) {
          const created = await chatHistoryAPI.createSession({
            language: lang,
            title: userText.slice(0, 80),
          });
          sid = created.id;
          setSessionId(sid);
          setSessions((prev) => [created, ...prev.filter((s) => s.id !== created.id)]);
        }
        await chatHistoryAPI.appendMessages(
          sid,
          [
            { role: 'user', content: userText },
            { role: 'assistant', content: assistantText },
          ],
          userText.slice(0, 80),
        );
        setSessions((prev) => {
          const updated = prev.map((s) =>
            s.id === sid
              ? { ...s, title: userText.slice(0, 80), updatedAt: new Date().toISOString() }
              : s,
          );
          return updated.sort((a, b) =>
            String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')),
          );
        });
      } catch (err) {
        console.error('Failed to persist chat history', err);
      } finally {
        persistBusyRef.current = false;
      }
    },
    [user, sessionId, lang],
  );

  const handleAttachImages = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_CHAT_IMAGES - pendingImages.length;
    if (remaining <= 0) return;
    const selected = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, remaining);
    if (selected.length === 0) return;
    try {
      const encoded = await Promise.all(selected.map(fileToBase64));
      setPendingImages((prev) => [...prev, ...encoded].slice(0, MAX_CHAT_IMAGES));
    } catch (err) {
      console.error('Failed to read attached images', err);
    }
  }, [pendingImages.length]);

  const handleSend = useCallback(
    async (prompt?: string) => {
      const text = (prompt ?? input).trim();
      const imagesForSend = pendingImages;
      if ((!text && imagesForSend.length === 0) || isLoading) return;

      const displayText =
        text ||
        (imagesForSend.length > 0
          ? `[Attached ${imagesForSend.length} image${imagesForSend.length > 1 ? 's' : ''}]`
          : '');

      const userMessage: ConversationMessage = {
        id: createId(),
        role: 'user',
        content: displayText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setPendingImages([]);
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
        const history = chatHistoryForApi
          .filter((entry) => entry.content.trim().length > 0)
          .slice(-8);

        let receivedToken = false;
        let assistantText = '';
        const reply = await aiAPI.chatStream(text || displayText, {
          history,
          language: lang,
          images: imagesForSend.length > 0 ? imagesForSend : undefined,
          onToken: (token) => {
            if (!receivedToken) {
              receivedToken = true;
              setIsLoading(false);
            }
            assistantText += token;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId ? { ...msg, content: msg.content + token } : msg,
              ),
            );
          },
        });

        const finalReply = (reply || assistantText).trim();
        if (!finalReply) {
          const fallback =
            'I could not generate a response at the moment. Please try again.';
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: fallback } : msg,
            ),
          );
          await persistExchange(displayText, fallback);
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId && !msg.content ? { ...msg, content: finalReply } : msg,
            ),
          );
          await persistExchange(displayText, finalReply);
        }
      } catch (err: unknown) {
        console.error('AI chat error', err);
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
        setError(copy.errorContact);
      } finally {
        setIsLoading(false);
      }
    },
    [
      input,
      pendingImages,
      isLoading,
      chatHistoryForApi,
      lang,
      copy.errorContact,
      persistExchange,
    ],
  );

  handleSendRef.current = handleSend;

  useEffect(() => {
    if (!ready || !promptParam || autoPromptDoneRef.current) return;
    autoPromptDoneRef.current = true;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('prompt');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });

    void handleSendRef.current(promptParam);
  }, [ready, promptParam, pathname, router, searchParams]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="flex min-h-[32rem] flex-col rounded-3xl border border-gray-200 bg-white shadow-sm lg:col-span-2"
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
          {!ready ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : null}
          {messages.map((message) => {
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

          {!user && !authLoading ? (
            <p className="mb-3 text-xs text-gray-500">
              {copy.loginToSave}{' '}
              <Link
                href="/login?next=/ai-assistant"
                className="font-semibold text-primary-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          ) : null}

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

          {pendingImages.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {pendingImages.map((b64, idx) => (
                <div key={`${idx}-${b64.slice(0, 12)}`} className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/jpeg;base64,${b64}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() =>
                      setPendingImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <form
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                void handleAttachImages(event.target.files);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || pendingImages.length >= MAX_CHAT_IMAGES}
              className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={copy.attachAria}
            >
              <Paperclip className="h-4 w-4" />
            </button>
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
              disabled={isLoading || (input.trim().length === 0 && pendingImages.length === 0)}
              aria-label={copy.sendAria}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>

      <aside dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-900">{copy.historyTitle}</h3>
            </div>
            <button
              type="button"
              onClick={startFreshChat}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              <Plus className="h-3 w-3" />
              {copy.newChat}
            </button>
          </div>

          {user ? (
            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <li className="px-2 py-3 text-xs text-gray-500">{copy.historyEmpty}</li>
              ) : (
                sessions.map((session) => {
                  const active = session.id === sessionId;
                  return (
                    <li key={session.id}>
                      <button
                        type="button"
                        onClick={() => void loadSession(session.id)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-xs transition ${
                          active
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-primary-50'
                        }`}
                      >
                        <span className="line-clamp-2 font-medium">{session.title || 'Chat'}</span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-gray-500">{copy.loginToSave}</p>
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{copy.whatYouCanAskTitle}</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {copy.whatYouCanAsk.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
