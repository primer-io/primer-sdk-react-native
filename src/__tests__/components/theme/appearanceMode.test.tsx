import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { ThemeContext } from '../../../Components/internal/theme/ThemeContext';
import { useIsDarkAppearance } from '../../../Components/internal/theme/useAppearanceMode';
import { defaultDarkTokens, defaultLightTokens } from '../../../Components/internal/theme/tokens';
import type { PrimerAppearanceMode } from '../../../models/PrimerSettings';

let mockSystemScheme: 'light' | 'dark' = 'light';

jest.mock('react-native', () => ({
  useColorScheme: () => mockSystemScheme,
}));

function read(appearanceMode?: PrimerAppearanceMode): boolean {
  let seen = false;
  function Probe() {
    seen = useIsDarkAppearance();
    return null;
  }
  act(() => {
    renderer.create(
      createElement(
        ThemeContext.Provider,
        { value: { lightTokens: defaultLightTokens, darkTokens: defaultDarkTokens, appearanceMode } },
        createElement(Probe)
      )
    );
  });
  return seen;
}

describe('useIsDarkAppearance', () => {
  it('follows the phone when the mode is SYSTEM', () => {
    mockSystemScheme = 'dark';
    expect(read('SYSTEM')).toBe(true);
    mockSystemScheme = 'light';
    expect(read('SYSTEM')).toBe(false);
  });

  it('follows the phone when nothing is set', () => {
    mockSystemScheme = 'dark';
    expect(read(undefined)).toBe(true);
  });

  it('forces dark whatever the phone says', () => {
    mockSystemScheme = 'light';
    expect(read('DARK')).toBe(true);
  });

  it('forces light whatever the phone says', () => {
    mockSystemScheme = 'dark';
    expect(read('LIGHT')).toBe(false);
  });
});
