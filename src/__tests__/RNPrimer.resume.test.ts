jest.mock('../specs/NativePrimer', () => {
  const mockNativePrimer = {
    configure: jest.fn(),
    showUniversalCheckoutWithClientToken: jest.fn(),
    showVaultManagerWithClientToken: jest.fn(),
    showPaymentMethod: jest.fn(),
    dismiss: jest.fn(),
    cleanUp: jest.fn(),
    handleTokenizationNewClientToken: jest.fn(),
    handleTokenizationSuccess: jest.fn(),
    handleTokenizationFailure: jest.fn(),
    handleResumeWithNewClientToken: jest.fn(),
    handleResumeSuccess: jest.fn(),
    handleResumeFailure: jest.fn().mockResolvedValue(undefined),
    handlePaymentCreationAbort: jest.fn(),
    handlePaymentCreationContinue: jest.fn(),
    showErrorMessage: jest.fn(),
    handleSuccess: jest.fn(),
    setImplementedRNCallbacks: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockNativePrimer,
  };
});

jest.mock(
  'react-native',
  () => {
    const { default: mockNativePrimer } = jest.requireMock('../specs/NativePrimer');

    return {
      NativeModules: {
        NativePrimer: mockNativePrimer,
      },
      NativeEventEmitter: jest.fn().mockImplementation(() => ({
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
      })),
    };
  },
  { virtual: true }
);

import RNPrimer from '../RNPrimer';
import { NativeModules } from 'react-native';

describe('RNPrimer resume handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards resume failure to the native bridge', async () => {
    await RNPrimer.handleResumeFailure('resume-error');

    expect(NativeModules.NativePrimer.handleResumeFailure).toHaveBeenCalledTimes(1);
    expect(NativeModules.NativePrimer.handleResumeFailure).toHaveBeenCalledWith('resume-error');
  });

  it('normalises null error messages to an empty string', async () => {
    await RNPrimer.handleResumeFailure(null);

    expect(NativeModules.NativePrimer.handleResumeFailure).toHaveBeenCalledWith('');
  });
});
