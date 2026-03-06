export type AppJson = Record<string, unknown>;

export type ApiResult<TData> = {
  ok: boolean;
  data?: TData;
  error?: string;
};