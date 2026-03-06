import type { AssistantMode } from "@/modules/assistant/domain/mode.types";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  mode?: AssistantMode;
  intentType?: string;
};

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16,
        minHeight: 260,
        display: "grid",
        gap: 12,
      }}
    >
      {messages.map((message) => (
        <article key={message.id}>
          <strong>{message.role === "user" ? "Voce" : "Jarvis"}:</strong>{" "}
          <span>{message.text}</span>
          {message.role === "assistant" && message.mode ? (
            <small style={{ display: "block", color: "#475569", marginTop: 4 }}>
              modo: {message.mode} {message.intentType ? `| intent: ${message.intentType}` : ""}
            </small>
          ) : null}
        </article>
      ))}
    </div>
  );
}