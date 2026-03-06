import type { AssistantMode } from "@/modules/assistant/domain/mode.types";

export type IntentType =
  | "mode_switch"
  | "direct_command"
  | "tool_action"
  | "status_query"
  | "document_analysis"
  | "open_conversation";

export type IntentResult = {
  type: IntentType;
  confidence: number;
  targetMode?: AssistantMode;
  requiredTools?: string[];
};