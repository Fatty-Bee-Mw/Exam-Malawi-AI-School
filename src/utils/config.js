/**
 * Configuration utility for safely accessing environment variables
 * Provides defaults and validation for all app configurations
 */

const config = {
  // API Configuration
  api: {
    url: process.env.REACT_APP_AI_API_URL || '',
    key: process.env.REACT_APP_AI_API_KEY || '',
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  },

  // Analytics
  analytics: {
    id: process.env.REACT_APP_ANALYTICS_ID || '',
    enabled: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  },

  // Payment
  payment: {
    key: process.env.REACT_APP_PAYMENT_API_KEY || '',
    enabled: process.env.REACT_APP_ENABLE_PAYMENT === 'true',
  },

  // App Settings
  app: {
    name: 'Exam AI Malawi',
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
  },

  // User Limits
  limits: {
    free: {
      questionsPerDay: 10,
      examsPerDay: 3,
    },
    premium: {
      questionsPerDay: 100,
      examsPerDay: 20,
    },
  },
};

/**
 * Validate required configuration on app startup
 * Logs warnings for missing optional configs
 */
export const validateConfig = () => {
  const warnings = [];
  const errors = [];

  // Warn about missing API configuration in production
  if (config.app.isProduction) {
    if (!config.api.url) {
      errors.push('REACT_APP_AI_API_URL is not configured');
    }
    if (!config.api.key) {
      errors.push('REACT_APP_AI_API_KEY is not configured');
    }
  }

  // Optional configs
  if (config.analytics.enabled && !config.analytics.id) {
    warnings.push('Analytics is enabled but REACT_APP_ANALYTICS_ID is not set');
  }

  if (config.payment.enabled && !config.payment.key) {
    warnings.push('Payment is enabled but REACT_APP_PAYMENT_API_KEY is not set');
  }

  // Log warnings and errors
  if (warnings.length > 0) {
    console.warn('Configuration warnings:', warnings);
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    if (config.app.isProduction) {
      throw new Error('Missing required configuration. Check environment variables.');
    }
  }

  if (config.app.debugMode) {
    console.log('App configuration loaded:', {
      environment: config.app.environment,
      apiConfigured: !!config.api.url,
      analyticsEnabled: config.analytics.enabled,
      paymentEnabled: config.payment.enabled,
    });
  }
};

export default config;
