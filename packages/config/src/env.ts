import { z } from "zod";

/**
 * Canonical shape of runtime config. Both apps validate against this so a
 * missing/malformed env var fails fast at startup instead of surfacing as a
 * confusing runtime bug three layers away.
 */
export const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  SOCKET_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse(source);
}

/** Backend runtime config - validated once at boot (see AppModule's ConfigModule.forRoot) so a missing secret fails at startup, not on the first request that needs it. */
export const backendEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

export function parseBackendEnv(source: Record<string, string | undefined>): BackendEnv {
  return backendEnvSchema.parse(source);
}
