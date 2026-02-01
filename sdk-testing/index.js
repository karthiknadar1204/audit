import "dotenv/config";
import express from "express";
import { client } from "./utils/openai.js";
import { index } from "./utils/pinecone.js";
import { client as auditClient } from "./utils/audit.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 3005;

// Simple legitimate data: facts and short text chunks for RAG
const CHUNKS = [
  "The sky is blue because sunlight is scattered by the atmosphere.",
  "Water boils at 100 degrees Celsius at sea level.",
  "The Earth orbits the Sun once every 365.25 days.",
  "Humans have 206 bones in the adult body.",
  "The Great Wall of China is over 13,000 miles long.",
  "Honey never spoils; archaeologists have found edible honey in ancient tombs.",
  "Bananas are berries, but strawberries are not.",
  "Octopuses have three hearts and blue blood.",
  "A day on Venus is longer than its year.",
  "Light takes about 8 minutes to travel from the Sun to Earth.",
  "The human brain uses about 20% of the body's total energy.",
  "Diamonds are formed under high pressure deep in the Earth.",
  "The Pacific Ocean is the largest ocean on Earth.",
  "Bees communicate by dancing to show where flowers are.",
  "Ice floats because water expands when it freezes.",
  "The speed of sound is about 343 meters per second in air.",
  "Mount Everest is the highest mountain above sea level.",
  "The Nile River is the longest river in the world.",
  "Photosynthesis converts sunlight into chemical energy in plants.",
  "The Moon is slowly moving away from Earth each year.",
];

app.post("/seed", async (req, res) => {
  try {
    const embeddingRes = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: CHUNKS,
    });

    const records = embeddingRes.data
      .sort((a, b) => a.index - b.index)
      .map((item, i) => ({
        id: `chunk-${i}`,
        values: item.embedding,
        metadata: { text: CHUNKS[i] },
      }));

    await index.upsert({ records });

    res.json({
      ok: true,
      message: `Upserted ${records.length} chunks to Pinecone`,
      count: records.length,
    });
  } catch (err) {
    console.error("Seed failed:", err);
    res.status(500).json({
      ok: false,
      message: err.message ?? "Seed failed",
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ ok: false, message: "query (string) required" });
    }

    const embeddingRes = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryVector = embeddingRes.data[0].embedding;

    const queryResult = await index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const context = (queryResult.matches ?? [])
      .filter((m) => m.metadata?.text)
      .map((m) => m.metadata.text);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Answer the user's question using only the following context. If the context doesn't contain the answer, say so briefly.\n\nContext:\n${context.join("\n\n")}`,
        },
        { role: "user", content: query },
      ],
    });
    const answer = completion.choices[0]?.message?.content ?? "";

    const verification = await auditClient.verify(query, answer, context);

    res.json({
      ok: true,
      query,
      answer,
      verification: {
        trust_score: verification.trust_score,
        action: verification.action,
        retry_suggestion: verification.retry_suggestion,
      },
    });
  } catch (err) {
    console.error("Chat failed:", err);
    res.status(500).json({
      ok: false,
      message: err.message ?? "Chat failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`sdk-testing running on http://localhost:${PORT}`);
});
