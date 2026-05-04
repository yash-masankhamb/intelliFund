# Project Analysis: IntelliFund Platform

## Overview
IntelliFund is a comprehensive AI-powered investment advisory platform designed to help users make informed financial decisions. The platform provides personalized mutual fund recommendations, real-time market insights, and an interactive AI assistant to guide users through their investment journey.

## Architecture
The system follows a modern decoupled architecture:

- **Frontend**: A high-performance Single Page Application (SPA) built with **React** and **Vite**.
  - **State Management**: React Hooks and Context for local state.
  - **Navigation**: React Router for seamless transitions.
  - **Styling**: Tailwind CSS with a custom "glassmorphism" design system and **Framer Motion** for micro-animations.
  - **Icons**: Lucide React for consistent iconography.

- **Backend**: A robust API layer built with **FastAPI**.
  - **LLM Integration**: **Groq (Llama-3)** for natural language processing and chatbot logic.
  - **Data Processing**: Custom services for fund classification and market trend analysis.
  - **Tool Calling**: The LLM can dynamically trigger backend functions (recommendations/insights) based on user intent.

- **Data & Auth Layer**: **Supabase** (Backend-as-a-Service).
  - **Authentication**: Managed via Supabase Auth (JWT-based).
  - **Database**: PostgreSQL with real-time capabilities.
  - **Persistence**: User profiles and investment preferences are synced across sessions.

## Tech Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Shadcn UI |
| **Backend** | Python 3.10+, FastAPI, Pydantic, Groq SDK |
| **Database/Auth** | Supabase (PostgreSQL), GoTrue (Auth) |
| **AI/ML** | Llama-3 (via Groq), Custom Recommendation Engine |
| **DevOps** | NPM (Frontend), Uvicorn (Backend) |

## Interaction Flow
1. **Onboarding**: User signs up/logs in via `AuthPage`.
2. **Profile Completion**: User completes the investment questionnaire on `AdvisorPage`. This data is saved to the `user_profiles` table in Supabase.
3. **Analysis**:
   - The **Recommendation Engine** processes user risk profile and goal data to suggest funds.
   - The **Market Service** fetches and analyzes current market trends.
4. **Insights**: User views personalized results on `RecommendationPage` and `MarketInsightsPage`.
5. **AI Assistance**: The floating `Chatbot` component provides real-time support, able to fetch data or answer general queries using context from the user's profile.

## Supabase Integration
### Database Schema
- **`profiles`**: Basic user account information.
- **`user_profiles`**: Detailed investment preferences (income, stability, SIP amount, experience, risk profile, goal, horizon).
- **`advisory_responses`**: History of questionnaire responses for tracking changes over time.

### Security
- **Auth Hooks**: Automatic profile creation on signup (implemented via Supabase triggers/functions).
- **RLS**: Row-Level Security ensures users can only access their own data.

## APIs & Services
### Backend Endpoints
- `POST /api/chat`: Main AI assistant endpoint (maintains context, handles tool calling).
- `GET /api/funds/recommendations`: Fetches filtered fund data based on risk score and goals.
- `GET /api/funds/market-insights`: Provides current market status and sector analysis.

### External APIs
- **Groq Cloud API**: Powers the Llama-3 model for high-speed AI responses.
- **Supabase API**: Handles all database and auth operations.

## Recent Changes
- **Fix: AdvisorPage Conflict**: Resolved a naming collision between Lucide's `User` icon and Supabase's `User` type by aliasing the icon as `UserIcon`.
- **Chatbot Context**: Implemented `user_id` tracking in the chatbot to maintain multi-turn conversation memory.
- **Profile Synchronization**: Improved the `upsert` logic for user preferences to ensure data consistency between the advisor flow and recommendations.

## Future Improvements
- **Interactive Charts**: Implement Recharts or D3.js for better visualization of fund performance.
- **Portfolio Tracking**: Add functionality to track actual investments vs recommended targets.
- **Enhanced AI Memory**: Move chatbot context from in-memory (backend) to Supabase to persist conversations across sessions.
- **Vector Search**: Implement pgvector in Supabase for semantic search of mutual fund documents/prospectuses.

## Project Structure
```
intellifund-main/
├── backend/
│   ├── main.py                # API Entry point & Config validation
│   ├── routes/                # Endpoint definitions (chat, funds)
│   ├── services/              # Core logic (recommendations, market, AI)
│   └── schemas.py             # Pydantic models for request/response
├── src/
│   ├── components/            # Reusable UI (Chatbot, Nav, UI kit)
│   ├── integrations/          # Supabase client & types
│   ├── pages/                 # Full-page views (Advisor, Market, etc.)
│   └── utils/                 # Helper functions (profile validation)
└── .env                       # Environment configuration
```
