import { resolveLocale } from '../../../Components/internal/localization/locale-resolver';

// Mock Intl.DateTimeFormat for device locale detection
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
  describe('device locale detection', () => {
    it('detects device locale', () => {
      mockDeviceLocale('fr-FR');
      const result = resolveLocale();
      expect(result.locale).toBe('fr');
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

  describe('fallback chain', () => {
    it('resolves exact locale match', () => {
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

    it('falls back to en when base language is not supported', () => {
      mockDeviceLocale('xx-YY');
      const result = resolveLocale();
      expect(result.locale).toBe('en');
      expect(result.source).toBe('fallback');
    });
  });
});
