import { z } from "zod";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ChatResponse } from "@/types/chat";
import { CoreAssistantService } from "@/modules/assistant/application/core-assistant.service";
import { IntentRouterService } from "@/modules/assistant/infrastructure/intent-router.service";
import { ResponsePolicyService } from "@/modules/assistant/infrastructure/response-policy.service";
import { SessionIntelligenceInMemory } from "@/modules/assistant/infrastructure/session-intelligence.inmemory";
import { MinimalToolRuntimeService } from "@/modules/tools/runtime/minimal-tool-runtime.service";
import { OpenAITextBrainClient } from "@/modules/assistant/infrastructure/openai-text-brain.client";
import { PromptBuilder } from "@/modules/assistant/infrastructure/prompt-builder";
import { ROUTER_VALIDATION_SET_PTBR } from "@/modules/assistant/domain/router-validation";

const requestSchema = z.object({
  sessionId: z.string().optional(),
  mode: z.enum(["personal", "professional", "strategic"]).optional(),
  message: z.string().min(1),
});

const globalKey = globalThis as unknown as {
  coreAssistantService?: CoreAssistantService;
  intentRouterService?: IntentRouterService;
  routerValidationPass?: boolean;
};

async function runRouterValidation(router: IntentRouterService): Promise<boolean> {
  for (const item of ROUTER_VALIDATION_SET_PTBR) {
    const result = await router.classify({
      message: item.input,
      mode: "personal",
      session: {
        currentMode: "personal",
        lastTopics: [],
        lastQuestionsAsked: [],
        lastToolResults: [],
        lastBriefingTimestamp: null,
      },
    });

    if (result.type !== item.expectedIntent) {
      return false;
    }
  }

  return true;
}

async function getCoreAssistantService() {
  if (!globalKey.intentRouterService) {
    globalKey.intentRouterService = new IntentRouterService();
    globalKey.routerValidationPass = await runRouterValidation(globalKey.intentRouterService);
  }

  if (!globalKey.coreAssistantService) {
    globalKey.coreAssistantService = new CoreAssistantService(
      globalKey.intentRouterService,
      new ResponsePolicyService(),
      new SessionIntelligenceInMemory(),
      new MinimalToolRuntimeService(),
      new OpenAITextBrainClient(new PromptBuilder()),
    );
  }

  return globalKey.coreAssistantService;
}

function withDebugMeta(result: ChatResponse): ChatResponse {
  if (process.env.NODE_ENV === "production") {
    return { ...result, meta: { ...result.meta, debug: undefined } };
  }

  return {
    ...result,
    meta: {
      ...result.meta,
      debug: {
        intentType: result.meta.debug?.intentType ?? result.intentType,
        modelName: result.meta.debug?.modelName,
        modelLatencyMs: result.meta.debug?.modelLatencyMs,
        fallbackUsed: result.meta.debug?.fallbackUsed,
        routerValidationCases: ROUTER_VALIDATION_SET_PTBR.length,
        routerValidationPass: globalKey.routerValidationPass,
      },
    },
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat payload" }, { status: 400 });
  }

  const payload = parsed.data;
  const sessionId = payload.sessionId ?? crypto.randomUUID();

  const result: ChatResponse = await (await getCoreAssistantService()).handle({
    sessionId,
    message: payload.message,
    mode: payload.mode,
  });

  return NextResponse.json(withDebugMeta(result));
}