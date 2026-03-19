jest.mock('react-native', () => ({
  Platform: { OS: 'ios', Version: '17.0' },
}));

jest.mock('../../../Components/internal/analytics/utils', () => {
  const actual = jest.requireActual('../../../Components/internal/analytics/utils');
  let counter = 0;
  return {
    ...actual,
    fetchNativeDeviceInfo: jest.fn().mockResolvedValue(null),
    generateUUID: jest.fn().mockImplementation(() => Promise.resolve(`mock-uuid-${++counter}`)),
  };
});

import { createSessionContext, parseClientToken } from '../../../Components/internal/analytics/session-context';

function createFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

function createFakeClientToken(env: string, primerAccountId: string): string {
  const accessToken = createFakeJwt({ sub: primerAccountId });
  return createFakeJwt({ env, accessToken });
}

describe('session-context', () => {
  describe('parseClientToken', () => {
    it('extracts environment and primerAccountId from nested JWT', () => {
      const token = createFakeClientToken('SANDBOX', 'acc_xyz789');
      const parsed = parseClientToken(token);

      expect(parsed).not.toBeNull();
      expect(parsed!.environment).toBe('SANDBOX');
      expect(parsed!.primerAccountId).toBe('acc_xyz789');
      expect(parsed!.accessToken).toBeDefined();
    });

    it('defaults to PRODUCTION for unknown environment', () => {
      const token = createFakeClientToken('UNKNOWN', 'acc_xyz');
      expect(parseClientToken(token)!.environment).toBe('PRODUCTION');
    });

    it('handles "environment" claim as alternative to "env"', () => {
      const accessToken = createFakeJwt({ sub: 'acc_xyz' });
      const token = createFakeJwt({ environment: 'STAGING', accessToken });
      expect(parseClientToken(token)!.environment).toBe('STAGING');
    });

    it('returns null for invalid JWT', () => {
      expect(parseClientToken('not-a-jwt')).toBeNull();
    });

    it('returns empty primerAccountId when accessToken missing', () => {
      const token = createFakeJwt({ env: 'SANDBOX' });
      expect(parseClientToken(token)!.primerAccountId).toBe('');
    });
  });

  describe('createSessionContext', () => {
    it('creates full session context from client token', async () => {
      const token = createFakeClientToken('SANDBOX', 'acc_xyz789');
      const ctx = await createSessionContext(token, '1.0.0', 'cs_abc123');

      expect(ctx).not.toBeNull();
      expect(ctx!.environment).toBe('SANDBOX');
      expect(ctx!.clientSessionId).toBe('cs_abc123');
      expect(ctx!.primerAccountId).toBe('acc_xyz789');
      expect(ctx!.sdkVersion).toBe('1.0.0');
      expect(ctx!.clientSessionToken).toBe(token);
      expect(ctx!.checkoutSessionId).toMatch(/^mock-uuid-/);
      expect(ctx!.userAgent).toContain('PrimerRNSDK/1.0.0');
    });

    it('returns null for invalid JWT', async () => {
      expect(await createSessionContext('not-a-jwt', '1.0.0')).toBeNull();
    });

    it('generates unique checkoutSessionId per call', async () => {
      const token = createFakeClientToken('SANDBOX', 'acc_xyz');
      const ctx1 = await createSessionContext(token, '1.0.0');
      const ctx2 = await createSessionContext(token, '1.0.0');
      expect(ctx1!.checkoutSessionId).not.toBe(ctx2!.checkoutSessionId);
    });
  });
});
