# Jarvis V2 Architecture

## Objective
Production-oriented architecture for a voice-first assistant with PT-BR behavior and low latency targets.

## Phase 1 (done)
- Next.js foundation and modular contracts.
- Supabase base wiring.
- Chat scaffold and docs.

## Phase 2 (done)
- Core Assistant text flow with deterministic mode/direct paths.
- Session intelligence in memory.
- Minimal tool runtime base.

## Phase 3 (current)
OpenAI Text Brain integration (text-only).

### Runtime flow
1. `POST /api/chat` receives `{ sessionId?, mode?, message }`.
2. `CoreAssistantService` orchestrates intent, session, tool runtime and response policy.
3. Deterministic bypass without model:
   - `mode_switch`
   - `direct_command`
4. Model-eligible intents:
   - `open_conversation`
   - `status_query` (only when synthesis is needed)
   - `tool_action` (textual synthesis)
5. `PromptBuilder` always injects:
   - `responseChannel: text`
   - `futureVoiceReady: true`
6. `ResponsePolicyService` enforces concise output shape after model generation.
7. Development debug metadata is included in `/api/chat`; production omits debug metadata.

## Out of scope in Phase 3
- Realtime voice runtime.
- External task/calendar integrations.
- Document analysis runtime.