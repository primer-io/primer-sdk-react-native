import { Platform } from 'react-native';
import type { DeviceInfo, AppMetadata, NativeDeviceInfo, SdkType } from './types';

function generateUUIDFallback(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function generateUUID(): Promise<string> {
  try {
    const NativePrimer = require('../../../specs/NativePrimer').default;
    return await NativePrimer.generateUUID();
  } catch {
    return generateUUIDFallback();
  }
}

export function getUserLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return 'en-US';
  }
}

export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function getOsVersion(): string {
  return String(Platform.Version);
}

export async function fetchNativeDeviceInfo(): Promise<NativeDeviceInfo | null> {
  try {
    const NativePrimer = require('../../../specs/NativePrimer').default;
    const jsonStr = await NativePrimer.getDeviceInfo();
    return JSON.parse(jsonStr) as NativeDeviceInfo;
  } catch (e) {
    console.warn('[Primer] Failed to fetch native device info:', (e as Error)?.message);
    return null;
  }
}

export function getDeviceInfo(ndi?: NativeDeviceInfo): DeviceInfo {
  return {
    locale: getUserLocale(),
    timezone: getTimezone(),
    os_version: getOsVersion(),
    model: ndi?.deviceModel,
    network_type: ndi?.networkType,
  };
}

export function getAppMetadata(ndi?: NativeDeviceInfo): AppMetadata | undefined {
  if (!ndi) {
    return undefined;
  }
  return {
    app_name: ndi.appName,
    app_version: ndi.appVersion,
    app_id: ndi.appId,
  };
}

export function getSdkType(): SdkType {
  return Platform.OS === 'ios' ? 'RN_IOS' : 'RN_ANDROID';
}

export function getUserAgent(sdkVersion: string): string {
  return `PrimerRNSDK/${sdkVersion} ${Platform.OS}/${Platform.Version}`;
}
