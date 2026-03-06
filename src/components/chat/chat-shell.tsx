"use client";

import { useState } from "react";
import type { AssistantMode } from "@/modules/assistant/domain/mode.types";
import type { ChatResponse } from "@/types/chat";
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";
import { ModeSwitcher } from "@/components/chat/mode-switcher";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  mode?: AssistantMode;
  intentType?: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Jarvis V2 Core Assistant pronto em modo texto. Como quer seguir?",
    mode: "personal",
  },
];

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [mode, setMode] = useState<AssistantMode>("personal");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (text: string) => {
    const userText = text.trim();
    if (!userText || isSending) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: userText }]);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId ?? undefined,
          mode,
          message: userText,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as ChatResponse;

      setSessionId(data.sessionId);
      setMode(data.mode);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: data.reply,
          mode: data.mode,
          intentType: data.intentType,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "Falha no envio. Tente novamente em instantes.",
          mode,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ModeSwitcher mode={mode} onModeChange={setMode} />
      <MessageList messages={messages} />
      <Composer onSend={handleSend} disabled={isSending} />
    </div>
  );
}