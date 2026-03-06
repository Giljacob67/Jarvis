"use client";

import { useState } from "react";
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Pronto. Base do Jarvis V2 ativa em modo foundation.",
  },
];

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: "Mensagem recebida. O runtime conversacional entra na Fase 2.",
      },
    ]);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <MessageList messages={messages} />
      <Composer onSend={handleSend} />
    </div>
  );
}