interface Env {
  FRONTEND_URL: string;
  /** Full URL for the Cognaitive agent endpoint (POST { prompt, images? } → { answer }). */
  OLLAMA_AGENT_URL?: string;
  /**
   * Bearer token for ollama.cognaitive.in/agent.
   * Set with: npx wrangler secret put OLLAMA_API_SECRET
   * Never commit the value.
   */
  OLLAMA_API_SECRET?: string;
  /** @deprecated Legacy direct Ollama chat URL; agent path is preferred. */
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
  /** e.g. "10m" or "-1" (keep loaded forever). Reduces cold-start latency. */
  OLLAMA_KEEP_ALIVE?: string;
  /** Cap completion tokens for faster replies (default 384). */
  OLLAMA_NUM_PREDICT?: string;
  /** Sampling temperature (default 0.6). */
  OLLAMA_TEMPERATURE?: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  ASSETS: Fetcher;
}
