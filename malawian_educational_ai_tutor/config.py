from pathlib import Path


# Root of this project
PROJECT_ROOT = Path(__file__).resolve().parent

# Directory where you will place your textbooks (TXT, PDF, DOCX, DOC*)
TEXTBOOKS_DIR = PROJECT_ROOT / "data" / "textbooks"

# Directory where FAISS index, embeddings and metadata will be stored
INDEX_DIR = PROJECT_ROOT / "data" / "index"

# Embedding model (CPU-friendly)
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# LLM model (TinyLLaMA CPU variant)
LLM_MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# Chunking configuration (in words)
CHUNK_SIZE_WORDS = 500
CHUNK_OVERLAP_WORDS = 50

# Number of retrieved chunks to feed into the LLM
TOP_K_CHUNKS = 5

# Paths for index artifacts
FAISS_INDEX_PATH = INDEX_DIR / "faiss_index.bin"
DOCSTORE_PATH = INDEX_DIR / "documents.json"
METADATA_PATH = INDEX_DIR / "index_metadata.json"

# Maximum total characters from retrieved chunks to pass into the LLM
MAX_CONTEXT_CHARS = 6000

# Generation parameters for the LLM
MAX_NEW_TOKENS = 256
TEMPERATURE = 0.3
TOP_P = 0.9


def ensure_directories() -> None:
    """Ensure required directories exist."""
    TEXTBOOKS_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
