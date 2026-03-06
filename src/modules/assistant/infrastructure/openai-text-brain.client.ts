import OpenAI from "openai";
import { getServerEnv } from "@/lib/config/env";
import type {
  TextBrainContract,
  TextBrainGenerateInput,
  TextBrainGenerateOutput,
} from "@/modules/assistant/application/text-brain.contract";
import { PromptBuilder } from "@/modules/assistant/infrastructure/prompt-builder";

export class OpenAITextBrainClient implements TextBrainContract {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly promptBuilder: PromptBuilder) {
    const env = getServerEnv();
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    this.model = env.OPENAI_TEXT_MODEL;
  }

  async generate(input: TextBrainGenerateInput): Promise<TextBrainGenerateOutput> {
    const prompt = this.promptBuilder.build(input);
    const start = Date.now();

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.4,
      max_tokens: 220,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return {
      text,
      model: completion.model,
      latencyMs: Date.now() - start,
    };
  }
}