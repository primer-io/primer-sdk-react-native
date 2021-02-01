import type { IUniversalCheckout, InitOptions } from './types';

export const UniversalCheckout: IUniversalCheckout = {
  /**
   * Initialize the iOS SDK
   * @param _options
   */
  initialize(_options: InitOptions): void {},

  /**
   * Show the checkout sheet
   */
  show(): void {},

  /**
   * Show the success screen
   */
  showSuccess(): void {},

  /**
   * Show the loadinng indicator
   * @param _visible
   */
  showProgressIndicator(_visible: boolean): void {},

  /**
   * Dismiss the sheet
   */
  dismiss(): void {},

  /**
   * Clean up any resources here
   */
  destroy(): void {},
};
