import { createElement, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
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
  afterEach(() => {
    jest.mocked(useColorScheme).mockReturnValue('light');
  });

  it('follow the phone outside a provider', () => {
    const light = renderHook(readTheme).result;
    expect(light.current.tokens).toBe(defaultLightTokens);
    expect(light.current.scheme).toBe('light');

    jest.mocked(useColorScheme).mockReturnValue('dark');
    const dark = renderHook(readTheme).result;
    expect(dark.current.tokens).toBe(defaultDarkTokens);
    expect(dark.current.scheme).toBe('dark');
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
