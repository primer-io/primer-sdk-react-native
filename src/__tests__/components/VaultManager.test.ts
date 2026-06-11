jest.mock(
  'react-native',
  () => ({
    NativeModules: {
      RNPrimerHeadlessUniversalCheckoutVaultManager: {
        configure: jest.fn().mockResolvedValue(undefined),
        fetchVaultedPaymentMethods: jest.fn(),
        deleteVaultedPaymentMethod: jest.fn(),
        validate: jest.fn(),
        startPaymentFlow: jest.fn(),
        startPaymentFlowWithAdditionalData: jest.fn(),
        requiresVaultedCardCvv: jest.fn(),
      },
    },
  }),
  { virtual: true }
);

import VaultManager from '../../HeadlessUniversalCheckout/Managers/VaultManager';

const rnMock = require('react-native');
const native = rnMock.NativeModules.RNPrimerHeadlessUniversalCheckoutVaultManager;

beforeEach(() => {
  for (const key of Object.keys(native)) {
    (native[key] as jest.Mock).mockClear();
  }
});

describe('VaultManager.requiresVaultedCardCvv', () => {
  it('resolves the boolean from the native bridge (true)', async () => {
    native.requiresVaultedCardCvv.mockResolvedValueOnce(true);
    const vm = new VaultManager();
    await expect(vm.requiresVaultedCardCvv()).resolves.toBe(true);
    expect(native.requiresVaultedCardCvv).toHaveBeenCalledTimes(1);
  });

  it('resolves the boolean from the native bridge (false)', async () => {
    native.requiresVaultedCardCvv.mockResolvedValueOnce(false);
    const vm = new VaultManager();
    await expect(vm.requiresVaultedCardCvv()).resolves.toBe(false);
  });

  it('propagates native rejection', async () => {
    const err = { errorId: 'NATIVE_BRIDGE_FAILED', description: 'bridge failed' };
    native.requiresVaultedCardCvv.mockRejectedValueOnce(err);
    const vm = new VaultManager();
    await expect(vm.requiresVaultedCardCvv()).rejects.toEqual(err);
  });
});

describe('VaultManager.startPaymentFlow', () => {
  it('routes to startPaymentFlow without additional data when none is supplied', async () => {
    native.startPaymentFlow.mockResolvedValueOnce(undefined);
    const vm = new VaultManager();
    await vm.startPaymentFlow('vault-1');
    expect(native.startPaymentFlow).toHaveBeenCalledWith('vault-1');
    expect(native.startPaymentFlowWithAdditionalData).not.toHaveBeenCalled();
  });

  it('routes to startPaymentFlowWithAdditionalData when additional data is supplied', async () => {
    native.startPaymentFlowWithAdditionalData.mockResolvedValueOnce(undefined);
    const vm = new VaultManager();
    await vm.startPaymentFlow('vault-1', { cvv: '123' });
    expect(native.startPaymentFlowWithAdditionalData).toHaveBeenCalledWith('vault-1', JSON.stringify({ cvv: '123' }));
    expect(native.startPaymentFlow).not.toHaveBeenCalled();
  });
});
