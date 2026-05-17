import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  BCRYPT_SALT_ROUNDS: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const env: EnvConfig = {
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  BCRYPT_SALT_ROUNDS: parseInt(getEnvVar('BCRYPT_SALT_ROUNDS', '12'), 10),
};
