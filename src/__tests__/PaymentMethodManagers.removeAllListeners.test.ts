jest.mock(
  'react-native',
  () => {
    const mockAddListener = jest.fn();
    const mockRemoveAllListeners = jest.fn();
    return {
      NativeModules: {
        RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent: {
          configure: jest.fn().mockResolvedValue(undefined),
          start: jest.fn(),
          submit: jest.fn(),
          onSetFirstName: jest.fn(),
          onSetLastName: jest.fn(),
          onSetEmailAddress: jest.fn(),
        },
        RNTPrimerHeadlessUniversalCheckoutBanksComponent: {
          configure: jest.fn().mockResolvedValue(undefined),
          start: jest.fn(),
          submit: jest.fn(),
          onBankFilterChange: jest.fn(),
          onBankSelected: jest.fn(),
        },
      },
      NativeEventEmitter: jest.fn().mockImplementation(() => ({
        addListener: mockAddListener,
        removeAllListeners: mockRemoveAllListeners,
      })),
      __mockAddListener: mockAddListener,
      __mockRemoveAllListeners: mockRemoveAllListeners,
    };
  },
  { virtual: true }
);

import { PrimerHeadlessUniversalCheckoutAchManager } from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchManager';
import { PrimerHeadlessUniversalCheckoutComponentWithRedirectManager } from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/ComponentWithRedirectManager';

type RnMock = { __mockAddListener: jest.Mock; __mockRemoveAllListeners: jest.Mock };
const { __mockAddListener: mockAddListener, __mockRemoveAllListeners: mockRemoveAllListeners } =
  require('react-native') as RnMock;

const callbacks = () => ({
  onStep: jest.fn(),
  onError: jest.fn(),
  onInvalid: jest.fn(),
  onValid: jest.fn(),
  onValidating: jest.fn(),
  onValidationError: jest.fn(),
});

type TeardownCapable = {
  provide(props: { paymentMethodType: string } & ReturnType<typeof callbacks>): Promise<unknown>;
  removeAllListeners(): void;
};

describe.each<[string, string, () => TeardownCapable]>([
  ['AchManager', 'STRIPE_ACH', () => new PrimerHeadlessUniversalCheckoutAchManager()],
  [
    'ComponentWithRedirectManager',
    'ADYEN_IDEAL',
    () => new PrimerHeadlessUniversalCheckoutComponentWithRedirectManager(),
  ],
])('%s.removeAllListeners — ESC-1131', (_name, paymentMethodType, makeManager) => {
  let created: Array<{ remove: jest.Mock }>;

  beforeEach(() => {
    jest.clearAllMocks();
    created = [];
    mockAddListener.mockImplementation(() => {
      const subscription = { remove: jest.fn() };
      created.push(subscription);
      return subscription;
    });
  });

  it('removes exactly the subscriptions this instance registered, never by event name', async () => {
    const manager = makeManager();
    await manager.provide({ paymentMethodType, ...callbacks() });
    expect(created).toHaveLength(6);

    manager.removeAllListeners();

    created.forEach((subscription) => expect(subscription.remove).toHaveBeenCalledTimes(1));
    expect(mockRemoveAllListeners).not.toHaveBeenCalled();
  });

  it('a second provide() drains the first one instead of stacking a duplicate listener set', async () => {
    const manager = makeManager();
    await manager.provide({ paymentMethodType, ...callbacks() });
    await manager.provide({ paymentMethodType, ...callbacks() });

    expect(created).toHaveLength(12);
    const live = created.filter((subscription) => subscription.remove.mock.calls.length === 0);
    expect(live).toHaveLength(6);
  });

  it('concurrent provide() calls leave every subscription tracked and removable', async () => {
    const manager = makeManager();
    await Promise.all([
      manager.provide({ paymentMethodType, ...callbacks() }),
      manager.provide({ paymentMethodType, ...callbacks() }),
    ]);

    manager.removeAllListeners();

    created.forEach((subscription) => expect(subscription.remove).toHaveBeenCalled());
  });

  it('a second removeAllListeners() removes nothing more', async () => {
    const manager = makeManager();
    await manager.provide({ paymentMethodType, ...callbacks() });

    manager.removeAllListeners();
    manager.removeAllListeners();

    created.forEach((subscription) => expect(subscription.remove).toHaveBeenCalledTimes(1));
  });
});
