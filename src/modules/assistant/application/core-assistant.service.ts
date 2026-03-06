import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { IntentResult } from "@/modules/assistant/domain/intent.types";
import type { SessionSnapshot } from "@/modules/assistant/domain/session.types";
import type { IntentRouterContract } from "@/modules/assistant/application/intent-router.contract";
import type { ResponsePolicyContract } from "@/modules/assistant/application/response-policy.contract";
import type { SessionIntelligenceContract } from "@/modules/assistant/application/session-intelligence.contract";
import type { TextBrainContract, TextBrainGenerateOutput } from "@/modules/assistant/application/text-brain.contract";
import type { ToolRuntimeContract } from "@/modules/assistant/application/tool-runtime.contract";
import type { ChatResponse } from "@/types/chat";

const TOPIC_STOPWORDS = new Set([
  "quero",
  "preciso",
  "falar",
  "sobre",
  "agora",
  "depois",
  "pode",
  "ajuda",
  "comigo",
  "jarvis",
]);

export type CoreAssistantInput = {
  sessionId: string;
  message: string;
  mode?: AssistantMode;
};

export class CoreAssistantService {
  constructor(
    private readonly intentRouter: IntentRouterContract,
    private readonly responsePolicy: ResponsePolicyContract,
    private readonly sessionIntelligence: SessionIntelligenceContract,
    private readonly toolRuntime: ToolRuntimeContract,
    private readonly textBrain: TextBrainContract,
  ) {}

  async handle(input: CoreAssistantInput): Promise<ChatResponse> {
    const trimmedMessage = input.message.trim();

    if (!trimmedMessage) {
      return {
        sessionId: input.sessionId,
        mode: input.mode ?? "personal",
        intentType: "direct_command",
        reply: "Envie uma mensagem curta para eu agir.",
        meta: { bypassedModel: true, modelUsed: false, policyMaxSentences: 1 },
      };
    }

    if (input.mode) {
      await this.sessionIntelligence.setMode(input.sessionId, input.mode);
    }

    const snapshot = await this.sessionIntelligence.getSnapshot(input.sessionId);
    const intent = await this.intentRouter.classify({
      message: trimmedMessage,
      mode: snapshot.currentMode,
      session: snapshot,
    });

    if (intent.type === "mode_switch") {
      return this.handleModeSwitch(input.sessionId, intent);
    }

    if (intent.type === "direct_command") {
      return this.handleDirectCommand(input.sessionId, trimmedMessage, snapshot.currentMode, intent);
    }

    return this.handleModelEligible(input.sessionId, trimmedMessage, snapshot.currentMode, intent, snapshot);
  }

  private async handleModeSwitch(sessionId: string, intent: IntentResult): Promise<ChatResponse> {
    const newMode = intent.targetMode ?? "personal";
    const snapshot = await this.sessionIntelligence.setMode(sessionId, newMode);

    const decision = this.responsePolicy.decide({ mode: newMode, intent, isVoiceResponse: false });
    const reply = this.responsePolicy.enforceShape(`Modo ${this.modeLabel(newMode)} ativado.`, decision);

    await this.sessionIntelligence.updateSnapshot(sessionId, {
      userMessage: `modo ${newMode}`,
      assistantReply: reply,
      topicTag: `modo_${newMode}`,
    });

    return {
      sessionId,
      mode: snapshot.currentMode,
      intentType: intent.type,
      reply,
      meta: {
        bypassedModel: true,
        modelUsed: false,
        policyMaxSentences: decision.maxSentences,
      },
    };
  }

  private async handleDirectCommand(
    sessionId: string,
    userMessage: string,
    mode: AssistantMode,
    intent: IntentResult,
  ): Promise<ChatResponse> {
    let rawReply = "Comando recebido. Vou manter respostas curtas e objetivas.";

    if (/limpe|reset|reinicie/.test(userMessage.toLowerCase())) {
      await this.sessionIntelligence.reset(sessionId);
      rawReply = "Contexto curto reiniciado. Continuo no modo atual.";
    }

    const decision = this.responsePolicy.decide({ mode, intent, isVoiceResponse: false });
    const reply = this.responsePolicy.enforceShape(rawReply, decision);

    await this.sessionIntelligence.updateSnapshot(sessionId, {
      userMessage,
      assistantReply: reply,
      topicTag: "comando_direto",
    });

    return {
      sessionId,
      mode,
      intentType: intent.type,
      reply,
      meta: {
        bypassedModel: true,
        modelUsed: false,
        policyMaxSentences: decision.maxSentences,
      },
    };
  }

  private async handleModelEligible(
    sessionId: string,
    userMessage: string,
    mode: AssistantMode,
    intent: IntentResult,
    snapshot: SessionSnapshot,
  ): Promise<ChatResponse> {
    if (intent.type === "document_analysis") {
      const decision = this.responsePolicy.decide({ mode, intent, isVoiceResponse: false });
      const reply = this.responsePolicy.enforceShape(
        "Analise de documentos ainda nao esta ativa nesta fase.",
        decision,
      );

      await this.sessionIntelligence.updateSnapshot(sessionId, {
        userMessage,
        assistantReply: reply,
        topicTag: "document_analysis",
      });

      return {
        sessionId,
        mode,
        intentType: intent.type,
        reply,
        meta: {
          bypassedModel: true,
          modelUsed: false,
          policyMaxSentences: decision.maxSentences,
        },
      };
    }

    let toolResultSummary: string | undefined;
    let toolName: string | undefined;

    if (intent.type === "tool_action") {
      const inferredTool = intent.requiredTools?.[0] === "calendar" ? "calendar" : "tasks";
      const toolResult = await this.toolRuntime.execute({
        toolName: inferredTool,
        action: "preview",
        payload: { message: userMessage },
        dedupKey: `${sessionId}:${inferredTool}:${userMessage.toLowerCase().trim()}`,
      });

      toolName = inferredTool;
      toolResultSummary = toolResult.summary;
    }

    const candidateTopic = this.pickCandidateTopic(userMessage, intent, snapshot.lastTopics[0]);
    const shouldSuppress = await this.sessionIntelligence.shouldSuppressRepetition(
      sessionId,
      userMessage,
      candidateTopic,
    );

    let rawReply: string;
    let modelResult: TextBrainGenerateOutput | null = null;
    let fallbackUsed = false;

    if (shouldSuppress) {
      rawReply = "Ja cobrimos esse tema. Se quiser retomar, diga o foco exato.";
    } else {
      const shouldUseModel = this.shouldUseModel(intent, snapshot);

      if (shouldUseModel) {
        modelResult = await this.tryModel({
          mode,
          intent,
          userMessage,
          snapshot,
          toolSummary: toolResultSummary,
        });
      }

      if (modelResult?.text) {
        rawReply = modelResult.text;
      } else {
        fallbackUsed = shouldUseModel;
        rawReply = this.fallbackByIntent(intent, mode, snapshot, toolResultSummary, userMessage);
      }
    }

    const decision = this.responsePolicy.decide({ mode, intent, isVoiceResponse: false });
    const hasExtraDetail = this.hasExtraDetail(rawReply);
    const reply = this.responsePolicy.enforceShape(rawReply, decision, { hasExtraDetail });

    await this.sessionIntelligence.updateSnapshot(sessionId, {
      userMessage,
      assistantReply: reply,
      toolName,
      toolResultSummary,
      topicTag: candidateTopic,
    });

    return {
      sessionId,
      mode,
      intentType: intent.type,
      reply,
      meta: {
        bypassedModel: false,
        modelUsed: Boolean(modelResult),
        policyMaxSentences: decision.maxSentences,
        debug: {
          intentType: intent.type,
          modelName: modelResult?.model,
          modelLatencyMs: modelResult?.latencyMs,
          fallbackUsed,
        },
      },
    };
  }

  private shouldUseModel(intent: IntentResult, snapshot: SessionSnapshot): boolean {
    if (intent.type === "open_conversation") return true;
    if (intent.type === "tool_action") return true;
    if (intent.type === "status_query") {
      return snapshot.lastTopics.length > 0 || snapshot.lastToolResults.length > 0;
    }

    return false;
  }

  private async tryModel(input: {
    mode: AssistantMode;
    intent: IntentResult;
    userMessage: string;
    snapshot: SessionSnapshot;
    toolSummary?: string;
  }): Promise<TextBrainGenerateOutput | null> {
    try {
      return await this.textBrain.generate({
        mode: input.mode,
        intentType: input.intent.type,
        userMessage: input.userMessage,
        session: input.snapshot,
        toolSummary: input.toolSummary,
        responseChannel: "text",
        futureVoiceReady: true,
      });
    } catch {
      return null;
    }
  }

  private fallbackByIntent(
    intent: IntentResult,
    mode: AssistantMode,
    snapshot: SessionSnapshot,
    toolSummary: string | undefined,
    userMessage: string,
  ): string {
    if (intent.type === "open_conversation") {
      if (mode === "strategic") {
        return `Entendi. Proximo passo estrategico: ${this.shortAction(userMessage)}.`;
      }

      if (mode === "professional") {
        return `Entendi. Proximo passo profissional: ${this.shortAction(userMessage)}.`;
      }

      return `Perfeito. Proximo passo pessoal: ${this.shortAction(userMessage)}.`;
    }

    if (intent.type === "status_query") {
      return `Status rapido: modo ${this.modeLabel(snapshot.currentMode)} e topicos recentes ${snapshot.lastTopics.slice(0, 2).join(", ") || "nenhum"}.`;
    }

    if (intent.type === "tool_action") {
      return toolSummary ?? "Acao registrada. A sintese de ferramenta segue pronta para o proximo passo.";
    }

    return "Entendi. Posso seguir com isso agora.";
  }

  private shortAction(message: string): string {
    const cleaned = message.replace(/\s+/g, " ").trim();
    if (cleaned.length <= 70) return cleaned;
    return `${cleaned.slice(0, 67).trimEnd()}...`;
  }

  private hasExtraDetail(text: string): boolean {
    return text.length > 180 || /\n/.test(text) || /[.!?].+[.!?].+[.!?].+/.test(text);
  }

  private pickCandidateTopic(userMessage: string, intent: IntentResult, fallbackTopic?: string): string {
    if (intent.type === "status_query") return fallbackTopic ?? "status";
    if (intent.type === "tool_action") return intent.requiredTools?.[0] === "calendar" ? "calendario" : "tarefas";

    const token = userMessage
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/\s+/)
      .find((part) => part.length >= 5 && !TOPIC_STOPWORDS.has(part));

    return token ?? "conversa";
  }

  private modeLabel(mode: AssistantMode): string {
    if (mode === "personal") return "pessoal";
    if (mode === "professional") return "profissional";
    return "estrategico";
  }
}