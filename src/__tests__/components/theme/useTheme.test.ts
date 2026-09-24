import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { ThemeContext } from '../../../Components/internal/theme/ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from '../../../Components/internal/theme/tokens';
import { usePrimerColorScheme, usePrimerTheme } from '../../../Components/internal/theme/usePrimerTheme';

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

const readTheme = () => ({ tokens: usePrimerTheme(), scheme: usePrimerColorScheme() });

describe('usePrimerTheme and usePrimerColorScheme', () => {
  it('return the light defaults outside a provider', () => {
    const { result } = renderHook(readTheme);

    expect(result.current.tokens).toBe(defaultLightTokens);
    expect(result.current.scheme).toBe('light');
  });

  it('return what the provider decided', () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(ThemeContext.Provider, { value: { scheme: 'dark', tokens: defaultDarkTokens }, children });
    }

    const { result } = renderHook(readTheme, Wrapper);

    expect(result.current.tokens).toBe(defaultDarkTokens);
    expect(result.current.scheme).toBe('dark');
  });
});
