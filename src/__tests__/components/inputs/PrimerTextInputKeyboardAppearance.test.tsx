// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
import { useColorScheme } from 'react-native';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerTextInput } from '../../../Components/inputs/PrimerTextInput';
import { ThemeContext, type PrimerColorScheme } from '../../../Components/internal/theme/ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from '../../../Components/internal/theme/tokens';

function renderUnder(scheme: PrimerColorScheme) {
  const field = createElement(PrimerTextInput, { value: '', onChangeText: () => {}, label: 'Name' });
  const tokens = scheme === 'dark' ? defaultDarkTokens : defaultLightTokens;
  let instance: any;
  act(() => {
    instance = renderer.create(createElement(ThemeContext.Provider, { value: { scheme, tokens } }, field));
  });
  return instance.root.find((n: any) => n.type === 'TextInput').props;
}

describe('PrimerTextInput keyboardAppearance', () => {
  it('is dark when the checkout is forced dark on a light phone', () => {
    jest.mocked(useColorScheme).mockReturnValue('light');
    expect(renderUnder('dark').keyboardAppearance).toBe('dark');
  });
});
