// Re-export all services
export { default as api, getErrorMessage } from './api';
export { authService } from './authService';
export { vehicleService } from './vehicleService';
export { serviceService } from './serviceService';
export { expenseService } from './expenseService';
export { reminderService } from './reminderService';
export { reportService } from './reportService';
export { upgradeService } from './upgradeService';
export {
  analyzeCarIssue,
  getCurrentProviderInfo,
  isAIServiceConfigured,
  resetAIProvider,
  type AIModelMode,
  type AIProvider,
  type AIRequestParams,
  type AIResponse,
} from './ai';
