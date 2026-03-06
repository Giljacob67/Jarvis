import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { IntentType } from "@/modules/assistant/domain/intent.types";
import type { SessionSnapshot } from "@/modules/assistant/domain/session.types";
import type { TextBrainGenerateInput, TextBrainPrompt } from "@/modules/assistant/application/text-brain.contract";

function modeDirective(mode: AssistantMode): string {
  if (mode === "strategic") {
    return "Modo strategic: foque em priorizacao, risco e proximo passo de alto impacto.";
  }

  if (mode === "professional") {
    return "Modo professional: foque em clareza executiva, entregas e objetividade.";
  }

  return "Modo personal: foque em praticidade cotidiana e tom colaborativo.";
}

function intentDirective(intent: IntentType): string {
  if (intent === "open_conversation") return "Ajude com orientacao direta e acao imediata.";
  if (intent === "status_query") return "Sintetize status de forma curta e util.";
  if (intent === "tool_action") return "Transforme contexto de ferramenta em resposta acionavel.";
  return "Mantenha resposta concisa e direta.";
}

function sessionSnippet(session: SessionSnapshot): string {
  const topics = session.lastTopics.slice(0, 3).join(", ") || "nenhum";
  const lastTool = session.lastToolResults[0]?.summary ?? "sem resultado de ferramenta recente";
  return `Modo atual: ${session.currentMode}. Topicos recentes: ${topics}. Ultimo resultado de ferramenta: ${lastTool}.`;
}

export class PromptBuilder {
  build(input: TextBrainGenerateInput): TextBrainPrompt {
    const system = [
      "Voce e Jarvis V2, assistente em PT-BR natural, conciso, confiavel e orientado a acao.",
      modeDirective(input.mode),
      intentDirective(input.intentType),
      "Politica obrigatoria: resposta curta com 1-2 frases; nunca mais de 3 frases; sem bullets; sem bloco longo.",
      "Se houver detalhe adicional nao incluido, finalize apenas com: Quer que eu detalhe?",
      "Evite repeticao de topicos ja tratados, exceto quando o usuario reintroduzir explicitamente.",
      `responseChannel: ${input.responseChannel}`,
      `futureVoiceReady: ${input.futureVoiceReady ? "true" : "false"}`,
      "Mesmo em texto, escreva de forma fluida para futura entrega falada.",
      sessionSnippet(input.session),
    ].join(" ");

    const toolContext = input.toolSummary ? `Contexto de ferramenta: ${input.toolSummary}` : "";
    const user = `${toolContext} Mensagem do usuario: ${input.userMessage}`.trim();

    return { system, user };
  }
}