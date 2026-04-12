import { resolveLocale } from '../../../Components/internal/localization/locale-resolver';

const originalDateTimeFormat = Intl.DateTimeFormat;

function mockDeviceLocale(locale: string) {
  (Intl as any).DateTimeFormat = function () {
    return {
      resolvedOptions: () => ({ locale }),
    };
  };
}

afterEach(() => {
  (Intl as any).DateTimeFormat = originalDateTimeFormat;
});

describe('resolveLocale', () => {
  it('resolves exact device locale', () => {
    mockDeviceLocale('en');
    const result = resolveLocale();
    expect(result.locale).toBe('en');
    expect(result.source).toBe('device');
  });

  it('falls back from regional variant to base language', () => {
    mockDeviceLocale('fr-CA');
    const result = resolveLocale();
    expect(result.locale).toBe('fr');
    expect(result.source).toBe('device');
  });

  it('resolves regional variant with exact match when available', () => {
    mockDeviceLocale('zh-CN');
    const result = resolveLocale();
    expect(result.locale).toBe('zh-CN');
    expect(result.source).toBe('device');
  });

  it('normalizes underscore locale format from Android', () => {
    mockDeviceLocale('pt_BR');
    const result = resolveLocale();
    expect(result.locale).toBe('pt-BR');
    expect(result.source).toBe('device');
  });

  it('falls back to en when device locale is unsupported', () => {
    mockDeviceLocale('xx-XX');
    const result = resolveLocale();
    expect(result.locale).toBe('en');
    expect(result.source).toBe('fallback');
  });

  it('falls back to en when Intl fails', () => {
    (Intl as any).DateTimeFormat = function () {
      throw new Error('Intl not available');
    };
    const result = resolveLocale();
    expect(result.locale).toBe('en');
    expect(result.source).toBe('fallback');
  });
});
