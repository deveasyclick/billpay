type Environment = "development" | "production" | "test";
// lib/env.ts
type EnvVariables = {
  environment: Environment;
  paystackPublicKey: string;
  paystackEmail: string;
  apiBaseUrl: string;
  appEnv: string;
};

export const env: EnvVariables = {
  environment:
    (process.env.NEXT_PUBLIC_APP_ENV as Environment) || "development",
  // CLIENT SIDE ENVS
  paystackEmail: process.env.NEXT_PUBLIC_PAYSTACK_EMAIL!,
  paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  apiBaseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL!}/v1`,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
};
