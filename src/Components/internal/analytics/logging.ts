import { getAnalyticsBaseUrl } from './session-context';
import type { LogMessageObject, LogPayload, SessionContext } from './types';
import { generateUUID, getDeviceInfo, getAppMetadata, getSdkType } from './utils';

function getServiceName(): string {
  return getSdkType() === 'RN_IOS' ? 'rn-ios-sdk' : 'rn-android-sdk';
}

function enrichMessageObject(messageObject: LogMessageObject, sessionContext: SessionContext): LogMessageObject {
  return {
    ...messageObject,
    primer: {
      checkout_session_id: sessionContext.checkoutSessionId,
      client_session_id: sessionContext.clientSessionId,
      primer_account_id: sessionContext.primerAccountId,
      customer_id: sessionContext.customerId,
    },
    device_info: getDeviceInfo(sessionContext.nativeDeviceInfo),
    app_metadata: getAppMetadata(sessionContext.nativeDeviceInfo),
    session_metadata: {},
  };
}

export function sendLogToDatadog(messageObject: LogMessageObject, sessionContext: SessionContext): void {
  try {
    const enriched = enrichMessageObject(messageObject, sessionContext);
    const url = `${getAnalyticsBaseUrl(sessionContext.environment)}/v1/sdk-logs`;

    const payload: LogPayload = {
      message: JSON.stringify(enriched),
      hostname: sessionContext.nativeDeviceInfo?.appId || 'rn-app',
      service: getServiceName(),
      ddsource: 'lambda',
      ddtags: `env:${sessionContext.environment},version:${sessionContext.sdkVersion}`,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (sessionContext.clientSessionToken) {
      headers['Authorization'] = `Bearer ${sessionContext.clientSessionToken}`;
    }

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).catch((e) => console.warn(`[Primer Logging] error: ${e.message}`));
  } catch (e) {
    console.warn(`[Primer Logging] Failed to send log: ${e}`);
  }
}

export function sendErrorToDatadog(message: string, sessionContext: SessionContext, error?: Error): void {
  console.error(`[Primer] ${message}`, error || '');

  const messageObject: LogMessageObject = {
    message,
    status: 'error',
  };

  if (error) {
    messageObject.error_message = error.message;
    messageObject.error_stack = error.stack;
    generateUUID()
      .then((uuid) => {
        messageObject.diagnostics_id = uuid;
        sendLogToDatadog(messageObject, sessionContext);
      })
      .catch((e) => {
        console.warn(`[Primer] Failed to generate diagnostics_id: ${e?.message}`);
        sendLogToDatadog(messageObject, sessionContext);
      });
    return;
  }

  sendLogToDatadog(messageObject, sessionContext);
}

export function sendCheckoutInitializedLog(sessionContext: SessionContext, initDurationMs?: number): void {
  const messageObject: LogMessageObject = {
    message: 'Checkout initialized',
    status: 'info',
    event: 'CHECKOUT_INITIALIZED',
  };

  if (initDurationMs !== undefined) {
    messageObject.init_duration_ms = initDurationMs;
  }

  sendLogToDatadog(messageObject, sessionContext);
}
