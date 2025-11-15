from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import numpy as np
from sentence_transformers import SentenceTransformer  # type: ignore


BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
SAMPLE_DATA_DIR = ROOT_DIR / "sample_training_data"
OUTPUT_PATH = BASE_DIR / "embeddings.json"

SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".docx", ".doc"}

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

CHUNK_SIZE_WORDS = 500
CHUNK_OVERLAP_WORDS = 50

# Size controls to keep embeddings.json Netlify/GitHub-friendly
MAX_CHUNKS_PER_DOCUMENT = 20
MAX_TOTAL_CHUNKS = 5000
EMBEDDING_DECIMALS = 3


def discover_files() -> Tuple[List[Path], List[Path]]:
    supported: List[Path] = []
    unsupported: List[Path] = []

    if not SAMPLE_DATA_DIR.exists():
        return supported, unsupported

    for path in SAMPLE_DATA_DIR.rglob("*"):
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        if ext in SUPPORTED_EXTENSIONS:
            supported.append(path)
        else:
            unsupported.append(path)

    return supported, unsupported


def _load_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _load_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("Missing dependency 'pypdf' for PDF support") from exc

    reader = PdfReader(str(path))
    texts = []
    for page in reader.pages:
        try:
            texts.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(texts)


def _load_docx(path: Path) -> str:
    try:
        import docx  # type: ignore
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("Missing dependency 'python-docx' for DOCX support") from exc

    document = docx.Document(str(path))
    return "\n".join(p.text for p in document.paragraphs)


def _load_doc(path: Path) -> str:
    try:
        import textract  # type: ignore
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("Missing dependency 'textract' for DOC support") from exc

    raw = textract.process(str(path))
    return raw.decode("utf-8", errors="ignore")


def load_text(path: Path) -> Tuple[Optional[str], Optional[str]]:
    ext = path.suffix.lower()
    try:
        if ext == ".txt":
            text = _load_txt(path)
        elif ext == ".pdf":
            text = _load_pdf(path)
        elif ext == ".docx":
            text = _load_docx(path)
        elif ext == ".doc":
            text = _load_doc(path)
        else:
            return None, f"Extension {ext} not supported"
    except RuntimeError as exc:
        return None, str(exc)
    except Exception as exc:  # pragma: no cover
        return None, f"Error reading file: {exc}"

    if not text or not text.strip():
        return None, "File contains no extractable text"

    return text, None


def chunk_text(text: str) -> List[str]:
    words = text.split()
    if not words:
        return []

    chunks: List[str] = []
    start = 0
    step = max(1, CHUNK_SIZE_WORDS - CHUNK_OVERLAP_WORDS)

    while start < len(words):
        end = start + CHUNK_SIZE_WORDS
        chunk_words = words[start:end]
        if not chunk_words:
            break
        chunks.append(" ".join(chunk_words))
        start += step

    return chunks


def select_chunks_for_doc(chunks: List[str], slots_remaining: int) -> List[Tuple[int, str]]:
    if slots_remaining <= 0 or not chunks:
        return []

    max_for_doc = min(MAX_CHUNKS_PER_DOCUMENT, slots_remaining, len(chunks))
    if len(chunks) <= max_for_doc:
        return list(enumerate(chunks))

    # Uniform sampling across the document
    step = len(chunks) / float(max_for_doc)
    selected: List[Tuple[int, str]] = []
    for i in range(max_for_doc):
        idx = int(round(i * step))
        if idx >= len(chunks):
            idx = len(chunks) - 1
        selected.append((idx, chunks[idx]))

    # Ensure unique indices preserving order
    seen = set()
    unique: List[Tuple[int, str]] = []
    for idx, text in selected:
        if idx in seen:
            continue
        seen.add(idx)
        unique.append((idx, text))

    return unique


def build_embeddings_json() -> Dict[str, object]:
    BASE_DIR.mkdir(parents=True, exist_ok=True)

    files, unsupported_by_ext = discover_files()

    runtime_unsupported: List[Dict[str, str]] = []
    all_chunks: List[Dict[str, object]] = []

    model = SentenceTransformer(EMBEDDING_MODEL_NAME, device="cpu")
    dimension = int(model.get_sentence_embedding_dimension())

    slots_remaining = MAX_TOTAL_CHUNKS

    for path in sorted(files):
        if slots_remaining <= 0:
            break

        rel_path = str(path.relative_to(ROOT_DIR))
        text, reason = load_text(path)
        if text is None:
            runtime_unsupported.append({"path": rel_path, "reason": reason or "unreadable"})
            continue

        chunks = chunk_text(text)
        if not chunks:
            runtime_unsupported.append({"path": rel_path, "reason": "no_chunks_after_split"})
            continue

        selected = select_chunks_for_doc(chunks, slots_remaining)
        if not selected:
            continue

        chunk_texts = [t for _, t in selected]
        embeddings = model.encode(
            chunk_texts,
            batch_size=16,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True,
        ).astype("float32")

        for (local_idx, chunk_text_value), emb in zip(selected, embeddings):
            if slots_remaining <= 0:
                break

            rounded = [round(float(v), EMBEDDING_DECIMALS) for v in emb.tolist()]
            chunk_record: Dict[str, object] = {
                "id": f"{rel_path}::chunk_{local_idx}",
                "source_file": rel_path,
                "chunk_index": int(local_idx),
                "text": chunk_text_value,
                "embedding": rounded,
            }
            all_chunks.append(chunk_record)
            slots_remaining -= 1

        if slots_remaining <= 0:
            break

    unsupported: List[Dict[str, str]] = runtime_unsupported.copy()
    for path in unsupported_by_ext:
        unsupported.append(
            {
                "path": str(path.relative_to(ROOT_DIR)),
                "reason": "extension_not_in_[txt,pdf,doc,docx]",
            }
        )

    result: Dict[str, object] = {
        "embedding_model": EMBEDDING_MODEL_NAME,
        "dimension": dimension,
        "chunk_size_words": CHUNK_SIZE_WORDS,
        "chunk_overlap_words": CHUNK_OVERLAP_WORDS,
        "max_chunks_per_document": MAX_CHUNKS_PER_DOCUMENT,
        "max_total_chunks": MAX_TOTAL_CHUNKS,
        "total_chunks": len(all_chunks),
        "chunks": all_chunks,
        "unsupported_files": unsupported,
    }

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return result


def main() -> None:
    print("[Embeddings] Building embeddings.json from sample_training_data...")
    summary = build_embeddings_json()
    print("[Embeddings] Done.")
    print(json.dumps({k: v for k, v in summary.items() if k != "chunks"}, indent=2))


if __name__ == "__main__":  # pragma: no cover
    main()
