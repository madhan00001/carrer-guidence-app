import { loadMarkdownKnowledgeBase, RAGDocumentChunk } from "./data.js";

class CareerRAGService {
  private chunks: RAGDocumentChunk[] = [];

  constructor() {
    this.refresh();
  }

  public refresh() {
    this.chunks = loadMarkdownKnowledgeBase();
  }

  public getAllChunks() {
    return this.chunks;
  }

  public search(query: string, topK: number = 4) {
    if (this.chunks.length === 0) {
      this.refresh();
    }

    const cleanQuery = (query || "").toLowerCase().replace(/[^\w\s]/g, " ");
    const terms = cleanQuery.split(/\s+/).filter(t => t.length > 2 && !["what", "how", "should", "learn", "for", "the", "and", "become", "with"].includes(t));

    const scored = this.chunks.map(chunk => {
      const textLower = chunk.text.toLowerCase();
      const roleLower = chunk.role.toLowerCase();
      const sectionLower = chunk.section.toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (roleLower.includes(term)) {
          score += 6.0; // Strong role match
        }
        if (sectionLower.includes(term)) {
          score += 3.5; // Header match
        }
        if (textLower.includes(term)) {
          const count = (textLower.match(new RegExp(term, "g")) || []).length;
          score += 1.0 + Math.min(count * 0.3, 3.0);
        }
      }

      return {
        source: chunk.source,
        role: chunk.role,
        section: chunk.section,
        content: chunk.content,
        score: Math.round(score * 100) / 100
      };
    });

    scored.sort((a, b) => b.score - a.score);

    // Return topK or fallback
    const filtered = scored.filter(s => s.score > 0);
    if (filtered.length > 0) {
      return filtered.slice(0, topK);
    }
    return scored.slice(0, topK);
  }
}

export const ragService = new CareerRAGService();
