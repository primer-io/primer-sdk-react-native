import RNPrimer from '../RNPrimer';

export const PrimerAnalytics = {
  setup: (clientToken: string): Promise<void> => {
    return RNPrimer.setupAnalyticsLoggingBridge(clientToken);
  },

  trackEvent: (eventName: string, metadata?: Record<string, string>): Promise<void> => {
    return RNPrimer.trackAnalyticsEvent(eventName, metadata ? JSON.stringify(metadata) : undefined);
  },

  sendLog: (message: string, event: string, initDurationMs?: number): Promise<void> => {
    return RNPrimer.sendLog(message, event, initDurationMs);
  },

  sendErrorLog: (message: string, event?: string, errorMessage?: string, stack?: string): Promise<void> => {
    return RNPrimer.sendErrorLog(message, event, errorMessage, stack);
  },
};
