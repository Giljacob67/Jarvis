import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { IntentType } from "@/modules/assistant/domain/intent.types";
import type { SessionSnapshot } from "@/modules/assistant/domain/session.types";

export type TextBrainPrompt = {
  system: string;
  user: string;
};

export type TextBrainGenerateInput = {
  mode: AssistantMode;
  intentType: IntentType;
  userMessage: string;
  session: SessionSnapshot;
  toolSummary?: string;
  responseChannel: "text";
  futureVoiceReady: boolean;
};

export type TextBrainGenerateOutput = {
  text: string;
  model: string;
  latencyMs: number;
};

export interface TextBrainContract {
  generate(input: TextBrainGenerateInput): Promise<TextBrainGenerateOutput>;
}