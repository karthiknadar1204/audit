export interface GroundingResult {
  pass: boolean;
  score: number;
  reason: string;
  unsupported_claims: string[];
}

export interface CitationResult {
  pass: boolean;
  score: number;
  missing_sources: string[];
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  generate(systemPrompt: string, userPrompt: string): Promise<LLMResponse>;
}
