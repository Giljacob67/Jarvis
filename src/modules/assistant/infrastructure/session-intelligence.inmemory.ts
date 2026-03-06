import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { SessionSnapshot } from "@/modules/assistant/domain/session.types";
import type { SessionIntelligenceContract, SessionUpdateInput } from "@/modules/assistant/application/session-intelligence.contract";

const STOP_WORDS = new Set([
  "a", "o", "os", "as", "de", "da", "do", "das", "dos", "e", "ou", "para", "com", "sem", "em", "no", "na", "nos", "nas", "um", "uma", "me", "te", "se", "que", "como", "por", "favor", "jarvis", "modo", "sobre", "quero", "preciso",
]);

type SessionRecord = {
  snapshot: SessionSnapshot;
};

function defaultSnapshot(): SessionSnapshot {
  return {
    currentMode: "personal",
    lastTopics: [],
    lastQuestionsAsked: [],
    lastToolResults: [],
    lastBriefingTimestamp: null,
  };
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTopics(message: string): string[] {
  const tokens = normalize(message)
    .split(" ")
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));

  const unique: string[] = [];
  for (const token of tokens) {
    if (!unique.includes(token)) unique.push(token);
    if (unique.length >= 3) break;
  }

  return unique;
}

export class SessionIntelligenceInMemory implements SessionIntelligenceContract {
  private readonly store = new Map<string, SessionRecord>();

  async getSnapshot(sessionId: string): Promise<SessionSnapshot> {
    if (!this.store.has(sessionId)) {
      this.store.set(sessionId, { snapshot: defaultSnapshot() });
    }

    return this.store.get(sessionId)!.snapshot;
  }

  async setMode(sessionId: string, mode: AssistantMode): Promise<SessionSnapshot> {
    const snapshot = await this.getSnapshot(sessionId);
    snapshot.currentMode = mode;
    return snapshot;
  }

  async shouldSuppressRepetition(sessionId: string, userMessage: string, candidateTopic: string): Promise<boolean> {
    if (!candidateTopic) return false;

    const snapshot = await this.getSnapshot(sessionId);
    const normalizedCandidate = normalize(candidateTopic);
    const userTopics = extractTopics(userMessage);

    // If user explicitly reintroduces the topic, do not suppress repetition.
    if (userTopics.some((topic) => normalize(topic) === normalizedCandidate)) {
      return false;
    }

    return snapshot.lastTopics.some((topic) => normalize(topic) === normalizedCandidate);
  }

  async updateSnapshot(sessionId: string, input: SessionUpdateInput): Promise<SessionSnapshot> {
    const snapshot = await this.getSnapshot(sessionId);

    const newTopics = extractTopics(input.userMessage);
    const canonical = input.topicTag ? [normalize(input.topicTag)] : [];
    snapshot.lastTopics = Array.from(new Set([...canonical, ...newTopics, ...snapshot.lastTopics])).slice(0, 10);

    if (input.userMessage.includes("?")) {
      snapshot.lastQuestionsAsked = [input.userMessage, ...snapshot.lastQuestionsAsked].slice(0, 10);
    }

    if (input.toolName && input.toolResultSummary) {
      snapshot.lastToolResults = [
        {
          toolName: input.toolName,
          summary: input.toolResultSummary,
          timestamp: new Date().toISOString(),
        },
        ...snapshot.lastToolResults,
      ].slice(0, 8);
    }

    if (input.assistantReply && /resumo|status|briefing/i.test(input.assistantReply)) {
      snapshot.lastBriefingTimestamp = new Date().toISOString();
    }

    return snapshot;
  }

  async reset(sessionId: string): Promise<SessionSnapshot> {
    const snapshot = await this.getSnapshot(sessionId);
    const preservedMode = snapshot.currentMode;

    this.store.set(sessionId, {
      snapshot: {
        ...defaultSnapshot(),
        currentMode: preservedMode,
      },
    });

    return this.store.get(sessionId)!.snapshot;
  }
}