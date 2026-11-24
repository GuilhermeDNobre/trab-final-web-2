const REQUIRED_VARIABLES = ['MONGODB_URI', 'JWT_SECRET'] as const;

function isBlank(value: unknown): boolean {
  if (typeof value === 'string') return value.trim() === '';
  return value === undefined || value === null;
}

function validatePositiveInt(config: Record<string, unknown>, name: string, max?: number): void {
  if (isBlank(config[name])) return;

  const parsed = Number(config[name]);
  if (!Number.isInteger(parsed) || parsed <= 0 || (max !== undefined && parsed > max)) {
    throw new Error(`Invalid environment variable ${name}: expected a positive integer`);
  }
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED_VARIABLES.filter((name) => isBlank(config[name]));

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  validatePositiveInt(config, 'PORT', 65535);
  validatePositiveInt(config, 'LOGIN_RATE_LIMIT_MAX');
  validatePositiveInt(config, 'LOGIN_RATE_LIMIT_WINDOW_MS');

  return config;
}
