import type { SessionSnapshot } from "@/modules/assistant/domain/session.types";

export type SessionUpdateInput = {
  userMessage: string;
  assistantReply?: string;
};

export interface SessionIntelligenceContract {
  getSnapshot(sessionId: string): Promise<SessionSnapshot>;
  updateSnapshot(sessionId: string, input: SessionUpdateInput): Promise<SessionSnapshot>;
}