from __future__ import annotations

import json
import hashlib
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import faiss  # type: ignore
from sentence_transformers import SentenceTransformer  # type: ignore

from .config import (
    TEXTBOOKS_DIR,
    INDEX_DIR,
    EMBEDDING_MODEL_NAME,
    FAISS_INDEX_PATH,
    DOCSTORE_PATH,
    METADATA_PATH,
    ensure_directories,
)
from .ingest import discover_textbook_files, load_text_from_file, chunk_text


FILE_CACHE_DIR = INDEX_DIR / "file_cache"
FILE_CACHE_METADATA_PATH = INDEX_DIR / "file_cache_metadata.json"


def _compute_file_id(path: Path) -> str:
    """Stable ID for a file based on its absolute path string."""
    h = hashlib.sha1(str(path.resolve()).encode("utf-8"))
    return h.hexdigest()[:16]


def _load_existing_file_metadata() -> Dict[str, Any]:
    if FILE_CACHE_METADATA_PATH.exists():
        with FILE_CACHE_METADATA_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save_file_metadata(metadata: Dict[str, Any]) -> None:
    with FILE_CACHE_METADATA_PATH.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)


def _load_cached_chunks_and_embeddings(cache_basename: str) -> Tuple[List[Dict[str, Any]], np.ndarray]:
    chunks_path = FILE_CACHE_DIR / f"{cache_basename}_chunks.json"
    emb_path = FILE_CACHE_DIR / f"{cache_basename}_embeddings.npy"

    if not chunks_path.exists() or not emb_path.exists():
        raise FileNotFoundError("Cache files not found")

    with chunks_path.open("r", encoding="utf-8") as f:
        chunks: List[Dict[str, Any]] = json.load(f)

    embeddings = np.load(emb_path)
    return chunks, embeddings


def _save_cached_chunks_and_embeddings(
    cache_basename: str,
    chunks: List[Dict[str, Any]],
    embeddings: np.ndarray,
) -> None:
    FILE_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    chunks_path = FILE_CACHE_DIR / f"{cache_basename}_chunks.json"
    emb_path = FILE_CACHE_DIR / f"{cache_basename}_embeddings.npy"

    with chunks_path.open("w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    np.save(emb_path, embeddings)


def build_or_update_index() -> Dict[str, Any]:
    """Scan textbooks, (re)build per-file caches, and write a FAISS index.

    Returns metadata describing the resulting index, including unsupported files.
    """
    ensure_directories()
    FILE_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    textbooks, unsupported_by_extension = discover_textbook_files(TEXTBOOKS_DIR)

    existing_meta = _load_existing_file_metadata()
    embedder = SentenceTransformer(EMBEDDING_MODEL_NAME, device="cpu")

    all_chunks: List[Dict[str, Any]] = []
    all_embeddings: List[np.ndarray] = []
    runtime_unsupported: List[Dict[str, Any]] = []

    for path in textbooks:
        path_str = str(path.resolve())
        stat = path.stat()
        file_id = _compute_file_id(path)
        cache_basename = file_id

        previous = existing_meta.get(path_str)
        cache_exists = False
        if previous is not None:
            if (
                previous.get("mtime_ns") == stat.st_mtime_ns
                and previous.get("size") == stat.st_size
            ):
                # Try to reuse cached embeddings/chunks
                try:
                    chunks, emb = _load_cached_chunks_and_embeddings(cache_basename)
                    all_chunks.extend(chunks)
                    all_embeddings.append(emb)
                    cache_exists = True
                except FileNotFoundError:
                    cache_exists = False

        if cache_exists:
            continue

        # Need to (re)compute
        text, reason = load_text_from_file(path)
        if text is None:
            runtime_unsupported.append(
                {
                    "path": path_str,
                    "reason": reason or "unreadable",
                }
            )
            continue

        chunk_texts = chunk_text(text)
        if not chunk_texts:
            runtime_unsupported.append(
                {
                    "path": path_str,
                    "reason": "no_chunks_after_split",
                }
            )
            continue

        # Compute embeddings for this file's chunks
        embeddings = embedder.encode(
            chunk_texts,
            batch_size=32,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True,
        ).astype("float32")

        # Build per-chunk metadata
        per_file_chunks: List[Dict[str, Any]] = []
        for idx, chunk in enumerate(chunk_texts):
            per_file_chunks.append(
                {
                    "id": f"{file_id}::chunk_{idx}",
                    "text": chunk,
                    "source_file": path_str,
                    "chunk_index": idx,
                }
            )

        _save_cached_chunks_and_embeddings(cache_basename, per_file_chunks, embeddings)

        all_chunks.extend(per_file_chunks)
        all_embeddings.append(embeddings)

        existing_meta[path_str] = {
            "path": path_str,
            "file_id": file_id,
            "mtime_ns": stat.st_mtime_ns,
            "size": stat.st_size,
            "cache_basename": cache_basename,
        }

    _save_file_metadata(existing_meta)

    # Prepare list of unsupported files, including by-extension ones
    unsupported_files: List[Dict[str, Any]] = runtime_unsupported.copy()
    for path in unsupported_by_extension:
        unsupported_files.append(
            {
                "path": str(path.resolve()),
                "reason": "extension_not_in_[txt,pdf,doc,docx]",
            }
        )

    if not all_embeddings:
        # No chunks at all; do not create an index
        metadata = {
            "total_chunks": 0,
            "files_indexed": [],
            "embedding_model": EMBEDDING_MODEL_NAME,
            "index_built": False,
            "unsupported_files": unsupported_files,
        }
        with METADATA_PATH.open("w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        return metadata

    # Build FAISS index from all per-file embeddings
    mat = np.vstack(all_embeddings).astype("float32")
    dim = mat.shape[1]

    index = faiss.IndexFlatIP(dim)
    index.add(mat)

    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(FAISS_INDEX_PATH))

    with DOCSTORE_PATH.open("w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    metadata = {
        "total_chunks": len(all_chunks),
        "files_indexed": list(existing_meta.values()),
        "embedding_model": EMBEDDING_MODEL_NAME,
        "index_type": "IndexFlatIP_normalized",
        "index_built": True,
        "unsupported_files": unsupported_files,
    }

    with METADATA_PATH.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    return metadata


def main() -> None:
    """CLI entry point to build or update the FAISS index."""
    print("[Tutor] Building/Updating FAISS index from textbooks...")
    metadata = build_or_update_index()
    print("[Tutor] Index build finished.")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":  # pragma: no cover - manual execution
    main()
