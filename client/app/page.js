"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, Zap, Lock, Activity, Terminal, Globe, Shield, Layers } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3004"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function LandingPage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/auth/user`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#333] selection:text-white overflow-x-hidden font-mono">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#050505]/80 border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-sm" />
            </div>
            KitKat Audit
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/playground"
                className="px-4 py-2 bg-[#111] hover:bg-[#222] text-white text-sm font-bold rounded-sm border border-white/10 transition-colors"
              >
                Playground
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-[#111] hover:bg-[#222] text-white text-sm font-bold rounded-sm border border-white/10 transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link
              href="https://www.npmjs.com/package/kitkat-audit-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white hover:bg-gray-200 text-black text-sm font-bold rounded-sm transition-colors"
            >
              Install Package
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="text-left">
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-white/10 text-gray-400 text-xs font-medium mb-8 font-mono"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                System Operational
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
              >
                Audit for <br />
                <span className="text-gray-500">RAG answers.</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
                Verify that your RAG and LLM answers are grounded in context and properly cited. Get a trust score,
                approve or reject, and retry suggestions—all via a simple API and SDK.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="#"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  npm install kitkat-audit-sdk
                </Link>
                <Link
                  href="#"
                  className="w-full sm:w-auto px-8 py-4 bg-[#111] hover:bg-[#222] text-white border border-white/10 rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  Read Documentation
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#111]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="ml-4 text-xs text-gray-500 font-mono">example.ts</div>
                </div>
                <div className="p-6 font-mono text-sm overflow-x-auto">
                  <div className="text-gray-500 mb-4">// Initialize KitKat Audit SDK</div>
                  <div className="flex">
                    <span className="text-purple-400">import</span>
                    <span className="text-white mx-2">
                      {"{"} VerifyClient {"}"}
                    </span>
                    <span className="text-purple-400">from</span>
                    <span className="text-green-400 mx-2">"kitkat-audit-sdk"</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-purple-400">const</span>
                    <span className="text-blue-400 mx-2">audit</span>
                    <span className="text-white">=</span>
                    <span className="text-purple-400 mx-2">new</span>
                    <span className="text-yellow-400">VerifyClient</span>
                    <span className="text-gray-400">(</span>
                    <span className="text-green-400">"https://api.example.com"</span>
                    <span className="text-gray-400">, {"{"} apiKey: </span>
                    <span className="text-green-400">"ak_..."</span>
                    <span className="text-gray-400"> {"})"}</span>
                  </div>

                  <div className="text-gray-500 mt-6 mb-4">// Push question, answer, context — get trust score</div>
                  <div>
                    <span className="text-purple-400">const</span>
                    <span className="text-blue-400 mx-2">result</span>
                    <span className="text-white">=</span>
                    <span className="text-purple-400 mx-2">await</span>
                    <span className="text-blue-400">audit</span>
                    <span className="text-gray-400">.</span>
                    <span className="text-yellow-400">verify</span>
                    <span className="text-gray-400">(</span>
                    <span className="text-green-400">question</span>
                    <span className="text-gray-400">, </span>
                    <span className="text-green-400">answer</span>
                    <span className="text-gray-400">, </span>
                    <span className="text-green-400">context</span>
                    <span className="text-gray-400">)</span>
                  </div>
                  <div className="mt-4 text-gray-500">{">"} {"{"} trust_score: 0.85, action: "APPROVE" {"}"}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#050505]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-left mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
            <p className="text-gray-400 max-w-2xl">
              KitKat Audit checks whether your RAG answers are grounded in the retrieved context and properly cited.
              Every verification is logged for compliance and debugging.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 p-8 rounded-lg hover:border-white/20 transition-colors">
              <Brain className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-3 text-white">Grounding Verification</h3>
              <p className="text-gray-400 leading-relaxed">
                Detects unsupported claims: if the model says something that isn't backed by the context you passed,
                KitKat Audit flags it and scores it. No more silent hallucinations in production RAG.
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-lg hover:border-white/20 transition-colors">
              <Zap className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-3 text-white">Citation Check</h3>
              <p className="text-gray-400 leading-relaxed">
                Validates that answers cite the sources you provided. Missing or invalid citations lower the trust
                score and can trigger a reject or retry suggestion.
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-lg hover:border-white/20 transition-colors">
              <Lock className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-3 text-white">Audit Logs</h3>
              <p className="text-gray-400 leading-relaxed">
                Every verification is stored with user, question, answer, action (approve/reject), and trust score. Use
                them for compliance, analytics, or improving your RAG pipeline.
              </p>
            </div>
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 p-8 rounded-lg hover:border-white/20 transition-colors">
              <Layers className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-3 text-white">API Key</h3>
              <p className="text-gray-400 leading-relaxed">
                Authenticate with an API key (server-side, scripts). One verify endpoint
                for both; the SDK supports API key so you can plug it into any RAG stack.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Drop Into Your RAG Pipeline</h2>
              <p className="text-gray-400 mb-8">
                After retrieval and your LLM call, push question, answer, and context into the SDK. Get back a trust
                score, approve/reject, and optional retry suggestion.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Configure Once", desc: "Create a VerifyClient with your API base URL and API key." },
                  { title: "Push Data Per Request", desc: "Call verify(question, answer, context) with the data you already have." },
                  { title: "Use the Verdict", desc: "Branch on trust_score and action (APPROVE/REJECT); show retry_suggestion when needed." },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center font-mono text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 font-mono text-xs md:text-sm text-gray-400">
              <div className="flex gap-4 mb-6 border-b border-white/5 pb-4">
                <div className="text-white border-b border-white px-2 pb-4 -mb-4.5">rag-pipeline.ts</div>
                <div className="px-2 pb-4 cursor-pointer hover:text-gray-300">lib/audit.ts</div>
              </div>
              <pre className="overflow-x-auto">
                {`// After retrieval + LLM answer
const context = chunks.map(c => c.text);
const answer = await llm.generate(question, context);

// Verify with KitKat Audit
const result = await audit.verify(question, answer, context);

if (result.action === "APPROVE") {
  return { answer, trust_score: result.trust_score };
} else {
  return {
    answer,
    trust_score: result.trust_score,
    retry_suggestion: result.retry_suggestion,
  };
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#0a0a0a] border-y border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for RAG and Agents</h2>
            <p className="text-gray-400">Keep answers grounded and cited so users and compliance stay confident.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-6 h-6" />,
                title: "RAG Chat & Search",
                desc: "Verify every answer against retrieved chunks. Approve only when the model stays within context; reject and retry when it hallucinates.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Support & Knowledge Bases",
                desc: "Ensure support bots don't invent policies or steps. Audit logs give you a trail for escalations and quality reviews.",
              },
              {
                icon: <Activity className="w-6 h-6" />,
                title: "Compliance & Governance",
                desc: "Demonstrate that AI outputs are checked against sources. Trust scores and audit logs support audits and risk controls.",
              },
            ].map((useCase, i) => (
              <div
                key={i}
                className="bg-[#050505] border border-white/10 p-8 rounded-lg text-left hover:border-white/30 transition-all"
              >
                <div className="w-12 h-12 bg-[#111] rounded-lg flex items-center justify-center mb-6 text-white">
                  {useCase.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{useCase.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-[#050505] text-sm text-gray-500 font-mono">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-sm" />
            <span className="font-bold text-white">KitKat Audit</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-white transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
