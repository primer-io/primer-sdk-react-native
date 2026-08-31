import { resolveTheme } from '../../Components/inputs/PrimerTextInput';
import { defaultLightTokens } from '../../Components/internal/theme/tokens/light';

describe('PrimerTextInput resolveTheme', () => {
  it('falls back to the error typography token when nothing is overridden', () => {
    const r = resolveTheme(defaultLightTokens);

    expect(r.errorFontFamily).toBe(defaultLightTokens.typography.error.fontFamily);
    expect(r.errorFontSize).toBe(defaultLightTokens.typography.error.fontSize);
  });

  it('still honours fontFamily and labelFontSize, which styled the error text before the error token existed', () => {
    const r = resolveTheme(defaultLightTokens, { fontFamily: 'Courier', labelFontSize: 18 });

    expect(r.errorFontFamily).toBe('Courier');
    expect(r.errorFontSize).toBe(18);
  });

  it('lets the dedicated error overrides win', () => {
    const r = resolveTheme(defaultLightTokens, {
      fontFamily: 'Courier',
      labelFontSize: 18,
      errorFontFamily: 'Menlo',
      errorFontSize: 9,
    });

    expect(r.errorFontFamily).toBe('Menlo');
    expect(r.errorFontSize).toBe(9);
  });
});
