"use client";

import Link from "next/link";

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono">
      <nav className="border-b border-white/10 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-sm" />
          </div>
          KitKat Audit
        </Link>
        <span className="text-gray-500 text-sm">Playground</span>
      </nav>
      <main className="container mx-auto px-6 py-16 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Playground</h1>
        <p className="text-gray-400">
          You’re signed in. Use this page to try the verify API, manage API keys, or view history.
        </p>
      </main>
    </div>
  );
}
