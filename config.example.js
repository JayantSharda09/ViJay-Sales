/**
 * Configuration file for Ligma
 * Copy this file to config.js and update with your values
 */

// API Configuration
window.API_BASE_URL = 'http://localhost:3000/api'; // Your API base URL
window.USE_MOCK_API = true; // Set to false to use real API

// Environment
window.ENVIRONMENT = 'development'; // 'development' or 'production'

// Feature Flags
window.FEATURES = {
    mockAPI: true,
    analytics: false,
    errorReporting: false
};

// Optional: Analytics
// window.GA_TRACKING_ID = 'UA-XXXXXXXXX-X';

// Optional: Error Reporting
// window.SENTRY_DSN = 'https://xxx@xxx.ingest.sentry.io/xxx';

