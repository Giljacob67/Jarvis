export type PolicyDecision = {
  maxSentences: 1 | 2 | 3;
  shouldOfferDetailPrompt: boolean;
  detailPromptText: string;
  language: "pt-BR";
};