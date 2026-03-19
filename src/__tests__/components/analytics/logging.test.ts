jest.mock('react-native', () => ({
  Platform: { OS: 'ios', Version: '17.0' },
}));

jest.mock('../../../Components/internal/analytics/utils', () => ({
  getUserLocale: jest.fn().mockReturnValue('en-US'),
  getTimezone: jest.fn().mockReturnValue('America/New_York'),
  getOsVersion: jest.fn().mockReturnValue('17.0'),
  getDeviceInfo: jest.fn().mockReturnValue({
    locale: 'en-US',
    timezone: 'America/New_York',
    os_version: '17.0',
  }),
  getAppMetadata: jest.fn().mockReturnValue(undefined),
  generateUUID: jest.fn().mockResolvedValue('mock-diagnostics-uuid'),
  getSdkType: jest.fn().mockReturnValue('RN_IOS'),
}));

import {
  sendLogToDatadog,
  sendErrorToDatadog,
  sendCheckoutInitializedLog,
} from '../../../Components/internal/analytics/logging';
import type { SessionContext } from '../../../Components/internal/analytics/types';

const mockFetch = jest.fn().mockResolvedValue({ ok: true });
(global as any).fetch = mockFetch;

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const mockSessionContext: SessionContext = {
  environment: 'SANDBOX',
  checkoutSessionId: 'cs_session_123',
  clientSessionId: 'cs_client_456',
  primerAccountId: 'acc_primer_789',
  sdkVersion: '1.0.0',
  clientSessionToken: 'test-token',
  userAgent: 'PrimerRNSDK/1.0.0 ios/17.0',
};

describe('logging', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendLogToDatadog', () => {
    it('sends correct LogPayload with enriched message, auth, and Datadog fields', () => {
      sendLogToDatadog({ message: 'Test log', status: 'info' }, mockSessionContext);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];

      expect(url).toBe('https://analytics.sandbox.data.primer.io/v1/sdk-logs');
      expect(options.headers['Authorization']).toBe('Bearer test-token');

      const body = JSON.parse(options.body);
      expect(body.service).toBe('rn-ios-sdk');
      expect(body.ddsource).toBe('lambda');
      expect(body.ddtags).toBe('env:SANDBOX,version:1.0.0');

      const messageObj = JSON.parse(body.message);
      expect(messageObj.message).toBe('Test log');
      expect(messageObj.primer.checkout_session_id).toBe('cs_session_123');
      expect(messageObj.primer.client_session_id).toBe('cs_client_456');
      expect(messageObj.primer.primer_account_id).toBe('acc_primer_789');
      expect(messageObj.device_info.locale).toBe('en-US');
      expect(messageObj.device_info.timezone).toBe('America/New_York');
      expect(messageObj.device_info.os_version).toBe('17.0');
    });

    it('uses nativeDeviceInfo.appId as hostname, falls back to rn-app', () => {
      sendLogToDatadog({ message: 'Test', status: 'info' }, mockSessionContext);
      expect(JSON.parse(mockFetch.mock.calls[0][1].body).hostname).toBe('rn-app');

      mockFetch.mockClear();
      const ctxWithNative = {
        ...mockSessionContext,
        nativeDeviceInfo: { appName: 'TestApp', appVersion: '1.0', appId: 'com.test.app', deviceModel: 'iPhone' },
      };
      sendLogToDatadog({ message: 'Test', status: 'info' }, ctxWithNative);
      expect(JSON.parse(mockFetch.mock.calls[0][1].body).hostname).toBe('com.test.app');
    });
  });

  describe('sendErrorToDatadog', () => {
    it('sends error with diagnostics_id, error_message, and error_stack', async () => {
      sendErrorToDatadog('Operation failed', mockSessionContext, new Error('Something broke'));
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const messageObj = JSON.parse(JSON.parse(mockFetch.mock.calls[0][1].body).message);
      expect(messageObj.status).toBe('error');
      expect(messageObj.error_message).toBe('Something broke');
      expect(messageObj.error_stack).toBeDefined();
      expect(messageObj.diagnostics_id).toBe('mock-diagnostics-uuid');
    });

    it('sends without error details when no Error provided', () => {
      sendErrorToDatadog('Simple error', mockSessionContext);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const messageObj = JSON.parse(JSON.parse(mockFetch.mock.calls[0][1].body).message);
      expect(messageObj.message).toBe('Simple error');
      expect(messageObj.error_message).toBeUndefined();
    });

    it('never throws on fetch failure', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      expect(() => sendErrorToDatadog('Test', mockSessionContext)).not.toThrow();
    });
  });

  describe('sendCheckoutInitializedLog', () => {
    it('sends INFO payload with CHECKOUT_INITIALIZED event and init_duration_ms', () => {
      sendCheckoutInitializedLog(mockSessionContext, 1234);

      const messageObj = JSON.parse(JSON.parse(mockFetch.mock.calls[0][1].body).message);
      expect(messageObj.message).toBe('Checkout initialized');
      expect(messageObj.status).toBe('info');
      expect(messageObj.event).toBe('CHECKOUT_INITIALIZED');
      expect(messageObj.init_duration_ms).toBe(1234);
    });
  });
});
