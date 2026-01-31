import type { CitationResult } from "../types/verify";

export class CitationService {
  async verifyCitations(
    answer: string,
    context: string
  ): Promise<CitationResult> {
    const citationRegex =
      /\[(?:Doc\s?|Source\s?)?([a-zA-Z0-9\-_]+)\]|\((?:Source\s?)?([a-zA-Z0-9\-_]+)\)/gi;

    const foundCitations = new Set<string>();
    let match;
    while ((match = citationRegex.exec(answer)) !== null) {
      const citationId = match[1] ?? match[2];
      if (citationId) foundCitations.add(citationId);
    }

    if (foundCitations.size === 0) {
      return { pass: true, score: 1.0, missing_sources: [] };
    }

    const missingSources: string[] = [];
    for (const citation of foundCitations) {
      const idInContextRegex = new RegExp(
        `\\[${citation}\\]|\\(${citation}\\)|\\b${citation}\\b`,
        "i"
      );
      if (!idInContextRegex.test(context)) {
        missingSources.push(citation);
      }
    }

    const pass = missingSources.length === 0;
    const score =
      foundCitations.size > 0
        ? (foundCitations.size - missingSources.length) / foundCitations.size
        : 1.0;

    return { pass, score, missing_sources: missingSources };
  }
}
