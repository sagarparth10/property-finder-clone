interface Env {
  FRONTEND_URL: string;
  OLLAMA_MODEL: string;
  /** e.g. "10m" or "-1" (keep loaded forever). Reduces cold-start latency. */
  OLLAMA_KEEP_ALIVE?: string;
  /** Cap completion tokens for faster replies (default 384). */
  OLLAMA_NUM_PREDICT?: string;
  /** Sampling temperature (default 0.6). */
  OLLAMA_TEMPERATURE?: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  OLLAMA_BASE_URL: string;
  ASSETS: Fetcher;
}
