jest.mock('react-native', () => ({
  Platform: { OS: 'ios', Version: '17.0' },
}));

jest.mock('../../../Components/internal/analytics/utils', () => {
  const actual = jest.requireActual('../../../Components/internal/analytics/utils');
  let counter = 0;
  return {
    ...actual,
    getUserLocale: jest.fn().mockReturnValue('en-US'),
    generateUUID: jest.fn().mockImplementation(() => Promise.resolve(`mock-uuid-${++counter}`)),
  };
});

import {
  sendAnalyticsEvent,
  flushBufferedEvents,
  clearAnalyticsBuffer,
} from '../../../Components/internal/analytics/analytics';
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

describe('analytics', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    clearAnalyticsBuffer();
  });

  describe('sendAnalyticsEvent', () => {
    it('sends correct payload to correct endpoint with auth', async () => {
      sendAnalyticsEvent(
        { eventName: 'PAYMENT_SUCCESS', paymentMethod: 'PAYMENT_CARD', paymentId: 'pay_123' },
        mockSessionContext
      );
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];

      expect(url).toBe('https://analytics.sandbox.data.primer.io/v1/sdk-analytic-events');
      expect(options.headers['Authorization']).toBe('Bearer test-token');

      const body = JSON.parse(options.body);
      expect(body.id).toMatch(/^mock-uuid-/);
      expect(body.timestamp).toBeGreaterThan(0);
      expect(body.sdkType).toBe('RN_IOS');
      expect(body.eventName).toBe('PAYMENT_SUCCESS');
      expect(body.checkoutSessionId).toBe('cs_session_123');
      expect(body.clientSessionId).toBe('cs_client_456');
      expect(body.primerAccountId).toBe('acc_primer_789');
      expect(body.sdkVersion).toBe('1.0.0');
      expect(body.userAgent).toBe('PrimerRNSDK/1.0.0 ios/17.0');
      expect(body.userLocale).toBe('en-US');
      expect(body.deviceType).toBe('phone');
      expect(body.paymentMethod).toBe('PAYMENT_CARD');
      expect(body.paymentId).toBe('pay_123');
    });

    it('generates unique UUID for each event', async () => {
      sendAnalyticsEvent({ eventName: 'SDK_INIT_START' }, mockSessionContext);
      sendAnalyticsEvent({ eventName: 'SDK_INIT_END' }, mockSessionContext);
      await flushPromises();

      const body1 = JSON.parse(mockFetch.mock.calls[0][1].body);
      const body2 = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(body1.id).not.toBe(body2.id);
    });

    it('never throws on fetch failure', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      expect(() => {
        sendAnalyticsEvent({ eventName: 'SDK_INIT_START' }, mockSessionContext);
      }).not.toThrow();
    });
  });

  describe('event buffering', () => {
    it('buffers events when session context is null and flushes in order', async () => {
      sendAnalyticsEvent({ eventName: 'SDK_INIT_START' }, null);
      sendAnalyticsEvent({ eventName: 'SDK_INIT_END' }, null);
      expect(mockFetch).not.toHaveBeenCalled();

      flushBufferedEvents(mockSessionContext);
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const body1 = JSON.parse(mockFetch.mock.calls[0][1].body);
      const body2 = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(body1.eventName).toBe('SDK_INIT_START');
      expect(body2.eventName).toBe('SDK_INIT_END');
    });

    it('buffered events preserve original timestamps', async () => {
      const timestampBefore = Math.floor(Date.now() / 1000);
      sendAnalyticsEvent({ eventName: 'SDK_INIT_START' }, null);

      await new Promise((r) => setTimeout(r, 50));
      flushBufferedEvents(mockSessionContext);
      await flushPromises();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.timestamp).toBeGreaterThanOrEqual(timestampBefore);
      expect(body.timestamp).toBeLessThanOrEqual(timestampBefore + 1);
    });

    it('buffer enforces max capacity (oldest dropped)', async () => {
      for (let i = 0; i < 105; i++) {
        sendAnalyticsEvent({ eventName: 'SDK_INIT_START' }, null);
      }

      flushBufferedEvents(mockSessionContext);
      await flushPromises();
      expect(mockFetch).toHaveBeenCalledTimes(100);
    });

    it('clearAnalyticsBuffer empties the buffer', async () => {
      sendAnalyticsEvent({ eventName: 'SDK_INIT_START' }, null);
      clearAnalyticsBuffer();

      flushBufferedEvents(mockSessionContext);
      await flushPromises();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
