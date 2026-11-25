from pathlib import Path
import os
import re
from dotenv import load_dotenv

# Repo root is two levels up from backend/app/config.py
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
REPO_ROOT = BACKEND_DIR.parent

load_dotenv(REPO_ROOT / ".env")


def _looks_like_ollama_key(key: str) -> bool:
    return bool(key and re.match(r"^[0-9a-f]{32}\.[A-Za-z0-9_-]+$", key.strip()))


class Settings:
    APP_NAME: str = "Satya — Indian Consumer Rights & Protection AI"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DOMAIN: str = "consumer_rights_india"

    # LLM configuration (strictly server-side)
    LLM_API_KEY: str = (
        os.getenv("LLM_API_KEY")
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("OPENAI_API_KEY")
        or ""
    )
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or (
        os.getenv("LLM_API_KEY", "") if os.getenv("LLM_API_KEY", "").startswith("AIza") else ""
    )
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY") or (
        os.getenv("LLM_API_KEY", "") if os.getenv("LLM_API_KEY", "").startswith("sk-") else ""
    )
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3.5-flash")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "local-hybrid")
    DISABLE_LLM: bool = os.getenv("SATYA_DISABLE_LLM", "0") == "1"

    # Dedicated translation provider configuration (auto | ollama | groq | grok | openai | gemini | fast)
    TRANSLATION_PROVIDER: str = os.getenv("TRANSLATION_PROVIDER", "auto")
    TRANSLATION_API_KEY: str = os.getenv("TRANSLATION_API_KEY", "")
    TRANSLATION_MODEL: str = os.getenv("TRANSLATION_MODEL", "")
    TRANSLATION_BASE_URL: str = os.getenv("TRANSLATION_BASE_URL", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    XAI_API_KEY: str = os.getenv("XAI_API_KEY") or os.getenv("GROK_API_KEY", "")
    OLLAMA_API_KEY: str = (
        os.getenv("OLLAMA_API_KEY")
        or (os.getenv("TRANSLATION_API_KEY", "") if TRANSLATION_PROVIDER.lower() == "ollama" else "")
        or (
            os.getenv("LLM_API_KEY", "")
            if (
                LLM_PROVIDER.lower() == "ollama"
                or TRANSLATION_PROVIDER.lower() == "ollama"
                or _looks_like_ollama_key(os.getenv("LLM_API_KEY", ""))
            )
            else ""
        )
    )
    OLLAMA_BASE_URL: str = (
        os.getenv("OLLAMA_BASE_URL")
        or ("https://ollama.com" if OLLAMA_API_KEY else "http://127.0.0.1:11434")
    )
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "")

    # Paths
    DATA_DIR: Path = REPO_ROOT / "data"
    SOURCES_DIR: Path = DATA_DIR / "sources"
    PROCESSED_DIR: Path = DATA_DIR / "processed"
    CHUNKS_PATH: Path = Path(
        os.getenv("CHUNKS_PATH", str(DATA_DIR / "processed" / "chunks.json"))
    )
    SOURCE_MANIFEST_PATH: Path = Path(
        os.getenv("SOURCE_MANIFEST_PATH", str(DATA_DIR / "source_manifest.json"))
    )
    VECTOR_DB_PATH: Path = Path(
        os.getenv("VECTOR_DB_PATH", str(DATA_DIR / "vector_store"))
    )
    FEEDBACK_LOG_PATH: Path = Path(
        os.getenv("FEEDBACK_LOG_PATH", str(DATA_DIR / "feedback.jsonl"))
    )
    SYSTEM_PROMPT_PATH: Path = REPO_ROOT / "prompts" / "consumer_answer_system.txt"

    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    ADMIN_TOKEN: str = os.getenv("ADMIN_TOKEN", "satya-local-admin")


settings = Settings()
