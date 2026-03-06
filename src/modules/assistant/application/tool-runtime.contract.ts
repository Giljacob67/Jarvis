export type ToolRuntimeCall = {
  toolName: string;
  action: string;
  payload?: Record<string, unknown>;
  dedupKey: string;
};

export type ToolRuntimeResult = {
  ok: boolean;
  summary: string;
  data?: Record<string, unknown>;
  cached: boolean;
  timestamp: string;
};

export interface ToolRuntimeContract {
  execute(call: ToolRuntimeCall): Promise<ToolRuntimeResult>;
}