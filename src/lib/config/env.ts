import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_TEXT_MODEL: z.string().min(1).default("gpt-4.1-mini"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;
let cachedClientEnv: z.infer<typeof clientEnvSchema> | null = null;

export function getServerEnv() {
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid server env: ${parsed.error.message}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export function getClientEnv() {
  if (cachedClientEnv) return cachedClientEnv;

  const parsed = clientEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid client env: ${parsed.error.message}`);
  }

  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}