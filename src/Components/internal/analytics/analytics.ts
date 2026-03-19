import { getAnalyticsBaseUrl } from './session-context';
import type { AnalyticsEventData, AnalyticsPayload, BufferedEvent, SessionContext } from './types';
import { generateUUID, getUserLocale, getSdkType } from './utils';

const MAX_BUFFER_SIZE = 100;

let eventBuffer: BufferedEvent[] = [];

async function buildPayload(
  eventData: AnalyticsEventData,
  sessionContext: SessionContext,
  timestamp?: number
): Promise<AnalyticsPayload> {
  const payload: AnalyticsPayload = {
    id: await generateUUID(),
    timestamp: timestamp ?? Math.floor(Date.now() / 1000),
    sdkType: getSdkType(),
    eventName: eventData.eventName,
    checkoutSessionId: sessionContext.checkoutSessionId,
    clientSessionId: sessionContext.clientSessionId,
    primerAccountId: sessionContext.primerAccountId,
    sdkVersion: sessionContext.sdkVersion,
    userAgent: sessionContext.userAgent,
    userLocale: getUserLocale(),
    device: sessionContext.nativeDeviceInfo?.deviceModel,
    deviceType: sessionContext.nativeDeviceInfo?.deviceType ?? 'phone',
  };

  if (eventData.paymentMethod !== undefined) {
    payload.paymentMethod = eventData.paymentMethod;
  }
  if (eventData.paymentId !== undefined) {
    payload.paymentId = eventData.paymentId;
  }
  if (eventData.redirectDestinationUrl !== undefined) {
    payload.redirectDestinationUrl = eventData.redirectDestinationUrl;
  }
  if (eventData.threedsProvider !== undefined) {
    payload.threedsProvider = eventData.threedsProvider;
  }
  if (eventData.threedsResponse !== undefined) {
    payload.threedsResponse = eventData.threedsResponse;
  }

  return payload;
}

function dispatchEvent(payload: AnalyticsPayload, sessionContext: SessionContext): void {
  const baseUrl = getAnalyticsBaseUrl(sessionContext.environment);
  const url = `${baseUrl}/v1/sdk-analytic-events`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = sessionContext.accessToken || sessionContext.clientSessionToken;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  }).catch((e) => console.warn(`[Primer Analytics] ${payload.eventName} error: ${e.message}`));
}

export function sendAnalyticsEvent(eventData: AnalyticsEventData, sessionContext: SessionContext | null): void {
  try {
    if (!sessionContext) {
      const bufferedEvent: BufferedEvent = {
        eventData,
        timestamp: Math.floor(Date.now() / 1000),
      };
      eventBuffer.push(bufferedEvent);
      if (eventBuffer.length > MAX_BUFFER_SIZE) {
        eventBuffer = eventBuffer.slice(-MAX_BUFFER_SIZE);
      }
      return;
    }

    buildPayload(eventData, sessionContext)
      .then((payload) => dispatchEvent(payload, sessionContext))
      .catch((e) => console.warn(`[Primer Analytics] Failed to send ${eventData.eventName}: ${e?.message}`));
  } catch (e) {
    console.warn(`[Primer Analytics] Unexpected error: ${e}`);
  }
}

export function flushBufferedEvents(sessionContext: SessionContext): void {
  try {
    const events = [...eventBuffer];
    eventBuffer = [];

    for (const buffered of events) {
      buildPayload(buffered.eventData, sessionContext, buffered.timestamp)
        .then((payload) => dispatchEvent(payload, sessionContext))
        .catch((e) =>
          console.warn(`[Primer Analytics] Failed to flush ${buffered.eventData.eventName}: ${e?.message}`)
        );
    }
  } catch (e) {
    console.warn(`[Primer Analytics] Unexpected error during flush: ${e}`);
  }
}

export function clearAnalyticsBuffer(): void {
  eventBuffer = [];
}
