import { Context } from "hono";
import type { AuthEnv } from "../middlewares/auth.middleware";
import { OpenAIProvider } from "../providers/openai.provider";
import { GroundingService } from "../services/grounding.service";
import { CitationService } from "../services/citation.service";
import type { GroundingResult, CitationResult } from "../types/verify";
import { db } from "../models/db";
import { auditLogTable } from "../models/schema";

type VerifyBody = { question: string; answer: string; context?: string[] };
type VerifyInput = { out: { json: VerifyBody } };

let llmProvider: OpenAIProvider | null = null;
let groundingService: GroundingService | null = null;
let citationService: CitationService | null = null;

function getServices() {
  if (!llmProvider) {
    llmProvider = new OpenAIProvider();
    groundingService = new GroundingService(llmProvider);
    citationService = new CitationService();
  }
  return {
    groundingService: groundingService!,
    citationService: citationService!,
  };
}

function constructRetrySuggestion(
  grounding: GroundingResult,
  citation: CitationResult
): string {
  const suggestions: string[] = [];
  if (!grounding.pass) {
    suggestions.push(
      `Unsupported claims: ${grounding.unsupported_claims.join(", ")}`
    );
  }
  if (!citation.pass) {
    suggestions.push(
      `Invalid citations: ${citation.missing_sources.join(", ")}`
    );
  }
  return suggestions.join(". ") + ". Please revise.";
}

export const verifyContent = async (
  c: Context<AuthEnv, "/verify", VerifyInput>
) => {
  const startTime = Date.now();
  try {
    const userId = c.get("userId");
    const { question, answer, context } = c.req.valid("json");
    const contextStr = context ? context.join("\n\n") : "";

    const { groundingService, citationService } = getServices();

    const [groundingResult, citationResult] = await Promise.all([
      groundingService.verifyGrounding(question, answer, contextStr),
      citationService.verifyCitations(answer, contextStr),
    ]);

    let trustScore: number;
    if (groundingResult.pass) {
      trustScore =
        groundingResult.score * 0.8 + citationResult.score * 0.2;
    } else {
      trustScore = Math.min(groundingResult.score, 0.4);
    }

    const action = trustScore >= 0.7 ? "APPROVE" : "REJECT";

    const response = {
      trust_score: Number(trustScore.toFixed(2)),
      action,
      tests: {
        grounding: {
          pass: groundingResult.pass,
          score: Number(groundingResult.score.toFixed(2)),
          reason: groundingResult.reason,
          unsupported_claims: groundingResult.unsupported_claims,
        },
        citation: {
          pass: citationResult.pass,
          score: Number(citationResult.score.toFixed(2)),
          missing_sources: citationResult.missing_sources,
        },
      },
      retry_suggestion:
        action === "REJECT"
          ? constructRetrySuggestion(groundingResult, citationResult)
          : null,
    };

    const durationMs = Date.now() - startTime;
    db.insert(auditLogTable)
      .values({
        userId,
        durationMs,
        input_question: question,
        input_answer: answer,
        result_action: action as "APPROVE" | "REJECT",
        result_score: response.trust_score,
        result_details: response.tests,
      })
      .catch((err) => console.error("Failed to log verification:", err));

    return c.json(response, 200);
  } catch (error) {
    console.error("Verification failed:", error);
    const errorMessage = (error as Error).message;
    return c.json(
      {
        status: "error",
        message: "Internal server error during verification",
        details:
          process.env.NODE_ENV === "development" ||
          errorMessage.includes("OpenAI")
            ? errorMessage
            : undefined,
      },
      500
    );
  }
};
