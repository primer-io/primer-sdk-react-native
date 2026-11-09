// @ts-expect-error
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error
import renderer, { act } from 'react-test-renderer';
import { PrimerTextInput } from '../../../Components/inputs/PrimerTextInput';

function errorIcons(error?: string) {
  let instance: any;
  act(() => {
    instance = renderer.create(
      createElement(PrimerTextInput, { value: '', onChangeText: () => {}, testID: 'field', error })
    );
  });
  return instance.root.findAll((n: any) => n.type === 'Image' && n.props.testID === 'field-error-icon');
}

describe('PrimerTextInput error icon', () => {
  it('shows the warning icon inside a field with an error', () => {
    expect(errorIcons('Card number is invalid')).toHaveLength(1);
  });

  it('shows no warning icon without an error', () => {
    expect(errorIcons()).toHaveLength(0);
  });
});
