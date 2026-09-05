'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight, Mic, Send, Sparkles } from 'lucide-react';

interface AIAvatarProps {
  onUserInput: (text: string) => void;
  avatarResponse: string | null;
  isListening: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'EN', speech: 'en-US' },
  { code: 'ar', label: 'AR', speech: 'ar-AE' },
  { code: 'fr', label: 'FR', speech: 'fr-FR' },
  { code: 'hi', label: 'HI', speech: 'hi-IN' },
] as const;

const SUGGESTED_PROMPTS = [
  '2-bed in Dubai Marina under AED 180k',
  'Steps to buy an off-plan villa',
  'Downtown vs Business Bay ROI',
  'Mortgage options with 20% down',
];

type LangCode = (typeof LANGUAGES)[number]['code'];

export function AIAvatar({ onUserInput, avatarResponse, isListening }: AIAvatarProps) {
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState<LangCode>('en');
  const [draft, setDraft] = useState('');
  const recognitionRef = useRef<any>(null);

  const speechLang = LANGUAGES.find((item) => item.code === lang)?.speech ?? 'en-US';

  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = speechLang;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (transcript) onUserInput(transcript);
    };

    recognitionRef.current.onend = () => {
      if (isListening) recognitionRef.current?.start();
    };
  }, [onUserInput, isListening, speechLang]);

  useEffect(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.lang = speechLang;
  }, [speechLang]);

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    } else if (!isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }, [isListening]);

  useEffect(() => {
    if (!avatarResponse || typeof window === 'undefined') return;
    const utterance = new SpeechSynthesisUtterance(avatarResponse);
    utterance.lang = speechLang;
    utterance.pitch = 1.1;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [avatarResponse, speechLang]);

  const submitPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onUserInput(trimmed);
    setDraft('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitPrompt(draft);
  };

  return (
    <div className="relative flex min-h-[22rem] flex-col overflow-y-auto rounded-2xl bg-gradient-to-b from-primary-50 via-white to-primary-50/80 text-primary-900 sm:min-h-[24rem]">
      {/* Language switcher — speech/TTS locale only; UI copy stays English */}
      <div className="absolute right-3 top-3 z-10 flex gap-1.5 sm:right-4 sm:top-4">
        {LANGUAGES.map((item) => {
          const active = lang === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLang(item.code)}
              aria-pressed={active}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ${
                active
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'bg-white/80 text-primary-800/70 ring-1 ring-primary-200/80 hover:bg-white hover:text-primary-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Empty-state invite — keep at top so hero `text-white` inheritance cannot hide the title */}
      <div className="flex flex-1 flex-col justify-start px-5 pb-4 pt-14 sm:px-7 sm:pb-5 sm:pt-16">
        <div className="mx-auto max-w-sm text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md shadow-primary-600/25">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-primary-950 sm:text-2xl">
            Where should we start?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-primary-800">
            Ask about listings, neighborhoods, financing, or legal steps — or pick a prompt below.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitPrompt(prompt)}
              className="rounded-full border border-primary-200/90 bg-white/90 px-3 py-1.5 text-left text-xs font-medium text-primary-800 shadow-sm transition hover:border-primary-400 hover:bg-primary-50 hover:text-primary-950"
            >
              {prompt}
            </button>
          ))}
        </div>

        {avatarResponse ? (
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-white/90 px-4 py-3 text-sm text-primary-900 shadow-sm ring-1 ring-primary-100 animate-fade-in">
            {avatarResponse}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-5 flex w-full max-w-md items-center gap-2 rounded-2xl border border-primary-200/80 bg-white px-3 py-2 shadow-sm"
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about your next move…"
            className="min-w-0 flex-1 bg-transparent text-sm text-primary-900 outline-none placeholder:text-primary-900/40"
            aria-label="Ask the AI concierge"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-200"
            aria-label="Send question"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-3 flex justify-center">
          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 transition hover:text-primary-900"
          >
            Open full concierge chat
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Status bar */}
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-primary-100/80 sm:mx-4 sm:mb-4">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            listening ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'
          }`}
          aria-hidden
        />
        <span className="text-xs font-medium text-gray-700">
          {listening ? 'Listening…' : 'Ready'}
        </span>
        {listening ? (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-amber-700">
            <Mic className="h-3 w-3" />
            Voice on
          </span>
        ) : null}
      </div>
    </div>
  );
}
