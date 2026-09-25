import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { useResolvedScheme } from '../../../Components/internal/theme/useResolvedScheme';
import type { PrimerColorScheme } from '../../../Components/internal/theme/ThemeContext';
import type { PrimerAppearanceMode } from '../../../models/PrimerSettings';

let mockSystemScheme: 'light' | 'dark' | null = 'light';

jest.mock('react-native', () => ({
  useColorScheme: () => mockSystemScheme,
}));

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
    mockSystemScheme = 'dark';
    expect(resolve('SYSTEM')).toBe('dark');
    mockSystemScheme = 'light';
    expect(resolve('SYSTEM')).toBe('light');
  });

  it('follows the phone when nothing is set', () => {
    mockSystemScheme = 'dark';
    expect(resolve(undefined)).toBe('dark');
  });

  it('is light when the phone reports no scheme', () => {
    mockSystemScheme = null;
    expect(resolve(undefined)).toBe('light');
  });

  it('forces dark whatever the phone says', () => {
    mockSystemScheme = 'light';
    expect(resolve('DARK')).toBe('dark');
  });

  it('forces light whatever the phone says', () => {
    mockSystemScheme = 'dark';
    expect(resolve('LIGHT')).toBe('light');
  });
});
