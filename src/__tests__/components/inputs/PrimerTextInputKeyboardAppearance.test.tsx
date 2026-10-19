// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
import { useColorScheme } from 'react-native';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerTextInput } from '../../../Components/inputs/PrimerTextInput';
import { ThemeContext, type PrimerColorScheme } from '../../../Components/internal/theme/ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from '../../../Components/internal/theme/tokens';

function renderUnder(scheme: PrimerColorScheme | null) {
  const field = createElement(PrimerTextInput, { value: '', onChangeText: () => {}, label: 'Name' });
  const tokens = scheme === 'dark' ? defaultDarkTokens : defaultLightTokens;
  let instance: any;
  act(() => {
    instance = renderer.create(
      scheme ? createElement(ThemeContext.Provider, { value: { scheme, tokens } }, field) : field
    );
  });
  return instance.root.find((n: any) => n.type === 'TextInput').props;
}

afterEach(() => {
  jest.mocked(useColorScheme).mockReturnValue('light');
});

describe('PrimerTextInput keyboardAppearance', () => {
  it('is dark when the checkout is forced dark on a light phone', () => {
    jest.mocked(useColorScheme).mockReturnValue('light');
    expect(renderUnder('dark').keyboardAppearance).toBe('dark');
  });

  it('is light when the checkout is forced light on a dark phone', () => {
    jest.mocked(useColorScheme).mockReturnValue('dark');
    expect(renderUnder('light').keyboardAppearance).toBe('light');
  });

  it('follows the phone outside the provider', () => {
    jest.mocked(useColorScheme).mockReturnValue('dark');
    expect(renderUnder(null).keyboardAppearance).toBe('dark');
  });
});
