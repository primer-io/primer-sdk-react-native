type Listener = (data: object) => void;

type FakeSubscription = {
  eventType: string;
  listener: Listener;
  remove: () => void;
};

type CountedModule = {
  listenerCount: number;
  overRemovals: number;
  addListener: jest.Mock;
  removeListeners: jest.Mock;
};

type FakeNativeEventEmitter = {
  addListener(eventType: string, listener: Listener): FakeSubscription;
  removeAllListeners(eventType: string): void;
};

type RnMock = {
  NativeEventEmitter: new (nativeModule?: CountedModule) => FakeNativeEventEmitter;
  __registry: FakeSubscription[];
  __emit: (eventType: string, data: object) => void;
  __dropInModule: CountedModule & { dismiss: jest.Mock; setImplementedRNCallbacks: jest.Mock };
  __headlessModule: CountedModule & { cleanUp: jest.Mock };
  __hostModule: CountedModule;
};

jest.mock('../specs/NativePrimer', () => ({
  __esModule: true,
  default: {
    configure: jest.fn().mockResolvedValue(undefined),
    showUniversalCheckoutWithClientToken: jest.fn().mockResolvedValue(undefined),
    showVaultManagerWithClientToken: jest.fn().mockResolvedValue(undefined),
    showPaymentMethod: jest.fn().mockResolvedValue(undefined),
    dismiss: jest.fn().mockResolvedValue(undefined),
    cleanUp: jest.fn().mockResolvedValue(undefined),
    handleTokenizationNewClientToken: jest.fn(),
    handleTokenizationSuccess: jest.fn(),
    handleTokenizationFailure: jest.fn(),
    handleResumeWithNewClientToken: jest.fn(),
    handleResumeSuccess: jest.fn(),
    handleResumeFailure: jest.fn(),
    handlePaymentCreationAbort: jest.fn(),
    handlePaymentCreationContinue: jest.fn(),
    showErrorMessage: jest.fn(),
    setImplementedRNCallbacks: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock(
  'react-native',
  () => {
    const registry: FakeSubscription[] = [];

    const withListenerCounter = <T extends object>(base: T): T & CountedModule => {
      const counted = Object.assign(base, {
        listenerCount: 0,
        overRemovals: 0,
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      });
      counted.addListener.mockImplementation(() => {
        counted.listenerCount += 1;
      });
      counted.removeListeners.mockImplementation((count: number) => {
        if (count > counted.listenerCount) {
          counted.overRemovals += 1;
        }
        counted.listenerCount = Math.max(counted.listenerCount - count, 0);
      });
      return counted;
    };

    class NativeEventEmitter {
      private readonly nativeModule?: CountedModule;

      constructor(nativeModule?: CountedModule) {
        this.nativeModule = nativeModule;
      }

      addListener(eventType: string, listener: Listener): FakeSubscription {
        this.nativeModule?.addListener(eventType);
        let removed = false;
        const subscription: FakeSubscription = {
          eventType,
          listener,
          remove: () => {
            if (removed) {
              return;
            }
            removed = true;
            this.nativeModule?.removeListeners(1);
            const index = registry.indexOf(subscription);
            if (index !== -1) {
              registry.splice(index, 1);
            }
          },
        };
        registry.push(subscription);
        return subscription;
      }

      removeAllListeners(eventType: string): void {
        const globalCount = registry.filter((s) => s.eventType === eventType).length;
        this.nativeModule?.removeListeners(globalCount);
        for (let i = registry.length - 1; i >= 0; i--) {
          if (registry[i]?.eventType === eventType) {
            registry.splice(i, 1);
          }
        }
      }
    }

    const { default: nativePrimer } = jest.requireMock('../specs/NativePrimer');
    const dropInModule = withListenerCounter(nativePrimer);
    const headlessModule = withListenerCounter({
      startWithClientToken: jest.fn().mockResolvedValue({ availablePaymentMethods: [] }),
      cleanUp: jest.fn().mockResolvedValue(undefined),
      handleTokenizationNewClientToken: jest.fn().mockResolvedValue(undefined),
      handleResumeWithNewClientToken: jest.fn().mockResolvedValue(undefined),
      handleCompleteFlow: jest.fn().mockResolvedValue(undefined),
      handlePaymentCreationAbort: jest.fn().mockResolvedValue(undefined),
      handlePaymentCreationContinue: jest.fn().mockResolvedValue(undefined),
      setImplementedRNCallbacks: jest.fn().mockResolvedValue(undefined),
    });
    const hostModule = withListenerCounter({});

    return {
      NativeModules: {
        NativePrimer: dropInModule,
        PrimerHeadlessUniversalCheckout: headlessModule,
      },
      NativeEventEmitter,
      __registry: registry,
      __emit: (eventType: string, data: object) => {
        registry.filter((s) => s.eventType === eventType).forEach((s) => s.listener(data));
      },
      __dropInModule: dropInModule,
      __headlessModule: headlessModule,
      __hostModule: hostModule,
    };
  },
  { virtual: true }
);

import { Primer } from '../Primer';
import { PrimerHeadlessUniversalCheckout } from '../HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';

const rnMock = require('react-native') as RnMock;
const {
  __registry: registry,
  __emit: emit,
  __dropInModule: dropInModule,
  __headlessModule: headlessModule,
  __hostModule: hostModule,
} = rnMock;

const payloadError = { error: { errorId: 'native-err', description: 'boom' } };

const resetCounter = (module: CountedModule) => {
  module.listenerCount = 0;
  module.overRemovals = 0;
};

const lastImplementedCallbacks = (): Record<string, boolean> =>
  JSON.parse(dropInModule.setImplementedRNCallbacks.mock.lastCall?.[0] ?? '{}');

describe('Primer.dismiss / cleanUp listener teardown — ESC-1131', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registry.length = 0;
    [dropInModule, headlessModule, hostModule].forEach(resetCounter);
  });

  afterEach(async () => {
    Primer.dismiss();
    await PrimerHeadlessUniversalCheckout.cleanUp();
  });

  it('Drop-in only: dismiss() removes only Drop-in listeners and never touches the Headless native counter', async () => {
    await Primer.configure({ onError: jest.fn(), onCheckoutComplete: jest.fn() });
    await Primer.showUniversalCheckout('tok-1');
    expect(dropInModule.listenerCount).toBe(2);

    Primer.dismiss();

    expect(headlessModule.removeListeners).not.toHaveBeenCalled();
    expect(headlessModule.overRemovals).toBe(0);
    expect(dropInModule.overRemovals).toBe(0);
    expect(dropInModule.listenerCount).toBe(0);
    expect(registry).toHaveLength(0);
  });

  it.each<[string, () => void]>([
    ['dismiss', () => Primer.dismiss()],
    ['cleanUp', () => Primer.cleanUp()],
  ])(
    'callbacks from configure() survive %s(): the next showUniversalCheckout() re-registers them',
    async (_name, teardown) => {
      const onCheckoutComplete = jest.fn();
      await Primer.configure({ onCheckoutComplete });
      await Primer.showUniversalCheckout('tok-1');

      teardown();
      await Primer.showUniversalCheckout('tok-2');

      expect(lastImplementedCallbacks().onCheckoutComplete).toBe(true);
      emit('onCheckoutComplete', { payment: { id: 'pay_1' } });
      expect(onCheckoutComplete).toHaveBeenCalledTimes(1);
    }
  );

  it('a host-app listener on a shared event name survives dismiss()', async () => {
    const hostOnError = jest.fn();
    new rnMock.NativeEventEmitter(hostModule).addListener('onError', hostOnError);
    await Primer.configure({ onError: jest.fn() });
    await Primer.showUniversalCheckout('tok-1');

    Primer.dismiss();
    emit('onError', payloadError);

    expect(hostOnError).toHaveBeenCalledTimes(1);
    expect(hostModule.listenerCount).toBe(1);
  });

  it('back-to-back Headless starts do not stack listeners from the previous session', async () => {
    const onError = jest.fn();
    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-1', {
      headlessUniversalCheckoutCallbacks: { onError: jest.fn() },
    });
    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-2', {
      headlessUniversalCheckoutCallbacks: { onError },
    });

    emit('onError', payloadError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(headlessModule.listenerCount).toBe(1);
  });

  it('Headless then Drop-in: the stale Headless handler does not fire (ESC-852 still holds)', async () => {
    const headlessOnError = jest.fn();
    const dropInOnError = jest.fn();
    await PrimerHeadlessUniversalCheckout.startWithClientToken('tok-h', {
      headlessUniversalCheckoutCallbacks: { onError: headlessOnError },
    });
    expect(headlessModule.listenerCount).toBe(1);

    await Primer.configure({ onError: dropInOnError });
    await Primer.showUniversalCheckout('tok-d');
    emit('onError', payloadError);

    expect(dropInOnError).toHaveBeenCalledTimes(1);
    expect(headlessOnError).not.toHaveBeenCalled();
    expect(headlessModule.listenerCount).toBe(0);
    expect(headlessModule.overRemovals).toBe(0);
  });
});
