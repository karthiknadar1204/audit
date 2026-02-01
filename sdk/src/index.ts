export type VerifyResponse = {
  trust_score: number;
  action: "APPROVE" | "REJECT";
  tests: {
    grounding: {
      pass: boolean;
      score: number;
      reason: string;
      unsupported_claims: string[];
    };
    citation: {
      pass: boolean;
      score: number;
      missing_sources: string[];
    };
  };
  retry_suggestion: string | null;
};

export type VerifyOptions = {
  /** API key (header `x-api-key`). Required. */
  apiKey: string;
  /** Cookie string for auth (e.g. `token=eyJ...`). Optional. Use for Node when no cookie is sent. In browser, omit and use credentials. */
  cookie?: string;
};

export class VerifyClient {
  constructor(
    private baseUrl: string,
    options: VerifyOptions
  ) {
    this.options = options;
  }

  private options: VerifyOptions;

  async verify(
    question: string,
    answer: string,
    context?: string[]
  ): Promise<VerifyResponse> {
    const url = `${this.baseUrl.replace(/\/$/, "")}/verify`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": this.options.apiKey,
    };
    if (this.options.cookie) {
      headers["Cookie"] = this.options.cookie;
    }
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(
        context ? { question, answer, context } : { question, answer }
      ),
      credentials: "include",
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      throw new Error(err.error ?? err.message ?? `Verify failed: ${res.status}`);
    }
    return res.json() as Promise<VerifyResponse>;
  }
}
