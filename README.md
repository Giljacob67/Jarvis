# Jarvis V2 - Phase 1 Foundation

## Stack
- Next.js (App Router)
- TypeScript
- Supabase base client/server wiring
- Zod for env validation

## Implemented in Phase 1
- App skeleton with routes: Chat, Tasks, Calendar, Settings
- Minimal chat scaffold UI
- Modular contracts for assistant architecture
- Config/env validation layer
- Architecture docs and SLO docs

## Not implemented in Phase 1
- Runtime voice pipeline
- Tool integrations (tasks/calendar/memory runtime)
- Document analysis implementation

## Setup
1. Install dependencies:
   - `npm install`
2. Create local environment file:
   - Copy `.env.example` to `.env.local`
   - Fill values for Supabase and OpenAI keys
3. Run checks:
   - `npm run lint`
   - `npm run typecheck`
4. Run app:
   - `npm run dev`
   - Open `http://localhost:3000/chat`

## Notes
- Env validation throws explicit errors if required keys are missing.
- Voice and tools are contract-ready and will be implemented in Phase 2+.