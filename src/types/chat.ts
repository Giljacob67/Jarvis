import type { IntentType } from "@/modules/assistant/domain/intent.types";
import type { AssistantMode } from "@/modules/assistant/domain/mode.types";

export type ChatRequest = {
  sessionId?: string;
  message: string;
  mode?: AssistantMode;
};

export type ChatResponseMeta = {
  bypassedModel: boolean;
  modelUsed: boolean;
  policyMaxSentences: 1 | 2 | 3;
  debug?: {
    intentType: IntentType;
    modelName?: string;
    modelLatencyMs?: number;
    fallbackUsed?: boolean;
    routerValidationCases?: number;
    routerValidationPass?: boolean;
  };
};

export type ChatResponse = {
  sessionId: string;
  mode: AssistantMode;
  intentType: IntentType;
  reply: string;
  meta: ChatResponseMeta;
};