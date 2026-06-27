import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock(
  'react-native',
  () => ({
    Image: 'Image',
    StyleSheet: { create: (s: unknown) => s, flatten: (s: unknown) => s },
    Text: 'Text',
    TextInput: 'TextInput',
    View: 'View',
    Platform: { OS: 'ios' },
    useColorScheme: () => 'light',
  }),
  { virtual: true }
);

jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: {
      background: '#fff',
      surface: '#fafafa',
      border: '#ccc',
      borderDisabled: '#eee',
      borderError: '#f00',
      borderFocused: '#08f',
      primary: '#08f',
      textPrimary: '#000',
      textSecondary: '#666',
      textPlaceholder: '#999',
      textDisabled: '#aaa',
      textNegative: '#f00',
    },
    spacing: { xsmall: 4, small: 8, medium: 12, large: 16, xlarge: 20 },
    radii: { small: 4, medium: 8, large: 12 },
    borders: { input: 1, strong: 2 },
    typography: {
      fontFamily: 'system',
      bodySmall: { fontFamily: 'system', fontSize: 12, fontWeight: '400', letterSpacing: 0, lineHeight: 16 },
      bodyLarge: { fontFamily: 'system', fontSize: 16, fontWeight: '400', letterSpacing: 0, lineHeight: 20 },
    },
  }),
}));

jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import { VaultedCardCvvRow } from '../../Components/internal/ui/VaultedCardCvvRow';

function findInputProps(tree: any): Record<string, unknown> | null {
  if (tree == null) return null;
  if (Array.isArray(tree)) {
    for (const item of tree) {
      const found = findInputProps(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof tree !== 'object') return null;
  if (tree.type === 'TextInput') {
    return tree.props as Record<string, unknown>;
  }
  const children = tree.children;
  if (children == null) return null;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findInputProps(child);
      if (found) return found;
    }
  } else {
    return findInputProps(children);
  }
  return null;
}

function renderRow(props: { value: string; onChangeValue: (s: string) => void; cvvLabel: string; maxLength: number }) {
  let instance: any;
  act(() => {
    instance = renderer.create(createElement(VaultedCardCvvRow, props));
  });
  return instance;
}

describe('VaultedCardCvvRow', () => {
  it('forwards maxLength=4 (Amex) to the input', () => {
    const tree = renderRow({ value: '', onChangeValue: () => {}, cvvLabel: 'CID', maxLength: 4 }).toJSON();
    const input = findInputProps(tree);
    expect(input?.maxLength).toBe(4);
  });

  it('forwards maxLength=3 (Visa/MC/etc) to the input', () => {
    const tree = renderRow({ value: '', onChangeValue: () => {}, cvvLabel: 'CVV', maxLength: 3 }).toJSON();
    const input = findInputProps(tree);
    expect(input?.maxLength).toBe(3);
  });

  it('uses cvvLabel as the input placeholder', () => {
    const tree = renderRow({ value: '', onChangeValue: () => {}, cvvLabel: 'CID', maxLength: 4 }).toJSON();
    const input = findInputProps(tree);
    expect(input?.placeholder).toBe('CID');
  });

  it('strips non-digit characters from input before calling onChangeValue', () => {
    const onChangeValue = jest.fn();
    const instance = renderRow({ value: '', onChangeValue, cvvLabel: 'CVV', maxLength: 3 });
    const input = findInputProps(instance.toJSON());
    expect(typeof input?.onChangeText).toBe('function');
    (input?.onChangeText as (s: string) => void)('1a2b3');
    expect(onChangeValue).toHaveBeenCalledWith('123');
  });

  it('passes the value through to the input', () => {
    const tree = renderRow({ value: '12', onChangeValue: () => {}, cvvLabel: 'CVV', maxLength: 3 }).toJSON();
    const input = findInputProps(tree);
    expect(input?.value).toBe('12');
  });

  it('renders with secureTextEntry and number-pad keyboard', () => {
    const tree = renderRow({ value: '', onChangeValue: () => {}, cvvLabel: 'CVV', maxLength: 3 }).toJSON();
    const input = findInputProps(tree);
    expect(input?.secureTextEntry).toBe(true);
    expect(input?.keyboardType).toBe('number-pad');
    expect(input?.autoComplete).toBe('cc-csc');
  });
});
