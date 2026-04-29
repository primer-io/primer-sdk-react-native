jest.mock(
  'react-native',
  () => {
    const mockAddListener = jest.fn().mockImplementation(() => ({ remove: jest.fn() }));
    return {
      NativeModules: {
        RNTPrimerHeadlessUniversalCheckoutKlarnaComponent: {
          configure: jest.fn().mockResolvedValue(undefined),
          start: jest.fn(),
          submit: jest.fn(),
          onSetPaymentOptions: jest.fn(),
          onFinalizePayment: jest.fn(),
          cleanUp: jest.fn().mockResolvedValue(undefined),
        },
      },
      NativeEventEmitter: jest.fn().mockImplementation(() => ({
        addListener: mockAddListener,
        removeAllListeners: jest.fn(),
      })),
      __mockAddListener: mockAddListener,
    };
  },
  { virtual: false }
);

import { NativeModules } from 'react-native';
import { PrimerHeadlessUniversalCheckoutKlarnaManager as KlarnaManager } from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager';
import { PrimerSessionIntent } from '../models/PrimerSessionIntent';

describe('KlarnaManager', () => {
  const mockNativeModule = (NativeModules as any)
    .RNTPrimerHeadlessUniversalCheckoutKlarnaComponent;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockAddListener = (require('react-native') as any).__mockAddListener;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseProps = {
    primerSessionIntent: PrimerSessionIntent.CHECKOUT,
    onStep: jest.fn(),
    onError: jest.fn(),
    onInvalid: jest.fn(),
    onValid: jest.fn(),
    onValidating: jest.fn(),
    onValidationError: jest.fn(),
  };

  it('exposes cleanUp on the returned KlarnaComponent and forwards to the native module', async () => {
    const manager = new KlarnaManager();
    const component = await manager.provide(baseProps as any);
    expect(typeof component.cleanUp).toBe('function');

    await component.cleanUp();
    expect(mockNativeModule.cleanUp).toHaveBeenCalledTimes(1);
  });

  it('cleanUp drains every JS subscription registered by configureListeners', async () => {
    const removeSpies: jest.Mock[] = [];
    mockAddListener.mockImplementation(() => {
      const remove = jest.fn();
      removeSpies.push(remove);
      return { remove };
    });

    const manager = new KlarnaManager();
    const component = await manager.provide(baseProps as any);

    expect(removeSpies).toHaveLength(6);
    removeSpies.forEach((remove) => expect(remove).not.toHaveBeenCalled());

    await component.cleanUp();
    removeSpies.forEach((remove) => expect(remove).toHaveBeenCalledTimes(1));
  });

  it('calling provide() twice on the same instance drains the prior subscriptions', async () => {
    const removeSpies: jest.Mock[] = [];
    mockAddListener.mockImplementation(() => {
      const remove = jest.fn();
      removeSpies.push(remove);
      return { remove };
    });

    const manager = new KlarnaManager();
    await manager.provide(baseProps as any);
    expect(removeSpies).toHaveLength(6);
    removeSpies.forEach((remove) => expect(remove).not.toHaveBeenCalled());

    await manager.provide(baseProps as any);
    // First batch should be drained before the second batch is registered.
    const firstBatch = removeSpies.slice(0, 6);
    firstBatch.forEach((remove) => expect(remove).toHaveBeenCalledTimes(1));
    expect(removeSpies).toHaveLength(12);
  });
});
