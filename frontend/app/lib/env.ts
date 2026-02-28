type Environment = "development" | "production" | "test";
// lib/env.ts
type EnvVariables = {
  environment: Environment;
  paystackPublicKey: string;
  paystackEmail: string;
  apiBaseUrl: string;
  appEnv: string;
};
const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL! ?? "http://localhost:3000";
export const env: EnvVariables = {
  environment:
    (process.env.NEXT_PUBLIC_APP_ENV as Environment) || "development",
  // CLIENT SIDE ENVS
  paystackEmail: process.env.NEXT_PUBLIC_PAYSTACK_EMAIL!,
  paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  apiBaseUrl: `${baseUrl}/v1`,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
};
