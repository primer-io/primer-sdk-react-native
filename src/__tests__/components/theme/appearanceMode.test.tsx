import { createElement } from 'react';
import { useColorScheme } from 'react-native';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { useResolvedScheme } from '../../../Components/internal/theme/useResolvedScheme';
import type { PrimerColorScheme } from '../../../Components/internal/theme/ThemeContext';
import type { PrimerAppearanceMode } from '../../../models/PrimerSettings';

const setPhoneScheme = (scheme: 'light' | 'dark' | null) => jest.mocked(useColorScheme).mockReturnValue(scheme);

afterEach(() => {
  setPhoneScheme('light');
});

function resolve(appearanceMode?: PrimerAppearanceMode): PrimerColorScheme {
  let seen: PrimerColorScheme = 'light';
  function Probe() {
    seen = useResolvedScheme(appearanceMode);
    return null;
  }
  act(() => {
    renderer.create(createElement(Probe));
  });
  return seen;
}

describe('useResolvedScheme', () => {
  it('follows the phone when the mode is SYSTEM', () => {
    setPhoneScheme('dark');
    expect(resolve('SYSTEM')).toBe('dark');
    setPhoneScheme('light');
    expect(resolve('SYSTEM')).toBe('light');
  });

  it('follows the phone when nothing is set', () => {
    setPhoneScheme('dark');
    expect(resolve(undefined)).toBe('dark');
  });

  it('is light when the phone reports no scheme', () => {
    setPhoneScheme(null);
    expect(resolve(undefined)).toBe('light');
  });

  it('forces dark whatever the phone says', () => {
    setPhoneScheme('light');
    expect(resolve('DARK')).toBe('dark');
  });

  it('forces light whatever the phone says', () => {
    setPhoneScheme('dark');
    expect(resolve('LIGHT')).toBe('light');
  });
});
