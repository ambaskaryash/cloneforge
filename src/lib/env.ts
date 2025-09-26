/**
 * Environment variable validation for CloneForge
 * Ensures all required environment variables are set for production
 */

type Environment = 'development' | 'production' | 'test';

interface EnvConfig {
  NODE_ENV: Environment;
  
  // Clerk Authentication (Required)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  
  // Database (Required)
  DATABASE_URL: string;
  
  // AI Service (Required)
  GEMINI_API_KEY: string;
  
  // Application (Required)
  NEXT_PUBLIC_APP_URL: string;
  APP_NAME: string;
  APP_DESCRIPTION: string;
  
  // PayU Payment Gateway (Required for production)
  NEXT_PUBLIC_PAYU_KEY: string;
  PAYU_SALT: string;
  PAYU_ENVIRONMENT: 'test' | 'production';
  
  // Payment Configuration
  PAYMENT_GATEWAY: string;
  PAYMENT_CURRENCY: string;
}

function validateEnvVar(name: keyof EnvConfig, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  
  if (value === 'YOUR_PAYU_KEY_HERE' || value === 'YOUR_PAYU_SALT_HERE') {
    throw new Error(`Please replace placeholder value for: ${name}`);
  }
  
  return value.trim();
}

function validateOptionalEnvVar(name: string, value: string | undefined, defaultValue: string): string {
  if (!value || value.trim() === '') {
    console.warn(`Using default value for ${name}: ${defaultValue}`);
    return defaultValue;
  }
  return value.trim();
}

export function validateEnvironment(): EnvConfig {
  const NODE_ENV = (process.env.NODE_ENV || 'development') as Environment;
  
  // In development, only warn about missing variables, don't fail
  const isDev = NODE_ENV === 'development';
  
  try {
    const config: EnvConfig = {
      NODE_ENV,
      
      // Clerk Authentication
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: isDev ? 
        validateOptionalEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, '') :
        validateEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
      CLERK_SECRET_KEY: isDev ?
        validateOptionalEnvVar('CLERK_SECRET_KEY', process.env.CLERK_SECRET_KEY, '') :
        validateEnvVar('CLERK_SECRET_KEY', process.env.CLERK_SECRET_KEY),
      
      // Database
      DATABASE_URL: isDev ?
        validateOptionalEnvVar('DATABASE_URL', process.env.DATABASE_URL, '') :
        validateEnvVar('DATABASE_URL', process.env.DATABASE_URL),
      
      // AI Service
      GEMINI_API_KEY: isDev ?
        validateOptionalEnvVar('GEMINI_API_KEY', process.env.GEMINI_API_KEY, '') :
        validateEnvVar('GEMINI_API_KEY', process.env.GEMINI_API_KEY),
      
      // Application
      NEXT_PUBLIC_APP_URL: isDev ?
        validateOptionalEnvVar('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000') :
        validateEnvVar('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL),
      APP_NAME: validateOptionalEnvVar('APP_NAME', process.env.APP_NAME, 'CloneForge'),
      APP_DESCRIPTION: validateOptionalEnvVar('APP_DESCRIPTION', process.env.APP_DESCRIPTION, 'Clone any website and convert it to your preferred framework'),
      
      // PayU Payment Gateway
      NEXT_PUBLIC_PAYU_KEY: isDev ?
        validateOptionalEnvVar('NEXT_PUBLIC_PAYU_KEY', process.env.NEXT_PUBLIC_PAYU_KEY, 'YOUR_PAYU_KEY_HERE') :
        validateEnvVar('NEXT_PUBLIC_PAYU_KEY', process.env.NEXT_PUBLIC_PAYU_KEY),
      PAYU_SALT: isDev ?
        validateOptionalEnvVar('PAYU_SALT', process.env.PAYU_SALT, 'YOUR_PAYU_SALT_HERE') :
        validateEnvVar('PAYU_SALT', process.env.PAYU_SALT),
      PAYU_ENVIRONMENT: validateOptionalEnvVar('PAYU_ENVIRONMENT', process.env.PAYU_ENVIRONMENT, 'test') as 'test' | 'production',
      
      // Payment Configuration
      PAYMENT_GATEWAY: validateOptionalEnvVar('PAYMENT_GATEWAY', process.env.PAYMENT_GATEWAY, 'payu'),
      PAYMENT_CURRENCY: validateOptionalEnvVar('PAYMENT_CURRENCY', process.env.PAYMENT_CURRENCY, 'INR'),
    };

    // Additional validation for production
    if (NODE_ENV === 'production') {
      if (config.NEXT_PUBLIC_APP_URL.includes('localhost')) {
        throw new Error('NEXT_PUBLIC_APP_URL must be a production URL for production builds');
      }
      
      if (config.PAYU_ENVIRONMENT !== 'production') {
        console.warn('Warning: Using test PayU environment in production');
      }
      
      if (config.NEXT_PUBLIC_PAYU_KEY.includes('test') || config.PAYU_SALT.includes('test')) {
        console.warn('Warning: Using test PayU keys in production');
      }
    }

    console.log('✅ Environment validation passed');
    return config;
    
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw error;
  }
}

// Export validated environment variables (lazy initialization)
let _env: EnvConfig | null = null;
export const env = new Proxy({} as EnvConfig, {
  get(target, prop) {
    if (!_env) {
      _env = validateEnvironment();
    }
    return _env[prop as keyof EnvConfig];
  }
});

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

export default env;