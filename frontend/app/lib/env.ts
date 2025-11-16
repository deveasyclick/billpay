type Environment = "development" | "production" | "test";
// lib/env.ts
type EnvVariables = {
  environment: Environment;
  interswitchInlineUrl: string;
  interswitchMerchantCode: string;
  interswitchPayItemId: string;
  apiBaseUrl: string;
  appEnv: string;
};

export const env: EnvVariables = {
  environment:
    (process.env.NEXT_PUBLIC_APP_ENV as Environment) || "development",

  // CLIENT SIDE ENVS
  interswitchInlineUrl: process.env.NEXT_PUBLIC_INTERSWITCH_CHECKOUT_URL!,
  interswitchMerchantCode: process.env.NEXT_PUBLIC_INTERSWITCH_MERCHANT_CODE!,
  interswitchPayItemId: process.env.NEXT_PUBLIC_INTERSWITCH_PAY_ITEM_ID!,
  apiBaseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL!}/v1`,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
};
