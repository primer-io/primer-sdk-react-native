import { NativeModules } from 'react-native';
import { PrimerNativeMapping } from '../Primer';

jest.mock('react-native', () => {
  return {
    NativeModules: {
      PrimerRN: {
        initialize: jest.fn(),
        resume: jest.fn(),
        fetchSavedPaymentInstruments: jest.fn(),
        dispose: jest.fn(),
        configureSettings: jest.fn(),
        configureTheme: jest.fn(),
        configureIntent: jest.fn(),
        configureOnVaultSuccess: jest.fn(),
        configureOnDismiss: jest.fn(),
        configureOnPrimerError: jest.fn(),
        configureOnTokenizeSuccess: jest.fn(),
      },
    },
  };
});

describe('Test Primer', () => {
  describe('showUniversalCheckout', () => {
    beforeAll(() => {
      PrimerNativeMapping.showUniversalCheckout('mock', {});
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call native module configureSettings', () => {
      expect(NativeModules.PrimerRN.configureSettings).toHaveBeenCalled();
    });

    it('should call native module configureTheme', () => {
      expect(NativeModules.PrimerRN.configureTheme).toHaveBeenCalled();
    });

    it('should call native module configureIntent', () => {
      expect(NativeModules.PrimerRN.configureIntent).toHaveBeenCalledWith(
        JSON.stringify({ vault: false, paymentMethod: 'Any' })
      );
    });

    it('should call native module configureOnVaultSuccess', () => {
      expect(NativeModules.PrimerRN.configureOnVaultSuccess).toHaveBeenCalled();
    });

    it('should call native module configureOnDismiss', () => {
      expect(NativeModules.PrimerRN.configureOnDismiss).toHaveBeenCalled();
    });

    it('should call native module configureOnPrimerError', () => {
      expect(NativeModules.PrimerRN.configureOnPrimerError).toHaveBeenCalled();
    });

    it('should call native module configureOnTokenizeSuccess', () => {
      expect(
        NativeModules.PrimerRN.configureOnTokenizeSuccess
      ).toHaveBeenCalled();
    });

    it('should call native module initialize', () => {
      expect(NativeModules.PrimerRN.initialize).toHaveBeenCalled();
    });
  });

  describe('showVaultManager', () => {
    beforeAll(() => {
      PrimerNativeMapping.showVaultManager('mock', {});
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call native module configureSettings', () => {
      expect(NativeModules.PrimerRN.configureSettings).toHaveBeenCalled();
    });

    it('should call native module configureTheme', () => {
      expect(NativeModules.PrimerRN.configureTheme).toHaveBeenCalled();
    });

    it('should call native module configureIntent', () => {
      expect(NativeModules.PrimerRN.configureIntent).toHaveBeenCalledWith(
        JSON.stringify({ vault: true, paymentMethod: 'Any' })
      );
    });

    it('should call native module configureOnVaultSuccess', () => {
      expect(NativeModules.PrimerRN.configureOnVaultSuccess).toHaveBeenCalled();
    });

    it('should call native module configureOnDismiss', () => {
      expect(NativeModules.PrimerRN.configureOnDismiss).toHaveBeenCalled();
    });

    it('should call native module configureOnPrimerError', () => {
      expect(NativeModules.PrimerRN.configureOnPrimerError).toHaveBeenCalled();
    });

    it('should call native module configureOnTokenizeSuccess', () => {
      expect(
        NativeModules.PrimerRN.configureOnTokenizeSuccess
      ).toHaveBeenCalled();
    });

    it('should call native module initialize', () => {
      expect(NativeModules.PrimerRN.initialize).toHaveBeenCalled();
    });
  });

  describe('showPaymentMethod', () => {
    beforeAll(() => {
      PrimerNativeMapping.showPaymentMethod(
        'mock',
        { vault: true, paymentMethod: 'Card' },
        {}
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call native module configureSettings', () => {
      expect(NativeModules.PrimerRN.configureSettings).toHaveBeenCalled();
    });

    it('should call native module configureTheme', () => {
      expect(NativeModules.PrimerRN.configureTheme).toHaveBeenCalled();
    });

    it('should call native module configureIntent', () => {
      expect(NativeModules.PrimerRN.configureIntent).toHaveBeenCalledWith(
        JSON.stringify({ vault: true, paymentMethod: 'Card' })
      );
    });

    it('should call native module configureOnVaultSuccess', () => {
      expect(NativeModules.PrimerRN.configureOnVaultSuccess).toHaveBeenCalled();
    });

    it('should call native module configureOnDismiss', () => {
      expect(NativeModules.PrimerRN.configureOnDismiss).toHaveBeenCalled();
    });

    it('should call native module configureOnPrimerError', () => {
      expect(NativeModules.PrimerRN.configureOnPrimerError).toHaveBeenCalled();
    });

    it('should call native module configureOnTokenizeSuccess', () => {
      expect(
        NativeModules.PrimerRN.configureOnTokenizeSuccess
      ).toHaveBeenCalled();
    });

    it('should call native module initialize', () => {
      expect(NativeModules.PrimerRN.initialize).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should call native module dispose & pass in callback', () => {
      PrimerNativeMapping.dispose();
      expect(NativeModules.PrimerRN.dispose).toHaveBeenCalled();
    });
  });
});
