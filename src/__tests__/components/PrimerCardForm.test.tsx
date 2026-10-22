// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({ spacing: { medium: 12 } }),
}));

jest.mock('../../Components/hooks/usePrimerCardForm', () => ({
  usePrimerCardForm: () => ({
    isSubmitting: false,
    isCardholderNameVisible: true,
    descriptor: { cvvLabel: 'CVV' },
  }),
}));

jest.mock('../../Components/inputs/PrimerCardNumberInput', () => ({ PrimerCardNumberInput: 'PrimerCardNumberInput' }));
jest.mock('../../Components/inputs/PrimerExpiryDateInput', () => ({ PrimerExpiryDateInput: 'PrimerExpiryDateInput' }));
jest.mock('../../Components/inputs/PrimerCVVInput', () => ({ PrimerCVVInput: 'PrimerCVVInput' }));
jest.mock('../../Components/inputs/PrimerCardholderNameInput', () => ({
  PrimerCardholderNameInput: 'PrimerCardholderNameInput',
}));
jest.mock('../../Components/PrimerAcceptedCardNetworks', () => ({
  PrimerAcceptedCardNetworks: 'PrimerAcceptedCardNetworks',
}));

import { PrimerCardForm } from '../../Components/PrimerCardForm';

describe('PrimerCardForm', () => {
  function render() {
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerCardForm, {}));
    });
    return tree.root;
  }

  // iOS and Android show no logos row; the team found RN's cluttered (ORC-8705).
  it('shows no accepted card logos row', () => {
    const root = render();
    expect(root.findAll((node: any) => node.type === 'PrimerAcceptedCardNetworks')).toHaveLength(0);
    expect(root.findAll((node: any) => /accepted/.test(String(node.props.testID ?? '')))).toHaveLength(0);
  });

  it('starts with the card number', () => {
    const root = render();
    const form = root.find((node: any) => node.type === 'View' && node.props.testID === 'primer-card-form');
    expect(form.children[0].type).toBe('PrimerCardNumberInput');
  });
});
