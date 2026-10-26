import { toTextStyle } from '../../../Components/internal/theme/typography';
import { defaultLightTokens } from '../../../Components/internal/theme/tokens';
import type { PrimerTypographyStyle } from '../../../Components/internal/theme/types';

describe('toTextStyle', () => {
  it('returns only the five text fields of a typography style', () => {
    const bodyLarge = defaultLightTokens.typography.bodyLarge;
    const style = { ...bodyLarge, textTransform: 'uppercase' } as PrimerTypographyStyle;

    expect(toTextStyle(style)).toEqual({
      fontFamily: bodyLarge.fontFamily,
      fontSize: bodyLarge.fontSize,
      fontWeight: bodyLarge.fontWeight,
      letterSpacing: bodyLarge.letterSpacing,
      lineHeight: bodyLarge.lineHeight,
    });
  });
});
