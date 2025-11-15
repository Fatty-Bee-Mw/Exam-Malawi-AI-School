from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

import faiss  # type: ignore
import numpy as np
import torch
from sentence_transformers import SentenceTransformer  # type: ignore
from transformers import AutoModelForCausalLM, AutoTokenizer  # type: ignore

from .config import (
    FAISS_INDEX_PATH,
    DOCSTORE_PATH,
    METADATA_PATH,
    EMBEDDING_MODEL_NAME,
    LLM_MODEL_NAME,
    TOP_K_CHUNKS,
    MAX_CONTEXT_CHARS,
    MAX_NEW_TOKENS,
    TEMPERATURE,
    TOP_P,
    ensure_directories,
)


class RAGTutor:
    """Retrieval-Augmented Generation tutor over Malawian textbooks."""

    def __init__(self) -> None:
        ensure_directories()

        if not FAISS_INDEX_PATH.exists() or not DOCSTORE_PATH.exists():
            raise RuntimeError(
                "Vector index not found. Run `python -m malawian_educational_ai_tutor.build_index` first."
            )

        with DOCSTORE_PATH.open("r", encoding="utf-8") as f:
            self._docstore: List[Dict[str, Any]] = json.load(f)

        if not self._docstore:
            raise RuntimeError("Vector index is empty. Add textbooks and rebuild the index.")

        self._index = faiss.read_index(str(FAISS_INDEX_PATH))

        # Embedding model (CPU-only)
        self._embedder = SentenceTransformer(EMBEDDING_MODEL_NAME, device="cpu")

        # LLM (TinyLLaMA CPU variant)
        self._tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
        self._model = AutoModelForCausalLM.from_pretrained(
            LLM_MODEL_NAME,
            torch_dtype=torch.float32,
        )
        self._model.to(torch.device("cpu"))
        self._model.eval()

    def _retrieve_context(self, question: str) -> Tuple[str, List[Dict[str, Any]]]:
        """Return (context_string, list_of_chunk_metadata)."""
        if not question.strip():
            raise ValueError("Question must not be empty")

        query_embedding = self._embedder.encode(
            [question],
            convert_to_numpy=True,
            normalize_embeddings=True,
        ).astype("float32")

        total_chunks = len(self._docstore)
        k = min(TOP_K_CHUNKS, total_chunks)
        if k <= 0:
            raise RuntimeError("No chunks available in docstore.")

        scores, indices = self._index.search(query_embedding, k)
        idxs = indices[0]

        chosen_chunks: List[Dict[str, Any]] = []
        context_parts: List[str] = []
        total_chars = 0

        for rank, idx in enumerate(idxs):
            if idx < 0 or idx >= total_chunks:
                continue
            meta = self._docstore[int(idx)]
            text = meta.get("text", "")
            if not text:
                continue

            if total_chars + len(text) > MAX_CONTEXT_CHARS and context_parts:
                break

            chosen_chunks.append(meta)
            context_parts.append(text)
            total_chars += len(text)

        context = "\n\n".join(context_parts)
        return context, chosen_chunks

    def _build_prompt(self, question: str, context: str) -> str:
        system_instructions = (
            "You are a helpful Malawian Educational AI Tutor. "
            "Answer the student's question using ONLY the information in the CONTEXT from the textbooks. "
            "If the answer cannot be found in the context, explicitly say that the textbooks do not provide the answer. "
            "Keep explanations clear and suitable for Malawian secondary school students."
        )

        prompt = (
            f"[SYSTEM]\n{system_instructions}\n\n"
            f"[CONTEXT]\n{context}\n\n"
            f"[QUESTION]\n{question}\n\n"
            f"[ANSWER]"
        )
        return prompt

    def answer_question(self, question: str) -> str:
        """Generate an answer grounded in the indexed textbooks."""
        context, _ = self._retrieve_context(question)

        if not context.strip():
            return (
                "I could not find any relevant information in the textbooks for this question. "
                "Please add more textbooks or rebuild the index."
            )

        prompt = self._build_prompt(question, context)

        input_ids = self._tokenizer.encode(prompt, return_tensors="pt")
        input_ids = input_ids.to(torch.device("cpu"))

        with torch.no_grad():
            output_ids = self._model.generate(
                input_ids,
                max_new_tokens=MAX_NEW_TOKENS,
                do_sample=True,
                temperature=TEMPERATURE,
                top_p=TOP_P,
                pad_token_id=self._tokenizer.eos_token_id,
            )

        generated_ids = output_ids[0][input_ids.shape[1] :]
        answer = self._tokenizer.decode(generated_ids, skip_special_tokens=True)
        return answer.strip()
