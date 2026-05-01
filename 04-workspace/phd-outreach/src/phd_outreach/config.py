import os
from pathlib import Path
from dotenv import load_dotenv


def load_config() -> dict:
    env_path = Path(".env")
    if not env_path.exists():
        env_path = Path(__file__).parent.parent.parent / ".env"
    load_dotenv(env_path)

    return {
        "gmail_address": os.environ.get("GMAIL_ADDRESS", ""),
        "gmail_app_password": os.environ.get("GMAIL_APP_PASSWORD", ""),
    }
