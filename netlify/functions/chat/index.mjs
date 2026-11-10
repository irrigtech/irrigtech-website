// IrrigTech website chat assistant: POST /api/chat
//
// Browser -> this function -> Claude API. The Anthropic API key is read from the
// Netlify environment (ANTHROPIC_API_KEY) and never reaches the browser.
// Response: newline-delimited JSON events
//   {"t":"d","v":"text"}                 text delta
//   {"t":"end","truncated":false}        finished
//   {"t":"e","code":"..."}               error (the widget shows a contact fallback)
// Conversation content is never logged or stored by this function.

import Anthropic from "@anthropic-ai/sdk";
import { INSTRUCTIONS, LANGUAGE_NOTE } from "./prompt.mjs";
import { KNOWLEDGE, KNOWLEDGE_VERSION } from "./knowledge.mjs";
import { checkAndCount, limitsFromEnv } from "./limits.mjs";

const DEFAULT_ORIGINS = ["https://irrigtech.com", "https://www.irrigtech.com"];
const MAX_BODY_BYTES = 16_000;
const MAX_TURNS = 12;            // messages sent to the model (most recent kept)
const MAX_USER_CHARS = 800;
const MAX_ASSISTANT_CHARS = 2_500;
const LANGS = new Set(["en", "de", "fr"]);

// Models that accept the server-side refusal fallback ("default" mode) on the Claude API.
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-sonnet-5-5", "claude-fable-5-1"]);

export const config = { path: "/api/chat" };

const json = (status, obj, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...extra },
  });

export function isAllowedOrigin(origin, requestUrl, env = process.env) {
  if (!origin) return false;
  let self;
  try { self = new URL(requestUrl).origin; } catch { self = null; }
  if (origin === self) return true; // same-origin: production, deploy previews, local dev
  const extra = (env.CHAT_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra].includes(origin);
}

// Validates and normalises the request body. Throws Error("bad_request") on anything unexpected.
export function parseChatBody(raw) {
  const fail = () => { throw new Error("bad_request"); };
  if (typeof raw !== "string" || raw.length === 0 || Buffer.byteLength(raw) > MAX_BODY_BYTES) fail();
  let body;
  try { body = JSON.parse(raw); } catch { fail(); }
  if (!body || typeof body !== "object" || Array.isArray(body)) fail();
  if (body.website) fail(); // honeypot field: real visitors never fill it
  const lang = LANGS.has(body.lang) ? body.lang : "en";
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 40) fail();

  let messages = body.messages.map((m) => {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") fail();
    const content = m.content.replace(/\u0000/g, "").trim();
    const max = m.role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    if (!content || content.length > max) fail();
    return { role: m.role, content };
  });
  messages = messages.slice(-MAX_TURNS);
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") fail();
  for (let i = 1; i < messages.length; i++) if (messages[i].role === messages[i - 1].role) fail();
  return { lang, messages };
}

function buildParams(model, lang, messages, env) {
  const params = {
    model,
    max_tokens: Number(env.CHAT_MAX_TOKENS) > 0 ? Math.min(Number(env.CHAT_MAX_TOKENS), 4000) : 1500,
    output_config: { effort: env.CHAT_EFFORT || "low" },
    system: [
      { type: "text", text: INSTRUCTIONS },
      // Stable, large block: cached so repeat requests read it at a fraction of the price.
      { type: "text", text: `<knowledge version="${KNOWLEDGE_VERSION}">\n${KNOWLEDGE}\n</knowledge>`, cache_control: { type: "ephemeral" } },
      // Per-request note goes after the cache breakpoint so it never invalidates the cache.
      { type: "text", text: LANGUAGE_NOTE[lang] },
    ],
    messages,
  };
  return params;
}

function mockStream(lang) {
  const text = {
    en: "This is a local test reply (mock mode, no AI call). IrrigTech offers field sensors and smart irrigation control.\n[[inquiry]]",
    de: "Dies ist eine lokale Testantwort (Mock-Modus, kein KI-Aufruf).\n[[inquiry]]",
    fr: "Ceci est une réponse de test locale (mode simulé, aucun appel IA).\n[[inquiry]]",
  }[lang];
  return (async function* () {
    for (const word of text.split(/(?<= )/)) {
      await new Promise((r) => setTimeout(r, 15));
      yield word;
    }
  })();
}

export default async function handler(req, context) {
  const env = process.env;
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" }, { allow: "POST" });
  if (!isAllowedOrigin(req.headers.get("origin"), req.url, env)) return json(403, { error: "forbidden" });
  if (!(req.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return json(415, { error: "bad_request" });

  let parsed;
  try {
    const len = Number(req.headers.get("content-length") || 0);
    if (len > MAX_BODY_BYTES) throw new Error("bad_request");
    parsed = parseChatBody(await req.text());
  } catch {
    return json(400, { error: "bad_request" });
  }

  const deployContext = context?.deploy?.context || env.CONTEXT || "dev";
  const mock = env.CHAT_MOCK === "1" && deployContext !== "production";
  if (!mock && !env.ANTHROPIC_API_KEY) return json(503, { error: "not_configured" });

  // Usage limits are checked before any paid call. If the limiter itself is
  // unavailable we fail closed: no limiter, no API spend.
  try {
    const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
    const verdict = await checkAndCount({ ip, salt: env.CHAT_HASH_SALT || context?.site?.id || "irrigtech-chat", limits: limitsFromEnv(env) });
    if (!verdict.ok) {
      const code = verdict.reason === "minute" ? "rate_minute" : verdict.reason === "daily" ? "rate_daily" : "busy";
      return json(429, { error: code }, verdict.retryAfter ? { "retry-after": String(verdict.retryAfter) } : {});
    }
  } catch (err) {
    console.error("[chat] limiter unavailable:", err?.name || "Error");
    return json(503, { error: "unavailable" });
  }

  const model = env.CHAT_MODEL || "claude-opus-5-5";
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    async start(controller) {
      // The visitor may close the chat mid-reply; writing to a closed stream must not throw.
      const send = (o) => { try { controller.enqueue(encoder.encode(JSON.stringify(o) + "\n")); } catch {} };
      try {
        if (mock) {
          for await (const chunk of mockStream(parsed.lang)) send({ t: "d", v: chunk });
          send({ t: "end", truncated: false });
          return;
        }
        const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 25_000 });
        const params = buildParams(model, parsed.lang, parsed.messages, env);
        const stream = FALLBACK_MODELS.has(model)
          ? client.beta.messages.stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }, { signal: req.signal })
          : client.messages.stream(params, { signal: req.signal });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") send({ t: "d", v: event.delta.text });
        }
        const final = await stream.finalMessage();
        const u = final.usage || {};
        console.log(`[chat] ok model=${final.model} stop=${final.stop_reason} in=${u.input_tokens} cache_read=${u.cache_read_input_tokens} cache_write=${u.cache_creation_input_tokens} out=${u.output_tokens}`);
        if (final.stop_reason === "refusal") send({ t: "e", code: "refusal" });
        else send({ t: "end", truncated: final.stop_reason === "max_tokens" });
      } catch (err) {
        // Log the error class and status only — never the conversation.
        const status = err instanceof Anthropic.APIError ? err.status : undefined;
        if (err instanceof Anthropic.AuthenticationError) console.error("[chat] Anthropic authentication failed (check ANTHROPIC_API_KEY)");
        else if (err instanceof Anthropic.RateLimitError) console.error("[chat] Anthropic rate limit reached");
        else console.error(`[chat] upstream error: ${err?.name || "Error"}${status ? ` status=${status}` : ""}`);
        send({ t: "e", code: "unavailable" });
      } finally {
        try { controller.close(); } catch {}
      }
    },
  });

  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}
