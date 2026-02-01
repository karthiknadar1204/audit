"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3004";

const SIDEBAR_OPTIONS = [
  { id: "api-key", label: "Create API key" },
  { id: "api-keys", label: "API keys" },
  { id: "stats", label: "Stats" },
  { id: "history", label: "History" },
  { id: "documentation", label: "Documentation" },
];

export default function PlaygroundPage() {
  const router = useRouter();
  const [activeOption, setActiveOption] = useState("api-key");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/auth/user`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoadingUser(false);
      })
      .catch(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router]);

  async function handleLogout() {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    router.push("/login");
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-mono flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white font-mono overflow-hidden">
      <Sidebar
        options={SIDEBAR_OPTIONS}
        activeId={activeOption}
        onSelect={setActiveOption}
        userName={user?.name ?? user?.email}
        onLogout={handleLogout}
      />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <header className="flex justify-end items-center px-6 py-2 border-b border-white/10 shrink-0">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            Landing
          </Link>
        </header>
        <div className="flex-1 min-h-0 overflow-auto p-6">
          {activeOption === "api-key" && (
            <CreateApiKeyView />
          )}
          {activeOption === "api-keys" && (
            <ApiKeysView />
          )}
          {activeOption === "stats" && (
            <StatsView />
          )}
          {activeOption === "history" && (
            <HistoryView />
          )}
          {activeOption === "documentation" && (
            <DocumentationView />
          )}
        </div>
      </main>
    </div>
  );
}

function CreateApiKeyView() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCreated(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create key");
        return;
      }
      setCreated(data);
      setName("");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-4">Create API key</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My key"
            className="w-full px-4 py-2 bg-[#111] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {created?.key && (
          <div className="p-3 bg-[#111] border border-white/10 rounded-sm">
            <p className="text-xs text-gray-500 mb-1">API key (copy and store safely):</p>
            <code className="text-sm text-green-400 break-all">{created.key}</code>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-white text-black font-bold rounded-sm hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create key"}
        </button>
      </form>
    </div>
  );
}

function ApiKeysView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keys, setKeys] = useState(null);

  const handleFetch = useCallback(async () => {
    setError("");
    setKeys(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api-keys`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to load API keys");
        return;
      }
      setKeys(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">All API keys</h1>
      <div className="space-y-4 mb-6">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-2 bg-white text-black font-bold rounded-sm hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      {keys && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{keys.length} key(s)</p>
          {keys.length === 0 ? (
            <p className="text-gray-500 text-sm">No API keys yet. Create one from &quot;Create API key&quot;.</p>
          ) : (
            <ul className="space-y-3">
              {keys.map((k) => (
                <li
                  key={k.id}
                  className="p-3 bg-[#0a0a0a] border border-white/10 rounded-sm text-sm"
                >
                  <p className="text-gray-500 mb-1">{k.name || "Unnamed key"}</p>
                  <code className="text-green-400 break-all text-xs">
                    {k.key?.slice(0, 12)}…
                  </code>
                  {k.created_at && (
                    <p className="text-xs text-gray-600 mt-1">
                      Created {new Date(k.created_at).toLocaleString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function StatsView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const handleFetch = useCallback(async () => {
    setError("");
    setStats(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/audit/stats`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Failed to load stats");
        return;
      }
      setStats(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-4">Stats</h1>
      <p className="text-sm text-gray-500 mb-4">Aggregate across all your API keys.</p>
      <div className="space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-2 bg-white text-black font-bold rounded-sm hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
        {stats && (
          <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-2">
            <p><span className="text-gray-500">Total requests:</span> {stats.total_requests}</p>
            <p><span className="text-gray-500">Average trust score:</span> {stats.average_trust_score}</p>
            <p><span className="text-gray-500">Hallucination rate:</span> {stats.hallucination_rate}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(null);

  const handleFetch = useCallback(async () => {
    setError("");
    setHistory(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/audit/history`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Failed to load history");
        return;
      }
      setHistory(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">History</h1>
      <p className="text-sm text-gray-500 mb-4">Verifications across all your API keys.</p>
      <div className="space-y-4 mb-6">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-2 bg-white text-black font-bold rounded-sm hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      {history?.logs && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Last {history.count} verification(s)</p>
          {history.logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet.</p>
          ) : (
            <ul className="space-y-3">
              {history.logs.map((log) => (
                <li
                  key={log.id}
                  className="p-3 bg-[#0a0a0a] border border-white/10 rounded-sm text-sm"
                >
                  <p className="text-gray-500 truncate mb-1">{log.question}</p>
                  <p className="flex gap-4">
                    <span>{log.action}</span>
                    <span>score: {log.trust_score ?? "—"}</span>
                    <span>{log.latency_ms != null ? `${log.latency_ms}ms` : ""}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function DocumentationView() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h1 className="text-2xl font-bold">KitKat Audit SDK — Documentation</h1>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          The KitKat Audit SDK verifies RAG (retrieval-augmented generation) answers by checking <strong>grounding</strong> (claims supported by context) and <strong>citation</strong> (references to sources). Use it after your LLM generates an answer to get a trust score and an APPROVE/REJECT action.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Installation</h2>
        <pre className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm text-sm text-green-400 overflow-x-auto">
{`npm install kitkat-audit-sdk`}
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Authentication</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          The <code className="px-1 py-0.5 bg-white/10 rounded text-xs">/verify</code> endpoint accepts an <strong className="text-gray-300">API key</strong> in the <code className="px-1 py-0.5 bg-white/10 rounded text-xs">x-api-key</code> or <code className="px-1 py-0.5 bg-white/10 rounded text-xs">kitkat-audit-api-key</code> header. Create keys in the playground (Create API key).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Quick start</h2>
        <pre className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm text-sm text-gray-300 overflow-x-auto whitespace-pre">
{`import { VerifyClient } from "kitkat-audit-sdk";

const client = new VerifyClient("https://your-audit-api.com", {
  apiKey: "ak_your_api_key_here",
});

const result = await client.verify(
  "What is the capital of France?",
  "The capital of France is Paris.",
  ["Paris is the capital of France."]  // optional context
);

console.log(result.action);       // "APPROVE" | "REJECT"
console.log(result.trust_score);  // 0.0 - 1.0
console.log(result.tests);         // grounding + citation details`}
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">API reference</h2>

        <h3 className="text-base font-medium text-white mt-4 mb-2">VerifyClient</h3>
        <p className="text-gray-400 text-sm mb-2">
          Constructor: <code className="px-1 py-0.5 bg-white/10 rounded text-xs">new VerifyClient(baseUrl, options)</code>
        </p>
        <ul className="text-gray-400 text-sm space-y-1 mb-4">
          <li><code className="px-1 py-0.5 bg-white/10 rounded text-xs">baseUrl</code> — Your audit API base URL (e.g. <code className="px-1 py-0.5 bg-white/10 rounded text-xs">https://api.example.com</code>). Trailing slashes are stripped.</li>
          <li><code className="px-1 py-0.5 bg-white/10 rounded text-xs">options.apiKey</code> — Required. API key sent as <code className="px-1 py-0.5 bg-white/10 rounded text-xs">x-api-key</code>.</li>
        </ul>

        <h3 className="text-base font-medium text-white mt-4 mb-2">verify(question, answer, context?)</h3>
        <p className="text-gray-400 text-sm mb-2">
          Verifies an answer against a question and optional context. Returns a promise that resolves to the verify response or throws on HTTP error.
        </p>
        <ul className="text-gray-400 text-sm space-y-1">
          <li><code className="px-1 py-0.5 bg-white/10 rounded text-xs">question</code> — The user question (string).</li>
          <li><code className="px-1 py-0.5 bg-white/10 rounded text-xs">answer</code> — The model answer to verify (string).</li>
          <li><code className="px-1 py-0.5 bg-white/10 rounded text-xs">context</code> — Optional. Array of context strings (e.g. retrieved chunks). Used for grounding and citation checks.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Verify response</h2>
        <p className="text-gray-400 text-sm mb-2">The API returns JSON with:</p>
        <pre className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm text-sm text-gray-300 overflow-x-auto whitespace-pre">
{`{
  "trust_score": 0.85,        // 0–1; combined from grounding (80%) + citation (20%)
  "action": "APPROVE",        // "APPROVE" if trust_score >= 0.7, else "REJECT"
  "tests": {
    "grounding": {
      "pass": true,
      "score": 0.9,
      "reason": "...",
      "unsupported_claims": []  // claims in answer not supported by context
    },
    "citation": {
      "pass": true,
      "score": 0.8,
      "missing_sources": []    // cited IDs not found in context
    }
  },
  "retry_suggestion": null    // string when action is REJECT, else null
}`}
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">HTTP API (POST /verify)</h2>
        <p className="text-gray-400 text-sm mb-2">You can call the API directly without the SDK:</p>
        <pre className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm text-sm text-gray-300 overflow-x-auto whitespace-pre">
{`POST /verify
Headers: Content-Type: application/json
         x-api-key: ak_...  (or kitkat-audit-api-key)

Body:
{
  "question": "Your question",
  "answer": "Model answer to verify",
  "context": ["chunk1", "chunk2"]   // optional
}`}
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">End-to-end RAG + verify</h2>
        <p className="text-gray-400 text-sm mb-2">Typical flow: embed query → retrieve context → generate answer → verify.</p>
        <pre className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm text-sm text-gray-300 overflow-x-auto whitespace-pre">
{`import { VerifyClient } from "kitkat-audit-sdk";
// + your embed, vector DB, and LLM clients

const audit = new VerifyClient(process.env.AUDIT_API_URL, {
  apiKey: process.env.KITKAT_AUDIT_API_KEY,
});

async function ragWithVerify(query) {
  // 1. Embed query and retrieve context
  const embedding = await embed(query);
  const chunks = await vectorDb.query(embedding, { topK: 5 });
  const context = chunks.map((c) => c.text);

  // 2. Generate answer with your LLM
  const answer = await llm.chat([
    { role: "system", content: "Answer using only the context." },
    { role: "user", content: \`Context:\\n\${context.join("\\n\\n")}\\n\\nQuestion: \${query}\` },
  ]);

  // 3. Verify with KitKat Audit
  const result = await audit.verify(query, answer, context);

  if (result.action === "REJECT") {
    console.warn("Rejected:", result.retry_suggestion);
    // Optionally retry with revised prompt or return a safe fallback
  }

  return { answer, trust_score: result.trust_score, action: result.action };
}`}
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Error handling</h2>
        <p className="text-gray-400 text-sm mb-2">
          On non-2xx responses, the SDK throws an <code className="px-1 py-0.5 bg-white/10 rounded text-xs">Error</code> with the server message (e.g. <code className="px-1 py-0.5 bg-white/10 rounded text-xs">error</code> or <code className="px-1 py-0.5 bg-white/10 rounded text-xs">message</code> from the JSON body), or a generic message like <code className="px-1 py-0.5 bg-white/10 rounded text-xs">Verify failed: 401</code>.
        </p>
        <pre className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm text-sm text-gray-300 overflow-x-auto">
{`try {
  const result = await client.verify(question, answer, context);
  // use result
} catch (err) {
  console.error(err.message);  // e.g. "Unauthorized: provide x-api-key..."
}`}
        </pre>
      </section>
    </div>
  );
}
