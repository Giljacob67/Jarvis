# Jarvis V2 Architecture (Foundation)

## Objective
Create a production-oriented base for a voice-first assistant with strong PT-BR behavior.

## Layered Design
- Intent Router: classifies inputs into defined intent taxonomy.
- Response Policy: enforces concise PT-BR response behavior.
- Session Intelligence: short-term context and anti-repetition memory.
- Tool Runtime: planned for Phase 2+ only.
- Speech Formatting Layer: contract in place; runtime deferred.

## Phase 1 Scope
- Next.js app foundation.
- Domain and application contracts only.
- Supabase base setup.
- Minimal chat UI scaffold.

## Out of Scope (Phase 1)
- Voice runtime execution.
- Tool integrations.
- Document analysis implementation.