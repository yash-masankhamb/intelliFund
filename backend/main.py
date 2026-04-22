import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.routes import router as api_router

# Load backend environment variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

# Validate required API keys
if not os.getenv("GROQ_API_KEY"):
    raise RuntimeError(
        f"CRITICAL ERROR: GROQ_API_KEY is missing in {env_path}. "
        "The chatbot requires this key to function."
    )

app = FastAPI(title="IntelliFund Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "IntelliFund backend is running"}