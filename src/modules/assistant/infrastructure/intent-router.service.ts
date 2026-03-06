import type { IntentRouterContract, IntentRouterInput } from "@/modules/assistant/application/intent-router.contract";
import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { IntentResult } from "@/modules/assistant/domain/intent.types";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function extractTargetMode(normalized: string): AssistantMode | undefined {
  if (normalized.includes("pessoal") || normalized.includes("personal")) return "personal";
  if (normalized.includes("profissional") || normalized.includes("professional")) return "professional";
  if (normalized.includes("estrategico") || normalized.includes("strategic")) return "strategic";
  return undefined;
}

export class IntentRouterService implements IntentRouterContract {
  async classify(input: IntentRouterInput): Promise<IntentResult> {
    const normalized = normalizeText(input.message);
    const targetMode = extractTargetMode(normalized);

    if (targetMode && /(modo|trocar|mudar|altere|alterar)/.test(normalized)) {
      return { type: "mode_switch", confidence: 0.98, targetMode };
    }

    if (/^(resuma|resumir|responda|seja|limpe|reset|reinicie|reiniciar|ajuste)/.test(normalized)) {
      return { type: "direct_command", confidence: 0.92 };
    }

    if (/(tarefa|tarefas|agenda|calendario|compromisso|evento|lembrete)/.test(normalized)) {
      return {
        type: "tool_action",
        confidence: 0.9,
        requiredTools: [/(agenda|calendario|compromisso|evento)/.test(normalized) ? "calendar" : "tasks"],
      };
    }

    if (/(status|como estamos|resumo rapido|ponto atual)/.test(normalized)) {
      return { type: "status_query", confidence: 0.88 };
    }

    if (/(documento|pdf|arquivo|analisar contrato|analise de documento)/.test(normalized)) {
      return { type: "document_analysis", confidence: 0.86 };
    }

    return { type: "open_conversation", confidence: 0.78 };
  }
}