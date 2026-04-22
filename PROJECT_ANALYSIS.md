# Project Analysis: Chatbot Integration

## Overview
The IntelliFund platform now features an integrated AI Assistant (Chatbot) to help users navigate the platform and get instant information about investments, market trends, and risk assessment.

## Architecture
- **Frontend**: A floating component (`Chatbot.tsx`) implemented in React. It now sends `user_id` to maintain conversation context.
- **Backend**: 
  - **Endpoint**: `POST /api/chat`
  - **Logic**: Upgraded to an LLM-powered `ChatService` using Groq's Llama-3 models.
  - **Tool Calling**: The LLM can intelligently call `recommend_funds` and `get_market_insights` based on user intent.
  - **Context**: Maintains the last 10 messages per user session in-memory.
  - **Schemas**: Updated `ChatRequest` and `ChatResponse` for structured data exchange.

## Interaction Flow
1. User types a message.
2. Frontend sends message + user ID to `/api/chat`.
3. LLM processes the message and decides if it needs to call any internal tools (Recommendations/Market).
4. If a tool is called, the service executes it and provides the structured data back to the user.
5. Frontend displays the text response and (optionally) the structured data.

## Tech Stack Updates
- **Backend**: FastAPI, Pydantic, Groq (LLM).
  - Config: `backend/.env` (Secure secrets: GROQ_API_KEY).
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion.
  - Config: `.env` (Public Vite variables).

## Project Structure
```
intellifund-main/
├── .env (Vite configs)
├── .gitignore (ignores all .env)
├── backend/
│   ├── .env (Secrets: GROQ_API_KEY)
│   ├── main.py (Validates config at startup)
│   └── services/
│       └── chat_service.py (Loads backend .env)
└── src/
    └── components/
        └── Chatbot.tsx
```
