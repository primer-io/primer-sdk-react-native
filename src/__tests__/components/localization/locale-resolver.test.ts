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
    it('detects device locale when no override provided', () => {
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

    it('falls back to en when base language is not supported', () => {
      mockDeviceLocale('zh-CN');
      const result = resolveLocale();
      expect(result.locale).toBe('en');
      expect(result.source).toBe('fallback');
    });
  });

  describe('locale override', () => {
    it('uses localeCode override when provided', () => {
      mockDeviceLocale('en-US');
      const result = resolveLocale({ localeCode: 'es-ES' });
      expect(result.locale).toBe('es');
      expect(result.source).toBe('override');
    });

    it('uses languageCode override when localeCode not provided', () => {
      mockDeviceLocale('en-US');
      const result = resolveLocale({ languageCode: 'de' });
      expect(result.locale).toBe('de');
      expect(result.source).toBe('override');
    });

    it('localeCode takes precedence over languageCode', () => {
      mockDeviceLocale('en-US');
      const result = resolveLocale({ localeCode: 'fr-FR', languageCode: 'de' });
      expect(result.locale).toBe('fr');
      expect(result.source).toBe('override');
    });

    it('falls back to device locale when override locale is unsupported', () => {
      mockDeviceLocale('fr-FR');
      const result = resolveLocale({ localeCode: 'xx-XX' });
      expect(result.locale).toBe('fr');
      expect(result.source).toBe('device');
    });

    it('reverts to device locale when override is undefined', () => {
      mockDeviceLocale('ja');
      const result = resolveLocale(undefined);
      expect(result.locale).toBe('ja');
      expect(result.source).toBe('device');
    });
  });
});
