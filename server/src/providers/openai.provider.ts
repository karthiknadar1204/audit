import OpenAI from "openai";
import type { LLMProvider, LLMResponse } from "../types/verify";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    this.client = new OpenAI({ apiKey });
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content ?? "";
      if (!content) {
        throw new Error("OpenAI returned empty content");
      }

      return {
        content,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens ?? 0,
              completionTokens: completion.usage.completion_tokens ?? 0,
              totalTokens: completion.usage.total_tokens ?? 0,
            }
          : undefined,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error(
        `Failed to generate response from OpenAI: ${(error as Error).message}`
      );
    }
  }
}
