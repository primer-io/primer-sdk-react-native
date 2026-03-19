import type { SessionContext, SessionEnvironment } from './types';
import { generateUUID, fetchNativeDeviceInfo, getUserAgent } from './utils';

const ENVIRONMENT_MAP: Record<string, SessionEnvironment> = {
  DEV: 'DEV',
  STAGING: 'STAGING',
  SANDBOX: 'SANDBOX',
  PRODUCTION: 'PRODUCTION',
};

const BASE_URL_MAP: Record<SessionEnvironment, string> = {
  DEV: 'https://analytics.dev.data.primer.io',
  STAGING: 'https://analytics.staging.data.primer.io',
  SANDBOX: 'https://analytics.sandbox.data.primer.io',
  PRODUCTION: 'https://analytics.production.data.primer.io',
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1] as string;
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

function extractPrimerAccountId(clientTokenPayload: Record<string, unknown>): string {
  const accessToken = clientTokenPayload.accessToken as string | undefined;
  if (!accessToken) {
    return '';
  }
  const accessPayload = decodeJwtPayload(accessToken);
  return (accessPayload?.sub as string) || '';
}

export function parseClientToken(clientToken: string): {
  environment: SessionEnvironment;
  primerAccountId: string;
  accessToken?: string;
} | null {
  const payload = decodeJwtPayload(clientToken);
  if (!payload) {
    console.warn('[Primer] Failed to decode client token');
    return null;
  }

  const env = (payload.env || payload.environment) as string | undefined;
  const environment = (env && ENVIRONMENT_MAP[env.toUpperCase()]) || 'PRODUCTION';
  const primerAccountId = extractPrimerAccountId(payload);

  const accessToken = (payload.accessToken as string) || undefined;

  return { environment, primerAccountId, accessToken };
}

export async function createSessionContext(
  clientToken: string,
  sdkVersion: string,
  clientSessionId?: string
): Promise<SessionContext | null> {
  const parsed = parseClientToken(clientToken);
  if (!parsed) {
    return null;
  }

  const nativeDeviceInfo = await fetchNativeDeviceInfo();

  return {
    environment: parsed.environment,
    checkoutSessionId: await generateUUID(),
    clientSessionId: clientSessionId || '',
    primerAccountId: parsed.primerAccountId,
    sdkVersion,
    clientSessionToken: clientToken,
    accessToken: parsed.accessToken,
    userAgent: getUserAgent(sdkVersion),
    nativeDeviceInfo: nativeDeviceInfo ?? undefined,
  };
}

export function getAnalyticsBaseUrl(environment: SessionEnvironment): string {
  return BASE_URL_MAP[environment];
}
