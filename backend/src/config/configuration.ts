type Environment = 'development' | 'test' | 'production';

export interface Config {
  PORT: number;
  ENV: Environment;
  DB_URL: string;
  interswitchClientId: string;
  interswitchSecretKey: string;
  interswitchTerminalId: string;
  interswitchApiBaseUrl: string;
  interswitchBasicToken: string;
  interswitchAuthUrl: string;
  interswitchPaymentReferencePrefix: string;
  interswitchPaymentBaseUrl: string;
  interswitchMerchantCode: string;
  vtpassApikey: string;
  vtpassSecretKey: string;
  vtpassApiBaseUrl: string;
  vtpassPublicKey: string;
  redisUrl: string;
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export default function loadConfig(): Config {
  const config: Omit<Config, 'interswitchBasicToken'> &
    Partial<Pick<Config, 'interswitchBasicToken'>> = {
    PORT: parseNumber(process.env.PORT, 4000),
    ENV: (process.env.NODE_ENV as Environment) || 'development',
    DB_URL: process.env.DB_URL || '',
    interswitchClientId: process.env.INTERSWITCH_CLIENT_ID || '',
    interswitchSecretKey: process.env.INTERSWITCH_SECRET_KEY || '',
    interswitchTerminalId: process.env.INTERSWITCH_TERMINAL_ID || '',
    interswitchApiBaseUrl: process.env.INTERSWITCH_API_BASE_URL || '',
    interswitchPaymentBaseUrl: process.env.INTERSWITCH_PAYMENT_BASE_URL || '',
    interswitchAuthUrl: process.env.INTERSWITCH_AUTH_URL || '',
    interswitchPaymentReferencePrefix:
      process.env.INTERSWITCH_PAYMENT_REFERENCE_PREFIX || '',
    interswitchMerchantCode: process.env.INTERSWITCH_MERCHANT_CODE || '',
    vtpassApikey: process.env.VTPASS_APIKEY || '',
    vtpassSecretKey: process.env.VTPASS_SECRET_KEY || '',
    vtpassApiBaseUrl: process.env.VTPASS_API_BASE_URL || '',
    vtpassPublicKey: process.env.VTPASS_PUBLIC_KEY || '',
    redisUrl: process.env.REDIS_URL || '',
  };

  if (config.interswitchClientId && config.interswitchSecretKey) {
    config.interswitchBasicToken = btoa(
      `${config.interswitchClientId}:${config.interswitchSecretKey}`,
    );
  }

  return config as Config;
}
