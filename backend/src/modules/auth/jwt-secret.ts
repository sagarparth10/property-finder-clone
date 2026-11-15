import { ConfigService } from '@nestjs/config';

const REJECTED_SECRETS = new Set(['secret', 'your-secret-key']);

export function readJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET')?.trim() ?? '';
  if (!secret || REJECTED_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET must be set to a value other than a built-in fallback');
  }
  return secret;
}
