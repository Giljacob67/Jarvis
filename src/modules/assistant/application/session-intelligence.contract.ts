import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { SessionSnapshot } from "@/modules/assistant/domain/session.types";

export type SessionUpdateInput = {
  userMessage: string;
  assistantReply?: string;
  toolName?: string;
  toolResultSummary?: string;
  topicTag?: string;
};

export interface SessionIntelligenceContract {
  getSnapshot(sessionId: string): Promise<SessionSnapshot>;
  setMode(sessionId: string, mode: AssistantMode): Promise<SessionSnapshot>;
  shouldSuppressRepetition(sessionId: string, userMessage: string, candidateTopic: string): Promise<boolean>;
  updateSnapshot(sessionId: string, input: SessionUpdateInput): Promise<SessionSnapshot>;
  reset(sessionId: string): Promise<SessionSnapshot>;
}