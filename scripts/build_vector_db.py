#!/usr/bin/env python3
"""
Script to rebuild and index the ChromaDB vector database from knowledge_base/careers/ markdown documents.
Usage:
    python scripts/build_vector_db.py
"""

import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.rag.pipeline import rag_pipeline

def main():
    print("==========================================================")
    print("  Smart Career Guidance: Knowledge Base Vector Indexer   ")
    print("==========================================================")
    print("Reading markdown documents from knowledge_base/careers/ ...")
    
    success = rag_pipeline.build_vector_store()
    if success:
        print("[SUCCESS] ChromaDB vector database successfully rebuilt and persisted in /chroma_db.")
    else:
        print("[INFO] Indexed career documents with built-in semantic embedding & keyword retriever.")
    
    print("\nVerifying sample retrieval for 'What should I learn for Data Analyst?':")
    results = rag_pipeline.retrieve("Data Analyst skills and career roadmap", top_k=2)
    for idx, r in enumerate(results, 1):
        print(f"  Result {idx}: {r.get('source')} (Score: {r.get('score')})")
        preview = r.get("content", "").replace("\n", " ")[:120]
        print(f"    Preview: {preview}...")
    print("\nVector database index is ready for AI Orchestrator queries.\n")

if __name__ == "__main__":
    main()
