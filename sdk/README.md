# KitKat Audit SDK — Documentation

## Overview

The KitKat Audit SDK verifies RAG (retrieval-augmented generation) answers by checking **grounding** (claims supported by context) and **citation** (references to sources). Use it after your LLM generates an answer to get a trust score and an APPROVE/REJECT action.

## Installation

```bash
npm install kitkat-audit-sdk
```

## Authentication

The `/verify` endpoint accepts an **API key** in the `x-api-key` or `kitkat-audit-api-key` header. Create keys in the playground (Create API key).

## Quick start

```js
import { VerifyClient } from "kitkat-audit-sdk";

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
console.log(result.tests);       // grounding + citation details
```

## API reference

### VerifyClient

Constructor: `new VerifyClient(baseUrl, options)`

- **baseUrl** — Your audit API base URL (e.g. `https://api.example.com`). Trailing slashes are stripped.
- **options.apiKey** — Required. API key sent as `x-api-key`.

### verify(question, answer, context?)

Verifies an answer against a question and optional context. Returns a promise that resolves to the verify response or throws on HTTP error.

- **question** — The user question (string).
- **answer** — The model answer to verify (string).
- **context** — Optional. Array of context strings (e.g. retrieved chunks). Used for grounding and citation checks.

## Verify response

The API returns JSON with:

```json
{
  "trust_score": 0.85,
  "action": "APPROVE",
  "tests": {
    "grounding": {
      "pass": true,
      "score": 0.9,
      "reason": "...",
      "unsupported_claims": []
    },
    "citation": {
      "pass": true,
      "score": 0.8,
      "missing_sources": []
    }
  },
  "retry_suggestion": null
}
```

- **trust_score** — 0–1; combined from grounding (80%) + citation (20%).
- **action** — `"APPROVE"` if trust_score >= 0.7, else `"REJECT"`.
- **retry_suggestion** — String when action is REJECT, else null.

## HTTP API (POST /verify)

You can call the API directly without the SDK:

```
POST /verify
Headers: Content-Type: application/json
         x-api-key: ak_...  (or kitkat-audit-api-key)

Body:
{
  "question": "Your question",
  "answer": "Model answer to verify",
  "context": ["chunk1", "chunk2"]   // optional
}
```

## End-to-end RAG + verify

Typical flow: embed query → retrieve context → generate answer → verify.

```js
import { VerifyClient } from "kitkat-audit-sdk";
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
    { role: "user", content: `Context:\n${context.join("\n\n")}\n\nQuestion: ${query}` },
  ]);

  // 3. Verify with KitKat Audit
  const result = await audit.verify(query, answer, context);

  if (result.action === "REJECT") {
    console.warn("Rejected:", result.retry_suggestion);
  }

  return { answer, trust_score: result.trust_score, action: result.action };
}
```

## Error handling

On non-2xx responses, the SDK throws an `Error` with the server message (e.g. `error` or `message` from the JSON body), or a generic message like `Verify failed: 401`.

```js
try {
  const result = await client.verify(question, answer, context);
  // use result
} catch (err) {
  console.error(err.message);  // e.g. "Unauthorized: provide x-api-key..."
}
```
