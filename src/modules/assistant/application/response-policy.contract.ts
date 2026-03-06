import type { PolicyDecision } from "@/modules/assistant/domain/policy.types";
import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { IntentResult } from "@/modules/assistant/domain/intent.types";

export type ResponsePolicyInput = {
  mode: AssistantMode;
  intent: IntentResult;
  isVoiceResponse: boolean;
};

export interface ResponsePolicyContract {
  decide(input: ResponsePolicyInput): PolicyDecision;
}