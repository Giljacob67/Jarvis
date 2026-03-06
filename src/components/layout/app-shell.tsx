import { ReactNode } from "react";
import { TopNav } from "@/components/layout/top-nav";

type AppShellProps = {
  sectionTitle: string;
  children: ReactNode;
};

export function AppShell({ sectionTitle, children }: AppShellProps) {
  return (
    <main style={{ minHeight: "100vh" }}>
      <TopNav />
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ marginTop: 0 }}>{sectionTitle}</h1>
        {children}
      </section>
    </main>
  );
}