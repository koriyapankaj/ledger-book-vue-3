/**
 * Environment Configuration
 * Handles environment-specific settings with validation and best practices
 */

// Environment type
export type Environment = 'development' | 'production' | 'test';

// Configuration interface
export interface AppConfig {
  apiBaseUrl: string;
  environment: Environment;
  isProduction: boolean;
  isDevelopment: boolean;
  enableDebug: boolean;
  enableErrorReporting: boolean;
}

/**
 * Validates required environment variables
 */
function validateEnv(): void {
  const required = ['VITE_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file configuration.'
    );
  }
}

/**
 * Parses boolean environment variables
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Gets the current environment
 */
function getEnvironment(): Environment {
  const env = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';
  
  if (env === 'production' || env === 'development' || env === 'test') {
    return env;
  }
  
  // Default to development for unknown environments
  return 'development';
}

/**
 * Creates and validates the application configuration
 */
function createConfig(): AppConfig {
  // Validate environment variables
  validateEnv();
  
  const environment = getEnvironment();
  const isProduction = environment === 'production';
  const isDevelopment = environment === 'development';
  
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    environment,
    isProduction,
    isDevelopment,
    enableDebug: parseBoolean(import.meta.env.VITE_ENABLE_DEBUG, isDevelopment),
    enableErrorReporting: parseBoolean(import.meta.env.VITE_ENABLE_ERROR_REPORTING, isDevelopment),
  };
}

// Export singleton configuration
export const config = createConfig();

/**
 * Logger utility with environment-aware behavior
 */
export const logger = {
  log: (...args: any[]) => {
    if (config.enableDebug) {
      console.log('[LOG]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (config.enableDebug) {
      console.warn('[WARN]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    if (config.enableDebug) {
      console.error('[ERROR]', ...args);
    } else if (config.enableErrorReporting) {
      // In production, you might want to send errors to a service
      // For now, we'll silently log to console
      console.error('[ERROR]', ...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (config.isDevelopment && config.enableDebug) {
      console.debug('[DEBUG]', ...args);
    }
  },
};

// Log configuration on startup (only in development)
if (config.isDevelopment) {
  logger.debug('Application Configuration:', {
    environment: config.environment,
    apiBaseUrl: config.apiBaseUrl,
    enableDebug: config.enableDebug,
    enableErrorReporting: config.enableErrorReporting,
  });
}
