import os

from dotenv import load_dotenv

load_dotenv()


def _require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(
            f"Missing required environment variable: {name}. "
            "Copy .env.example to .env and fill in your local values."
        )
    return value


DB_SETTINGS = {
    "host": _require("DB_HOST"),
    "user": _require("DB_USER"),
    "password": _require("DB_PASSWORD"),
    "database": _require("DB_DATABASE"),
    "charset": os.environ.get("DB_CHARSET", "utf8"),
}
