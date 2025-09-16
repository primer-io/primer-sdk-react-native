import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EmittedEvent = {
  key: string,
  value: string,
}

export interface Spec extends TurboModule {

  configure(settings?: string): Promise<void>;
  
  // Checkout methods
  showUniversalCheckoutWithClientToken(clientToken: string): Promise<void>;
  showVaultManagerWithClientToken(clientToken: string): Promise<void>;
  
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

  readonly onEventSent: CodegenTypes.EventEmitter<EmittedEvent>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Primer');
