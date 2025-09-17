import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  Length,
  validateSync,
} from 'class-validator';
import type { Config } from './configuration';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsNumber()
  @Length(4)
  @IsOptional()
  PORT: number;

  @IsNotEmpty()
  INTERSWITCH_CLIENT_ID: string;

  @IsNotEmpty()
  INTERSWITCH_SECRET_KEY: string;

  @IsNotEmpty()
  INTERSWITCH_TERMINAL_ID: string;

  @IsNotEmpty()
  @IsUrl()
  INTERSWITCH_API_BASE_URL: string;

  @IsNotEmpty()
  @IsUrl()
  INTERSWITCH_AUTH_URL: string;

  @IsNotEmpty()
  @IsUrl()
  INTERSWITCH_PAYMENT_BASE_URL: string;

  @IsNotEmpty()
  INTERSWITCH_MERCHANT_CODE: string;
}

export function validateConfig(config: Config) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
