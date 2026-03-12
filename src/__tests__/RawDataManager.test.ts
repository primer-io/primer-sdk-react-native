jest.mock(
  'react-native',
  () => {
    const mockAddListener = jest.fn().mockImplementation(() => ({ remove: jest.fn() }));
    return {
      NativeModules: {
        RNTPrimerHeadlessUniversalCheckoutRawDataManager: {
          configure: jest.fn().mockResolvedValue({ initializationData: {} }),
          listRequiredInputElementTypes: jest.fn().mockResolvedValue({ inputElementTypes: [] }),
          setRawData: jest.fn().mockResolvedValue(undefined),
          submit: jest.fn().mockResolvedValue(undefined),
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
  { virtual: true }
);

import RawDataManager from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/RawDataManager';

const rnMock = require('react-native');
const mockAddListener: jest.Mock = rnMock.__mockAddListener;
const nativeModule = rnMock.NativeModules.RNTPrimerHeadlessUniversalCheckoutRawDataManager;

describe('RawDataManager', () => {
  let manager: InstanceType<typeof RawDataManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddListener.mockImplementation(() => ({ remove: jest.fn() }));
    nativeModule.configure.mockResolvedValue({ initializationData: {} });
    manager = new RawDataManager();
  });

  describe('configure', () => {
    it('registers onBinDataChange listener when callback is provided', async () => {
      await manager.configure({
        paymentMethodType: 'PAYMENT_CARD',
        onBinDataChange: jest.fn(),
      });

      expect(mockAddListener).toHaveBeenCalledWith('onBinDataChange', expect.any(Function));
    });

    it('does not register onBinDataChange listener when callback is not provided', async () => {
      await manager.configure({
        paymentMethodType: 'PAYMENT_CARD',
      });

      const registeredEvents = mockAddListener.mock.calls.map((call: any[]) => call[0]);
      expect(registeredEvents).not.toContain('onBinDataChange');
    });

    it('forwards bin data to onBinDataChange callback', async () => {
      const onBinDataChange = jest.fn();

      await manager.configure({
        paymentMethodType: 'PAYMENT_CARD',
        onBinDataChange,
      });

      const binDataCall = mockAddListener.mock.calls.find((call: any[]) => call[0] === 'onBinDataChange');
      const listenerFn = binDataCall[1];

      const mockBinData = {
        preferred: { displayName: 'Visa', network: 'VISA' },
        alternatives: [],
        status: 'COMPLETE',
        firstDigits: '41111111',
      };

      listenerFn(mockBinData);

      expect(onBinDataChange).toHaveBeenCalledWith(mockBinData);
    });

    it('registers all three listeners when all callbacks provided', async () => {
      await manager.configure({
        paymentMethodType: 'PAYMENT_CARD',
        onMetadataChange: jest.fn(),
        onValidation: jest.fn(),
        onBinDataChange: jest.fn(),
      });

      const registeredEvents = mockAddListener.mock.calls.map((call: any[]) => call[0]);
      expect(registeredEvents).toContain('onMetadataChange');
      expect(registeredEvents).toContain('onValidation');
      expect(registeredEvents).toContain('onBinDataChange');
    });

    it('calls native configure with payment method type', async () => {
      await manager.configure({
        paymentMethodType: 'PAYMENT_CARD',
      });

      expect(nativeModule.configure).toHaveBeenCalledWith('PAYMENT_CARD');
    });
  });
});
