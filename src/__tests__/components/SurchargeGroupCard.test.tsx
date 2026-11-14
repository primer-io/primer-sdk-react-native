// @ts-expect-error
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error
import renderer, { act } from 'react-test-renderer';

import { formatCurrency } from '../../Components/internal/currency';
import { resolveLocale } from '../../Components/internal/localization/locale-resolver';
import { translate } from '../../Components/internal/localization/translate';
import { defaultLightTokens } from '../../Components/internal/theme/tokens';
import type { SurchargeGroupTitle } from '../../Components/internal/groupBySurcharge';
import type { PaymentMethodItem, PaymentMethodSurcharge } from '../../Components/types/PaymentMethodTypes';

let mockCheckout: Record<string, unknown> = {};
jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => mockCheckout,
}));

jest.mock('../../Components/internal/ui/PaymentMethodButton', () => ({ PaymentMethodButton: 'PaymentMethodButton' }));

import { SurchargeGroupCard } from '../../Components/internal/ui/SurchargeGroupCard';
import { PrimerPaymentMethodList } from '../../Components/PrimerPaymentMethodList';

const { locale } = resolveLocale();
const tr = (key: string) => translate(key, locale);
const tokens = defaultLightTokens;

const flatten = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : ((style as Record<string, unknown>) ?? {});

function render(element: ReturnType<typeof createElement>) {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
}

const texts = (tree: any) => tree.root.findAll((n: any) => n.type === 'Text');

function renderCard(title: SurchargeGroupTitle) {
  return render(createElement(SurchargeGroupCard, { title, children: createElement('PaymentMethodButton') }));
}

const method = (type: string, surcharge?: PaymentMethodSurcharge) => ({ type, surcharge }) as PaymentMethodItem;

const flat = (amount: number): PaymentMethodSurcharge => ({ kind: 'flat', amount });

beforeEach(() => {
  mockCheckout = { clientSession: { currencyCode: 'GBP' }, acceptedCardNetworks: ['VISA', 'MASTERCARD'] };
});

describe('SurchargeGroupCard', () => {
  it('shows "Surcharge fee" in secondary text on the left and the fee in title large on the right', () => {
    const tree = renderCard(50);
    const [label, amount] = texts(tree);

    expect(label.props.children).toBe(tr('primer_payment_selection_surcharge_label'));
    expect(flatten(label.props.style)).toMatchObject({
      color: tokens.colors.textSecondary,
      fontSize: tokens.typography.bodyMedium.fontSize,
    });
    expect(amount.props.children).toBe(`+ ${formatCurrency(50, 'GBP', locale)}`);
    expect(flatten(amount.props.style)).toMatchObject({
      color: tokens.colors.textPrimary,
      fontSize: tokens.typography.titleLarge.fontSize,
      fontWeight: tokens.typography.titleLarge.fontWeight,
    });
  });

  it.each([
    ['none', 'primer_payment_selection_surcharge_none'],
    ['mayApply', 'primer_payment_selection_surcharge_may_apply'],
  ] as const)('shows the %s title right-aligned in primary text', (title, key) => {
    const [text] = texts(renderCard(title));

    expect(text.props.children).toBe(tr(key));
    expect(flatten(text.props.style)).toMatchObject({
      color: tokens.colors.textPrimary,
      fontSize: tokens.typography.bodyMedium.fontSize,
      textAlign: 'right',
    });
  });

  it('wraps its rows in the secondary background with small padding and gap and a large radius', () => {
    const tree = renderCard(50);
    const card = tree.root.findAll((n: any) => n.type === 'View')[0];

    expect(flatten(card.props.style)).toEqual({
      backgroundColor: tokens.colors.backgroundSecondary,
      borderRadius: tokens.radii.large,
      gap: tokens.spacing.small,
      padding: tokens.spacing.small,
    });
    expect(tree.root.findAll((n: any) => n.type === 'PaymentMethodButton')).toHaveLength(1);
  });
});

describe('PrimerPaymentMethodList surcharge groups', () => {
  const groups = (data: PaymentMethodItem[]) => {
    const tree = render(createElement(PrimerPaymentMethodList, { data, onSelect: jest.fn() }));
    return tree.root
      .findAllByType(SurchargeGroupCard)
      .map((card: any) => [
        card.props.title,
        card.findAll((n: any) => n.type === 'PaymentMethodButton').map((b: any) => b.props.item.type),
      ]);
  };

  it('uses the allowed card networks to give the card a single fee', () => {
    mockCheckout.acceptedCardNetworks = ['VISA'];

    expect(
      groups([method('PAYMENT_CARD', { kind: 'perNetwork', amounts: { VISA: 50, MASTERCARD: 70 } }), method('PAYPAL')])
    ).toEqual([
      [50, ['PAYMENT_CARD']],
      ['none', ['PAYPAL']],
    ]);
  });

  it('keeps a flat list without titles when no method has a fee', () => {
    const tree = render(
      createElement(PrimerPaymentMethodList, { data: [method('PAYPAL'), method('APPLE_PAY')], onSelect: jest.fn() })
    );

    expect(tree.root.findAllByType(SurchargeGroupCard)).toHaveLength(0);
    expect(tree.root.findByType('FlatList').props.data.map((m: PaymentMethodItem) => m.type)).toEqual([
      'PAYPAL',
      'APPLE_PAY',
    ]);
  });

  it('selects a method tapped inside a group', () => {
    const onSelect = jest.fn();
    const tree = render(
      createElement(PrimerPaymentMethodList, { data: [method('PAYPAL', flat(100)), method('KLARNA')], onSelect })
    );
    const button = tree.root.findAll((n: any) => n.type === 'PaymentMethodButton')[1];

    act(() => button.props.onPress());

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ type: 'KLARNA' }));
  });
});
