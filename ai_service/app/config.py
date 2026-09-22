import os

from dotenv import load_dotenv


load_dotenv()


LLM_API_KEY = os.getenv("GROQ_API_KEY")
LLM_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b",
)


if not LLM_API_KEY:
    raise ValueError("GROQ_API_KEY is not set")