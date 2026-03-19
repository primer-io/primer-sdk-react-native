export type SessionEnvironment = 'DEV' | 'STAGING' | 'SANDBOX' | 'PRODUCTION';

export type SdkType = 'RN_IOS' | 'RN_ANDROID';

export type EventName =
  | 'SDK_INIT_START'
  | 'SDK_INIT_END'
  | 'CHECKOUT_FLOW_STARTED'
  | 'PAYMENT_METHOD_SELECTION'
  | 'PAYMENT_DETAILS_ENTERED'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_PROCESSING_STARTED'
  | 'PAYMENT_REDIRECT_TO_THIRD_PARTY'
  | 'PAYMENT_THREEDS'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILURE'
  | 'PAYMENT_REATTEMPTED'
  | 'PAYMENT_FLOW_EXITED';

export interface NativeDeviceInfo {
  appName: string;
  appVersion: string;
  appId: string;
  deviceModel: string;
  deviceType?: string;
  networkType?: string;
}

export interface PrimerIdentifiers {
  checkout_session_id?: string;
  client_session_id?: string;
  primer_account_id?: string;
  customer_id?: string;
}

export interface DeviceInfo {
  model?: string;
  os_version?: string;
  locale?: string;
  timezone?: string;
  network_type?: string;
}

export interface AppMetadata {
  app_name?: string;
  app_version?: string;
  app_id?: string;
}

export interface SessionMetadata {
  integration_type?: string;
  available_payment_methods?: string[];
}

export interface SessionContext {
  environment: SessionEnvironment;
  checkoutSessionId: string;
  clientSessionId: string;
  primerAccountId: string;
  sdkVersion: string;
  clientSessionToken?: string;
  accessToken?: string;
  userAgent: string;
  sdkInitStartTime?: number;
  customerId?: string;
  nativeDeviceInfo?: NativeDeviceInfo;
}

export interface AnalyticsEventData {
  eventName: EventName;
  paymentMethod?: string;
  paymentId?: string;
  redirectDestinationUrl?: string;
  threedsProvider?: string;
  threedsResponse?: string;
}

export interface AnalyticsPayload {
  id: string;
  timestamp: number;
  sdkType: SdkType;
  eventName: EventName;
  checkoutSessionId: string;
  clientSessionId: string;
  primerAccountId: string;
  sdkVersion: string;
  userAgent: string;
  userLocale?: string;
  device?: string;
  deviceType?: string;
  paymentMethod?: string;
  paymentId?: string;
  redirectDestinationUrl?: string;
  threedsProvider?: string;
  threedsResponse?: string;
}

export interface BufferedEvent {
  eventData: AnalyticsEventData;
  timestamp: number;
}

export interface LogMessageObject {
  message: string;
  status?: 'error' | 'warn' | 'info';
  event?: string;
  init_duration_ms?: number;
  error_message?: string;
  error_stack?: string;
  diagnostics_id?: string;
  primer?: PrimerIdentifiers;
  device_info?: DeviceInfo;
  app_metadata?: AppMetadata;
  session_metadata?: SessionMetadata;
}

export interface LogPayload {
  message: string;
  hostname: string;
  service: string;
  ddsource: string;
  ddtags: string;
}
