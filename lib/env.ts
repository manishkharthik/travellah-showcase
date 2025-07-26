// lib/env.ts
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

export function validateRequiredEnvVars(): void {
  try {
    getRequiredEnvVar('DATABASE_URL');
    getRequiredEnvVar('JWT_SECRET');
    console.log('✅ All required environment variables are set');
  } catch (error) {
    console.error('❌ Environment variable validation failed:', error);
    throw error;
  }
} 