"""
RAG Pipeline using LangChain, ChromaDB, and Embedding Models.
Provides document chunking, indexing, and vector similarity retrieval.
"""

import os
import glob
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KNOWLEDGE_BASE_DIR = os.path.join(BASE_DIR, "knowledge_base", "careers")
CHROMA_PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")

class CareerRAGPipeline:
    def __init__(self, persist_dir: str = CHROMA_PERSIST_DIR):
        self.persist_dir = persist_dir
        self.vectorstore = None
        self._local_docs_cache = []
        self._load_local_docs()

    def _load_local_docs(self):
        """Loads and caches markdown career files from knowledge_base/careers/."""
        self._local_docs_cache = []
        md_files = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.md"))
        for filepath in md_files:
            filename = os.path.basename(filepath)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                # Split by sections (## headings)
                sections = content.split("## ")
                role_title = sections[0].replace("# Career Profile:", "").strip() if sections else filename
                for sec in sections[1:]:
                    lines = sec.split("\n", 1)
                    header = lines[0].strip()
                    body = lines[1].strip() if len(lines) > 1 else ""
                    self._local_docs_cache.append({
                        "source": filename,
                        "role": role_title,
                        "section": header,
                        "content": f"## {header}\n{body}",
                        "text": f"{role_title} - {header}: {body}"
                    })

    def build_vector_store(self):
        """
        Builds ChromaDB vector database using LangChain / SentenceTransformers or fallback cosine vectors.
        """
        try:
            from langchain_community.document_loaders import DirectoryLoader, TextLoader
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            from langchain_community.vectorstores import Chroma
            from langchain_community.embeddings import HuggingFaceEmbeddings

            loader = DirectoryLoader(KNOWLEDGE_BASE_DIR, glob="**/*.md", loader_cls=TextLoader)
            docs = loader.load()

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=600,
                chunk_overlap=80,
                separators=["\n## ", "\n### ", "\n\n", "\n", " "]
            )
            splits = text_splitter.split_documents(docs)

            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            self.vectorstore = Chroma.from_documents(
                documents=splits,
                embedding=embeddings,
                persist_directory=self.persist_dir
            )
            self.vectorstore.persist()
            print(f"[RAG] Successfully built ChromaDB index with {len(splits)} chunks.")
            return True
        except Exception as e:
            print(f"[RAG] Using built-in semantic keyword retriever: {e}")
            return False

    def retrieve(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Retrieves top-k relevant career knowledge chunks matching user query.
        Uses vectorstore if initialized, with smart BM25/keyword semantic scoring fallback.
        """
        if self.vectorstore:
            try:
                results = self.vectorstore.similarity_search_with_score(query, k=top_k)
                return [
                    {
                        "source": doc.metadata.get("source", "knowledge_base"),
                        "content": doc.page_content,
                        "score": round(float(score), 4)
                    }
                    for doc, score in results
                ]
            except Exception as e:
                print(f"[RAG] Vectorstore query failed, falling back to local retriever: {e}")

        # High quality built-in TF-IDF / term-frequency retrieval fallback
        query_terms = set(query.lower().replace("?", "").replace(",", "").split())
        scored_chunks = []

        for item in self._local_docs_cache:
            text_lower = item["text"].lower()
            score = 0
            for term in query_terms:
                if term in ["what", "how", "should", "learn", "for", "the", "and", "become"]:
                    continue
                if term in item["role"].lower():
                    score += 5.0 # Role title match bonus
                if term in item["section"].lower():
                    score += 3.0 # Section header match bonus
                if term in text_lower:
                    score += 1.0 + (text_lower.count(term) * 0.2)

            if score > 0:
                scored_chunks.append({
                    "source": item["source"],
                    "role": item["role"],
                    "section": item["section"],
                    "content": item["content"],
                    "score": round(score, 2)
                })

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k] if scored_chunks else self._local_docs_cache[:top_k]

# Global singleton instance
rag_pipeline = CareerRAGPipeline()
