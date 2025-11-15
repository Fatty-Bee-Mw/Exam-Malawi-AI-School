from __future__ import annotations

from pathlib import Path
from typing import List, Tuple, Optional

from .config import TEXTBOOKS_DIR, CHUNK_SIZE_WORDS, CHUNK_OVERLAP_WORDS, ensure_directories


SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".docx", ".doc"}


def discover_textbook_files(root: Optional[Path] = None) -> Tuple[List[Path], List[Path]]:
    """Return (supported_by_extension, unsupported_by_extension) textbook files.

    Supported-by-extension means the suffix is one of TXT, PDF, DOCX, DOC.
    Actual readability (e.g. missing libraries) is handled separately.
    """
    ensure_directories()
    root = root or TEXTBOOKS_DIR
    supported: List[Path] = []
    unsupported: List[Path] = []

    if not root.exists():
        return supported, unsupported

    for path in root.rglob("*"):
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
    except Exception as exc:  # pragma: no cover - import-time failure
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
    except Exception as exc:  # pragma: no cover - import-time failure
        raise RuntimeError("Missing dependency 'python-docx' for DOCX support") from exc

    document = docx.Document(str(path))
    return "\n".join(p.text for p in document.paragraphs)


def _load_doc(path: Path) -> str:
    """Best-effort loader for legacy .doc files.

    Tries to use textract if available; otherwise raises RuntimeError so the caller
    can record this file as unsupported at runtime.
    """
    try:
        import textract  # type: ignore
    except Exception as exc:  # pragma: no cover - import-time failure
        raise RuntimeError("Missing dependency 'textract' for DOC support") from exc

    raw = textract.process(str(path))
    return raw.decode("utf-8", errors="ignore")


def load_text_from_file(path: Path) -> Tuple[Optional[str], Optional[str]]:
    """Load text and return (text_or_none, unsupported_reason_or_none).

    If the file cannot be read (missing dependency, error, empty text), returns
    (None, reason) so that the caller can record it as skipped.
    """
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
    except Exception as exc:  # pragma: no cover - unexpected failure
        return None, f"Error reading file: {exc}"

    if not text or not text.strip():
        return None, "File contains no extractable text"

    return text, None


def chunk_text(
    text: str,
    chunk_size_words: int = CHUNK_SIZE_WORDS,
    overlap_words: int = CHUNK_OVERLAP_WORDS,
) -> List[str]:
    """Split raw text into overlapping word-based chunks.

    Returns a list of strings, each roughly `chunk_size_words` long, with
    `overlap_words` words of overlap between consecutive chunks.
    """
    words = text.split()
    if not words:
        return []

    chunks: List[str] = []
    start = 0
    step = max(1, chunk_size_words - overlap_words)

    while start < len(words):
        end = start + chunk_size_words
        chunk_words = words[start:end]
        if not chunk_words:
            break
        chunks.append(" ".join(chunk_words))
        start += step

    return chunks
