import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { ThemeContext } from '../ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from '../tokens';
import { useTheme } from '../useTheme';
import type { PrimerTokens } from '../types';

let mockColorScheme: 'light' | 'dark' | null = 'light';

jest.mock('react-native', () => ({
  useColorScheme: () => mockColorScheme,
}));

function renderHook<T>(hook: () => T, Wrapper?: (props: { children: ReactNode }) => ReactNode | null) {
  const result = { current: null as unknown as T };

  function HookComponent() {
    result.current = hook();
    return null;
  }

  act(() => {
    create(Wrapper ? createElement(Wrapper, { children: createElement(HookComponent) }) : createElement(HookComponent));
  });

  return { result };
}

describe('useTheme', () => {
  beforeEach(() => {
    mockColorScheme = 'light';
  });

  describe('outside provider', () => {
    it('returns defaultLightTokens in light mode', () => {
      mockColorScheme = 'light';
      const { result } = renderHook(() => useTheme());
      expect(result.current).toBe(defaultLightTokens);
    });

    it('returns defaultDarkTokens in dark mode', () => {
      mockColorScheme = 'dark';
      const { result } = renderHook(() => useTheme());
      expect(result.current).toBe(defaultDarkTokens);
    });

    it('returns defaultLightTokens when colorScheme is null', () => {
      mockColorScheme = null;
      const { result } = renderHook(() => useTheme());
      expect(result.current).toBe(defaultLightTokens);
    });
  });

  describe('inside provider with no theme override', () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(ThemeContext.Provider, {
        value: { lightTokens: defaultLightTokens, darkTokens: defaultDarkTokens },
        children,
      });
    }

    it('returns defaultLightTokens in light mode', () => {
      mockColorScheme = 'light';
      const { result } = renderHook(() => useTheme(), Wrapper);
      expect(result.current).toBe(defaultLightTokens);
    });

    it('returns defaultDarkTokens in dark mode', () => {
      mockColorScheme = 'dark';
      const { result } = renderHook(() => useTheme(), Wrapper);
      expect(result.current).toBe(defaultDarkTokens);
    });
  });

  describe('inside provider with light override', () => {
    const customLightTokens: PrimerTokens = {
      ...defaultLightTokens,
      colors: { ...defaultLightTokens.colors, primary: '#ff6b35' },
    };

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(ThemeContext.Provider, {
        value: { lightTokens: customLightTokens, darkTokens: defaultDarkTokens },
        children,
      });
    }

    it('applies light override in light mode', () => {
      mockColorScheme = 'light';
      const { result } = renderHook(() => useTheme(), Wrapper);
      expect(result.current.colors.primary).toBe('#ff6b35');
    });

    it('does not apply light override in dark mode', () => {
      mockColorScheme = 'dark';
      const { result } = renderHook(() => useTheme(), Wrapper);
      expect(result.current.colors.primary).toBe(defaultDarkTokens.colors.primary);
    });
  });

  describe('inside provider with both mode overrides', () => {
    const customLightTokens: PrimerTokens = {
      ...defaultLightTokens,
      colors: { ...defaultLightTokens.colors, primary: '#ff6b35' },
    };
    const customDarkTokens: PrimerTokens = {
      ...defaultDarkTokens,
      colors: { ...defaultDarkTokens.colors, primary: '#ff8c5a' },
    };

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(ThemeContext.Provider, {
        value: { lightTokens: customLightTokens, darkTokens: customDarkTokens },
        children,
      });
    }

    it('returns light override in light mode', () => {
      mockColorScheme = 'light';
      const { result } = renderHook(() => useTheme(), Wrapper);
      expect(result.current.colors.primary).toBe('#ff6b35');
    });

    it('returns dark override in dark mode', () => {
      mockColorScheme = 'dark';
      const { result } = renderHook(() => useTheme(), Wrapper);
      expect(result.current.colors.primary).toBe('#ff8c5a');
    });
  });
});
