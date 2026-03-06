import type { ToolRuntimeCall, ToolRuntimeContract, ToolRuntimeResult } from "@/modules/assistant/application/tool-runtime.contract";

type CacheEntry = {
  result: ToolRuntimeResult;
  expiresAt: number;
};

const CACHE_TTL_MS = 20_000;

export class MinimalToolRuntimeService implements ToolRuntimeContract {
  private readonly cache = new Map<string, CacheEntry>();

  async execute(call: ToolRuntimeCall): Promise<ToolRuntimeResult> {
    const now = Date.now();
    const cached = this.cache.get(call.dedupKey);

    if (cached && cached.expiresAt > now) {
      return { ...cached.result, cached: true };
    }

    let summary = "Ferramenta nao disponivel nesta fase.";

    if (call.toolName === "tasks") {
      summary = "Base de Tasks pronta. Integracao real entra na proxima fase.";
    }

    if (call.toolName === "calendar") {
      summary = "Base de Calendar pronta. Integracao real entra na proxima fase.";
    }

    const result: ToolRuntimeResult = {
      ok: true,
      summary,
      data: { tool: call.toolName, action: call.action },
      cached: false,
      timestamp: new Date().toISOString(),
    };

    this.cache.set(call.dedupKey, { result, expiresAt: now + CACHE_TTL_MS });
    return result;
  }
}