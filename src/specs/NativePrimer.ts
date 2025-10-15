import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EmittedEvent = {
  eventType: string;
  data: string;
};

export interface Spec extends TurboModule {
  configure(settings?: string): Promise<void>;

  // Checkout methods
  showUniversalCheckoutWithClientToken(clientToken: string): Promise<void>;
  showVaultManagerWithClientToken(clientToken: string): Promise<void>;
  showPaymentMethod(paymentMethod: string, intent: string, clientToken: string): Promise<void>;
  // Cleanup
  dismiss(): Promise<void>;
  cleanUp(): Promise<void>;

  // Tokenization handlers
  handleTokenizationNewClientToken(newClientToken: string): Promise<void>;
  handleTokenizationSuccess(): Promise<void>;
  handleTokenizationFailure(errorMessage: string): Promise<void>;

  // Resume handlers
  handleResumeWithNewClientToken(newClientToken: string): Promise<void>;
  handleResumeSuccess(): Promise<void>;
  handleResumeFailure(errorMessage: string): Promise<void>;

  // Payment creation handlers
  handlePaymentCreationAbort(errorMessage: string): Promise<void>;
  handlePaymentCreationContinue(): Promise<void>;

  // Error handling
  showErrorMessage(errorMessage: string): Promise<void>;

  setImplementedRNCallbacks(implementedRNCallbacks: string): Promise<void>;

  readonly onEvent: CodegenTypes.EventEmitter<EmittedEvent>;
}

// module name (NativePrimer) must be same in RCTNativePrimer.mm when exporting
export default TurboModuleRegistry.getEnforcing<Spec>('NativePrimer');
