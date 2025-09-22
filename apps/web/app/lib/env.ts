// lib/env.ts
type EnvVariables = {
  environment: "development" | "production" | "test";
  interswitchInlineUrl: string;
  interswitchMerchantCode: string;
  interswitchPayItemId: string;
  apiBaseUrl: string;
};

export const env: EnvVariables = {
  environment:
    (process.env.NODE_ENV as "development" | "production" | "test") ??
    "development",

  // CLIENT SIDE ENVS
  interswitchInlineUrl: process.env.NEXT_PUBLIC_INTERSWITCH_CHECKOUT_URL!,
  interswitchMerchantCode: process.env.NEXT_PUBLIC_INTERSWITCH_MERCHANT_CODE!,
  interswitchPayItemId: process.env.NEXT_PUBLIC_INTERSWITCH_PAY_ITEM_ID!,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
};
