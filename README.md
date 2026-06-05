# AI workplace suit for productivity

An AI powered productivity application assistant that helps automate workplace tasks and accelerate productivity.

## Features

- Email generator - Draft polished emails by specifying audience, tone, and intent.
- AI Research Assistant - Get a structured brief with summary, key points, and next steps.
- AI Chatbot - Ask anything — brainstorm, summarize, plan.

## AI functionality

The application uses the Lovable AI Gateway (Google Gemini models) to power:
- Smart email generation — context-aware drafts with configurable recipient, tone, and length
- Structured research briefs — summary, key points, background, considerations/risks, and suggested next steps in markdown
- Conversational chatbot assistant — multi-turn Q&A, brainstorming, and summarization for workplace productivity

## Tech stack

- Lovable — AI-powered app builder and development platform
- Lovable AI Gateway — unified AI routing (Google Gemini models)
- Google Gemini API — LLM powering email, research, and chat features
- React 19 + TanStack Start — full-stack React framework with SSR
- TanStack Router & Query — type-safe routing and data fetching
- Supabase — backend (Postgres database, authentication, edge functions, storage)
