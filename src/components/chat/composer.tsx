"use client";

import { FormEvent, useState } from "react";

type ComposerProps = {
  onSend: (text: string) => void;
};

export function Composer({ onSend }: ComposerProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Digite sua mensagem"
        style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}
      />
      <button
        type="submit"
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "none",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        Enviar
      </button>
    </form>
  );
}