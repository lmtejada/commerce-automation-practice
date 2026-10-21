import { z } from "zod";

// Load .env into process.env if it exists. Real environment variables take precedence,
// and in production the platform usually injects them, so a missing file is not an error.
try {
  process.loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

// Keep in sync with .env.example.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  APP_NAME: z.string().min(1),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const problems = result.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(
    `Invalid environment configuration:\n${problems}\n\nSee .env.example for the expected variables.`,
  );
  process.exit(1);
}

export const config = Object.freeze(result.data);

export type Config = typeof config;
