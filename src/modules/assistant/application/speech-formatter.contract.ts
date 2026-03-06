export type SpeechChunk = {
  text: string;
  pauseMs?: number;
  emphasis?: "none" | "low" | "medium";
};

export interface SpeechFormatterContract {
  formatForSpeech(text: string): SpeechChunk[];
}