import type { IntentResult } from "@/modules/assistant/domain/intent.types";
import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { SessionSnapshot } from "@/modules/assistant/domain/session.types";

export type IntentRouterInput = {
  message: string;
  mode: AssistantMode;
  session: SessionSnapshot;
};

export interface IntentRouterContract {
  classify(input: IntentRouterInput): Promise<IntentResult>;
}