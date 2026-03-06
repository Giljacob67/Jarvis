"use client";

import { FormEvent, useState } from "react";

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    onSend(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Digite sua mensagem"
        disabled={disabled}
        style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}
      />
      <button
        type="submit"
        disabled={disabled}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "none",
          background: disabled ? "#93c5fd" : "#2563eb",
          color: "white",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {disabled ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}