// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { CountrySelectorRow } from '../../../Components/inputs/CountrySelectorRow';
import { PrimerTextInput } from '../../../Components/inputs/PrimerTextInput';
import { defaultLightTokens } from '../../../Components/internal/theme/tokens/light';

const { spacing, typography, widths } = defaultLightTokens;

function flatten(style: unknown): Record<string, any> {
  return [style].flat(Infinity).reduce<Record<string, any>>((all, s) => ({ ...all, ...(s as object) }), {});
}

function renderInput(props: Record<string, unknown> = {}) {
  let tree: any;
  act(() => {
    tree = renderer.create(
      createElement(PrimerTextInput, { value: '', onChangeText: () => {}, label: 'Card number', ...props })
    );
  });
  return tree;
}

function measure(tree: any) {
  const input = tree.root.find((n: any) => n.type === 'TextInput');
  let box = input.parent;
  while (box.type !== 'View') box = box.parent;
  const inputStyle = flatten(input.props.style);
  const boxStyle = flatten(box.props.style);
  return {
    input,
    inputStyle,
    boxStyle,
    outsideHeight: inputStyle.lineHeight + 2 * inputStyle.paddingVertical + 2 * boxStyle.borderWidth,
  };
}

describe('PrimerTextInput box height', () => {
  it('is 44 tall on the outside at the default theme, border included', () => {
    const { boxStyle, inputStyle, outsideHeight } = measure(renderInput());

    expect(boxStyle.minHeight).toBe(44);
    expect(boxStyle.height).toBeUndefined();
    expect(inputStyle.paddingVertical).toBe(spacing.medium - widths.default);
    expect(outsideHeight).toBe(44);
  });

  it('stays 44 when focus thickens the border', () => {
    const tree = renderInput();
    act(() => measure(tree).input.props.onFocus());

    const { inputStyle, outsideHeight } = measure(tree);

    expect(inputStyle.paddingVertical).toBe(spacing.medium - widths.focus);
    expect(outsideHeight).toBe(44);
  });

  it('stays 44 when an error thickens the border', () => {
    const { inputStyle, outsideHeight } = measure(renderInput({ error: 'Invalid card number' }));

    expect(inputStyle.paddingVertical).toBe(spacing.medium - widths.error);
    expect(outsideHeight).toBe(44);
  });

  it('stretches the text field over the box, so a tap above or below the text lands in it', () => {
    expect(measure(renderInput()).inputStyle.alignSelf).toBe('stretch');
  });

  it('treats a merchant fieldHeight as a minimum, so the box still grows with the font scale', () => {
    const { boxStyle } = measure(renderInput({ theme: { fieldHeight: 56 } }));

    expect(boxStyle.minHeight).toBe(56);
    expect(boxStyle.height).toBeUndefined();
  });
});

describe('CountrySelectorRow box height', () => {
  function renderRow() {
    let tree: any;
    act(() => {
      tree = renderer.create(
        createElement(CountrySelectorRow, {
          value: 'GB',
          displayName: 'United Kingdom',
          label: 'Country',
          placeholder: 'Select',
          onPress: () => {},
          testID: 'country',
        })
      );
    });
    return tree.root.find((n: any) => n.type === 'TouchableOpacity' && n.props.testID === 'country-row');
  }

  it('matches the text inputs: 44 on the outside at the default theme, border included', () => {
    const style = flatten(renderRow().props.style);

    expect(style.minHeight).toBe(44);
    expect(style.height).toBeUndefined();
    expect(style.paddingVertical).toBe(spacing.medium - widths.default);
  });

  it('keeps the flag and chevron to the body line height, so a selected country does not grow the row', () => {
    const lineHeights = renderRow()
      .findAll((n: any) => n.type === 'Text')
      .map((n: any) => flatten(n.props.style).lineHeight);

    expect(lineHeights).toHaveLength(3);
    expect(new Set(lineHeights)).toEqual(new Set([typography.bodyLarge.lineHeight]));
  });
});
