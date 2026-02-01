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
    <div className="flex min-h-screen bg-[#050505] text-white font-mono">
      <Sidebar
        options={SIDEBAR_OPTIONS}
        activeId={activeOption}
        onSelect={setActiveOption}
        userName={user?.name ?? user?.email}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto p-6">
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
