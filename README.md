# Jarvis V2 - Foundation + Core Assistant + Text Brain

## Stack
- Next.js (App Router)
- TypeScript
- Supabase base client/server wiring
- OpenAI SDK (text brain)
- Zod for env validation

## Implemented up to Phase 3
- App skeleton with routes: Chat, Tasks, Calendar, Settings
- Text-first chat wired to `/api/chat`
- Intent Router + Response Policy + Session Intelligence + minimal Tool Runtime
- OpenAI Text Brain with prompt builder and deterministic model gating
- Development-only debug metadata in API response
- PT-BR deterministic router validation set

## Not implemented yet
- Runtime voice pipeline
- Real external task/calendar integrations
- Document analysis implementation

## Setup
1. Install dependencies:
   - `npm install`
2. Create local environment file:
   - Copy `.env.example` to `.env.local`
   - Fill values for Supabase and OpenAI keys
3. Recommended env:
   - `OPENAI_TEXT_MODEL=gpt-4.1-mini`
4. Run checks:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
5. Run app:
   - `npm run dev`
   - Open `http://localhost:3000/chat`

## Notes
- `mode_switch` and `direct_command` are deterministic and model-free.
- Output is shaped for concise PT-BR and future spoken delivery.