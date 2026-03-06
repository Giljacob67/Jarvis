import { AppShell } from "@/components/layout/app-shell";
import { ChatShell } from "@/components/chat/chat-shell";

export default function ChatPage() {
  return (
    <AppShell sectionTitle="Chat">
      <ChatShell />
    </AppShell>
  );
}