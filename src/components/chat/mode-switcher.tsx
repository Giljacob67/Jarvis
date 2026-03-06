"use client";

import type { AssistantMode } from "@/modules/assistant/domain/mode.types";

type ModeSwitcherProps = {
  mode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
};

const MODES: Array<{ value: AssistantMode; label: string }> = [
  { value: "personal", label: "Personal" },
  { value: "professional", label: "Professional" },
  { value: "strategic", label: "Strategic" },
];

export function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {MODES.map((item) => {
        const active = item.value === mode;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onModeChange(item.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: active ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
              background: active ? "#dbeafe" : "#ffffff",
              color: "#0f172a",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}