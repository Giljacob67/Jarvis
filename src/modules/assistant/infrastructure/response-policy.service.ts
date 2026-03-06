import type { PolicyDecision } from "@/modules/assistant/domain/policy.types";
import type { ResponsePolicyContract, ResponsePolicyInput, ResponseShapeOptions } from "@/modules/assistant/application/response-policy.contract";

const DETAIL_PROMPT = "Quer que eu detalhe?";
const HARD_MAX_SENTENCES = 3;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function toShortSentence(sentence: string): string {
  const cleaned = sentence.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 140) return cleaned;
  return `${cleaned.slice(0, 137).trimEnd()}...`;
}

export class ResponsePolicyService implements ResponsePolicyContract {
  decide(input: ResponsePolicyInput): PolicyDecision {
    const maxSentences: 1 | 2 | 3 = input.intent.type === "mode_switch" || input.intent.type === "direct_command" ? 1 : 2;

    return {
      maxSentences,
      shouldOfferDetailPrompt: true,
      detailPromptText: DETAIL_PROMPT,
      language: "pt-BR",
    };
  }

  enforceShape(text: string, decision: PolicyDecision, options?: ResponseShapeOptions): string {
    const withoutBullets = text
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "");

    const normalizedLineBreaks = withoutBullets.replace(/\r/g, "").replace(/\n{2,}/g, "\n");
    const oneBreakOnly = normalizedLineBreaks.split("\n").slice(0, 2).join("\n");
    const flattened = oneBreakOnly.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    const rawSentences = splitSentences(flattened);
    const sentenceLimit = Math.min(decision.maxSentences, HARD_MAX_SENTENCES) as 1 | 2 | 3;
    const selected = rawSentences.slice(0, sentenceLimit).map(toShortSentence);

    const fallback = "Entendi. Posso seguir com o proximo passo.";
    const base = (selected.length ? selected.join(" ") : fallback).trim();

    const hadHiddenDetail =
      Boolean(options?.hasExtraDetail) ||
      rawSentences.length > selected.length ||
      flattened.length > base.length;

    if (!hadHiddenDetail) return base;

    if (base.endsWith(DETAIL_PROMPT)) return base;
    return `${base} ${DETAIL_PROMPT}`;
  }
}