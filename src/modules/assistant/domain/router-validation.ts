import type { IntentType } from "@/modules/assistant/domain/intent.types";

export type RouterValidationCase = {
  input: string;
  expectedIntent: IntentType;
};

export const ROUTER_VALIDATION_SET_PTBR: RouterValidationCase[] = [
  { input: "mudar para modo profissional", expectedIntent: "mode_switch" },
  { input: "responda de forma objetiva", expectedIntent: "direct_command" },
  { input: "quais tarefas tenho hoje", expectedIntent: "tool_action" },
  { input: "como estamos agora", expectedIntent: "status_query" },
  { input: "analise este pdf", expectedIntent: "document_analysis" },
  { input: "me ajuda a organizar meu dia", expectedIntent: "open_conversation" },
];