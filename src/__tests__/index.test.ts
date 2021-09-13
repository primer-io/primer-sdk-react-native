import { NativeModules } from 'react-native';
import { PrimerNativeMapping } from '../Primer';

jest.mock('react-native', () => {
  return {
    NativeModules: {
      PrimerRN: {
        init: jest.fn(),
        fetchSavedPaymentInstruments: jest.fn(),
        dispose: jest.fn(),
        configureSettings: jest.fn(),
        configureTheme: jest.fn(),
        configureFlow: jest.fn(),
        configureOnVaultSuccess: jest.fn(),
        configureOnDismiss: jest.fn(),
        configureOnPrimerError: jest.fn(),
        configureOnTokenizeSuccess: jest.fn(),
      },
    },
  };
});

describe('Test Primer', () => {
  describe('init', () => {
    it('should call native module configureSettings', () => {
      expect(NativeModules.PrimerRN.configureSettings).toHaveBeenCalled();
    });

    it('should call native module configureTheme', () => {
      expect(NativeModules.PrimerRN.configureTheme).toHaveBeenCalled();
    });

    it('should call native module configureFlow', () => {
      expect(NativeModules.PrimerRN.configureFlow).toHaveBeenCalled();
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

    it('should call native module init', () => {
      expect(NativeModules.PrimerRN.init).toHaveBeenCalled();
    });
  });

  describe('fetchSavedPaymentInstruments', () => {
    it('should call native module fetchSavedPaymentInstruments & pass in callback', () => {
      const callback = () => {};
      PrimerNativeMapping.fetchSavedPaymentInstruments('token', {});
      expect(
        NativeModules.PrimerRN.fetchSavedPaymentInstruments
      ).toHaveBeenCalledWith(callback);
    });
  });

  describe('dispose', () => {
    it('should call native module dispose & pass in callback', () => {
      PrimerNativeMapping.dispose();
      expect(NativeModules.PrimerRN.dispose).toHaveBeenCalled();
    });
  });
});
