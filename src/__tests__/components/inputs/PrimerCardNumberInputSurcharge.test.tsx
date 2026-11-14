// @ts-expect-error
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error
import renderer, { act } from 'react-test-renderer';

import { formatCurrency } from '../../../Components/internal/currency';
import { resolveLocale } from '../../../Components/internal/localization/locale-resolver';
import { defaultLightTokens } from '../../../Components/internal/theme/tokens';
import type { PrimerBinData } from '../../../models/PrimerBinData';

let mockBinData: PrimerBinData | null = null;
let mockSelectedNetwork: string | null = null;
let mockCardNumber = '';
const mockSession = {
  currencyCode: 'GBP',
  paymentMethodOptions: {
    PAYMENT_CARD: {
      networks: {
        VISA: { surcharge: { amount: 50 } },
        MASTERCARD: { surcharge: { amount: 0 } },
        CARTES_BANCAIRES: { surcharge: { amount: 30 } },
      },
    },
  },
};

jest.mock('../../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => ({
    clientSession: mockSession,
    cardFormState: { binData: mockBinData },
    selectedCardNetwork: mockSelectedNetwork,
    selectCardNetwork: jest.fn(),
  }),
}));

jest.mock('../../../Components/internal/form-state/CardFormStateProvider', () => ({
  useCardFormStateContext: () => ({
    cardNumber: mockCardNumber,
    cardNumberMaxLength: 23,
    errors: {},
    updateCardNumber: jest.fn(),
    markFieldFocused: jest.fn(),
    markFieldBlurred: jest.fn(),
  }),
}));

jest.mock('../../../Components/hooks/usePrimerCardNetwork', () => ({
  usePrimerCardNetwork: () => ({ network: mockBinData?.preferred?.network ?? null, iconSource: null }),
}));

jest.mock('../../../Components/PrimerCardNetworkSelector', () => ({
  PrimerCardNetworkSelector: 'PrimerCardNetworkSelector',
}));

import { PrimerCardNumberInput } from '../../../Components/inputs/PrimerCardNumberInput';
import { PrimerTextInput } from '../../../Components/inputs/PrimerTextInput';

const { locale } = resolveLocale();
const tokens = defaultLightTokens;

const network = (id: string) => ({ network: id, displayName: id });
const binData = (preferred: string, alternatives: string[] = []): PrimerBinData => ({
  preferred: network(preferred),
  alternatives: alternatives.map(network),
  status: 'COMPLETE',
  firstDigits: '41111111',
});

const flatten = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : ((style as Record<string, unknown>) ?? {});

function render() {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(PrimerCardNumberInput, { testID: 'card' }));
  });
  return tree;
}

function rerender(tree: any) {
  act(() => {
    tree.update(createElement(PrimerCardNumberInput, { testID: 'card' }));
  });
}

const badges = (tree: any) => tree.root.findAll((n: any) => n.type === 'Text' && n.props.testID === 'card-surcharge');
const badgeText = (tree: any) => badges(tree)[0]?.props.children;
const fee = (amount: number) => `+ ${formatCurrency(amount, 'GBP', locale)}`;

describe('PrimerCardNumberInput surcharge badge', () => {
  beforeEach(() => {
    mockBinData = null;
    mockSelectedNetwork = null;
    mockCardNumber = '4111 1111';
  });

  it('shows the detected network fee to the left of the network logo', () => {
    mockBinData = binData('VISA');
    const tree = render();

    expect(badgeText(tree)).toBe(fee(50));
    const trailing = tree.root.findByType(PrimerTextInput).props.trailingContent;
    expect(trailing.props.children[1].props.testID).toBe('card-network-abbreviation');
  });

  it('looks like a small caption chip', () => {
    mockBinData = binData('VISA');
    const tree = render();
    const [badge] = badges(tree);

    expect(flatten(badge.props.style)).toMatchObject({
      color: tokens.colors.textPrimary,
      fontSize: tokens.typography.bodySmall.fontSize,
    });
    expect(flatten(badge.parent.parent.props.style)).toMatchObject({
      backgroundColor: tokens.colors.backgroundSecondary,
      borderRadius: tokens.radii.xsmall,
      paddingHorizontal: tokens.spacing.xsmall,
      paddingVertical: tokens.spacing.xxsmall,
    });
  });

  it.each([
    ['a zero fee', 'MASTERCARD'],
    ['no fee entry', 'AMEX'],
  ])('hides for a network with %s', (_name, id) => {
    mockBinData = binData(id);

    expect(badges(render())).toHaveLength(0);
  });

  it('hides before a network is detected', () => {
    expect(badges(render())).toHaveLength(0);
  });

  it('follows the network the shopper picks on a co-badged card', () => {
    mockBinData = binData('VISA', ['CARTES_BANCAIRES']);
    const tree = render();
    expect(badgeText(tree)).toBe(fee(50));

    mockSelectedNetwork = 'CARTES_BANCAIRES';
    rerender(tree);
    expect(badgeText(tree)).toBe(fee(30));
  });

  it('hides when the number is cleared', () => {
    mockBinData = binData('VISA');
    const tree = render();
    expect(badgeText(tree)).toBe(fee(50));

    mockCardNumber = '';
    rerender(tree);
    expect(badges(tree)).toHaveLength(0);
  });
});
