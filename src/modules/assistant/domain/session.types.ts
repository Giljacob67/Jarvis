import type { AssistantMode } from "@/modules/assistant/domain/mode.types";

export type ToolResultReference = {
  toolName: string;
  summary: string;
  timestamp: string;
};

export type SessionSnapshot = {
  currentMode: AssistantMode;
  lastTopics: string[];
  lastQuestionsAsked: string[];
  lastToolResults: ToolResultReference[];
  lastBriefingTimestamp: string | null;
};