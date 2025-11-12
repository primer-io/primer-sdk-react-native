import type { ReactElement, ReactNode } from 'react';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import type {
  PrimerPaymentMethodAsset,
  PrimerPaymentMethodNativeView,
} from '../PrimerPaymentMethodResource';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../PrimerHeadlessUniversalCheckoutPaymentMethod';

/**
 * Merged payment method data combining availability and display information
 */
export interface PaymentMethodItem {
  /**
   * Payment method type identifier (e.g., "PAYMENT_CARD", "PAYPAL")
   */
  type: string;

  /**
   * Human-readable name for display
   */
  name: string;

  /**
   * Primary logo URL (colored or light fallback)
   */
  logo?: string;

  /**
   * Background color for the payment method button
   */
  backgroundColor?: string;

  /**
   * Whether this uses a native platform view
   */
  isNativeView: boolean;

  /**
   * Native view identifier (if isNativeView is true)
   */
  nativeViewName?: string;

  /**
   * Implementation categories (e.g., "NATIVE_UI", "RAW_DATA", "CARD_COMPONENTS")
   */
  categories: string[];

  /**
   * Supported session intents (e.g., "CHECKOUT", "VAULT")
   */
  intents: string[];

  /**
   * Full resource object for advanced customization
   */
  resource: PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView;

  /**
   * Full payment method object for technical details
   */
  paymentMethod: IPrimerHeadlessUniversalCheckoutPaymentMethod;
}

/**
 * Theme configuration for PaymentMethodList component
 */
export interface PaymentMethodListTheme {
  // Base colors
  primaryColor?: string; // Default: '#0066FF'
  backgroundColor?: string; // Default: '#FFFFFF'
  textColor?: string; // Default: '#000000'
  secondaryTextColor?: string; // Default: '#666666'

  // Border styling
  borderColor?: string; // Default: '#E0E0E0'
  borderWidth?: number; // Default: 1
  borderRadius?: number; // Default: 8

  // Item styling
  itemHeight?: number; // Default: 56
  itemSpacing?: number; // Default: 12
  itemPadding?: number; // Default: 16

  // Selected state
  selectedBorderColor?: string; // Default: primaryColor
  selectedBorderWidth?: number; // Default: 2

  // Disabled state
  disabledOpacity?: number; // Default: 0.5

  // Typography
  fontSize?: number; // Default: 16
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

  // Badge styling (for "Coming Soon")
  badgeBackgroundColor?: string; // Default: '#FFA500'
  badgeTextColor?: string; // Default: '#FFFFFF'
  badgeFontSize?: number; // Default: 12
}

/**
 * Props for PaymentMethodList component
 */
export interface PaymentMethodListProps {
  /**
   * Whitelist of payment method types to show
   * If provided, only these types will be displayed
   */
  include?: string[];

  /**
   * Blacklist of payment method types to hide
   * These types will be excluded from display
   */
  exclude?: string[];

  /**
   * Called when a payment method is pressed
   */
  onPaymentMethodPress?: (method: PaymentMethodItem) => void;

  /**
   * Called when payment methods finish loading
   */
  onPaymentMethodsLoad?: (methods: PaymentMethodItem[]) => void;

  /**
   * Theme configuration for styling
   */
  theme?: PaymentMethodListTheme;

  /**
   * Container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Style applied to each payment method item
   */
  itemStyle?: StyleProp<ViewStyle>;

  /**
   * Whether to show PAYMENT_CARD first in the list
   * @default true
   */
  showCardFirst?: boolean;

  /**
   * Whether to disable all payment methods
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show "Coming Soon" badge on non-PAYMENT_CARD methods
   * @default true
   */
  showComingSoonBadge?: boolean;

  /**
   * Custom render function for payment method items
   */
  renderItem?: (method: PaymentMethodItem, index: number) => ReactElement;

  /**
   * Component to render when no payment methods are available
   */
  ListEmptyComponent?: ReactElement;

  /**
   * Component to render at the top of the list
   */
  ListHeaderComponent?: ReactElement;

  /**
   * Component to render at the bottom of the list
   */
  ListFooterComponent?: ReactElement;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Props for PaymentMethodItem component
 */
export interface PaymentMethodItemProps {
  /**
   * Payment method data to display
   */
  paymentMethod: PaymentMethodItem;

  /**
   * Called when the item is pressed
   */
  onPress?: (method: PaymentMethodItem) => void;

  /**
   * Called when the item receives focus
   */
  onFocus?: (method: PaymentMethodItem) => void;

  /**
   * Called when the item loses focus
   */
  onBlur?: (method: PaymentMethodItem) => void;

  /**
   * Whether this item is currently selected
   */
  isSelected?: boolean;

  /**
   * Whether this item is disabled
   */
  disabled?: boolean;

  /**
   * Whether to show "Coming Soon" badge
   */
  showComingSoonBadge?: boolean;

  /**
   * Theme configuration
   */
  theme?: PaymentMethodListTheme;

  /**
   * Container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Label text style
   */
  labelStyle?: StyleProp<TextStyle>;

  /**
   * Badge style
   */
  badgeStyle?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Theme configuration for PaymentSummary component
 */
export interface PaymentSummaryTheme {
  // Colors
  backgroundColor?: string; // Default: '#F9FAFB'
  textColor?: string; // Default: '#000000'
  secondaryTextColor?: string; // Default: '#666666'
  primaryColor?: string; // Default: '#0066FF'

  // Border
  borderColor?: string; // Default: '#E0E0E0'
  borderWidth?: number; // Default: 0
  borderRadius?: number; // Default: 8

  // Spacing
  padding?: number; // Default: 16
  spacing?: number; // Default: 8

  // Typography
  amountFontSize?: number; // Default: 24
  amountFontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal'; // Default: 'bold'
  labelFontSize?: number; // Default: 14
  fontFamily?: string;
}

/**
 * Props for PaymentSummary component
 */
export interface PaymentSummaryProps {
  /**
   * Theme configuration
   */
  theme?: PaymentSummaryTheme;

  /**
   * Container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Whether to show line items breakdown
   * @default false
   */
  showLineItems?: boolean;

  /**
   * Custom label text (overrides default "Total Amount")
   */
  label?: string;

  /**
   * Optional amount in cents (overrides client session amount)
   * @example 15100 for €151.00
   */
  amount?: number;

  /**
   * Optional currency code (overrides client session currency)
   * @example 'EUR', 'USD', 'GBP'
   * @default 'EUR'
   */
  currencyCode?: string;

  /**
   * Custom content to render instead of default
   */
  children?: ReactNode;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Options for usePaymentMethodList hook
 */
export interface UsePaymentMethodListOptions {
  /**
   * Whitelist of payment method types to include
   */
  include?: string[];

  /**
   * Blacklist of payment method types to exclude
   */
  exclude?: string[];

  /**
   * Whether to show PAYMENT_CARD first in the list
   * @default true
   */
  showCardFirst?: boolean;

  /**
   * Called when payment methods finish loading
   */
  onLoad?: (methods: PaymentMethodItem[]) => void;
}

/**
 * Return value from usePaymentMethodList hook
 */
export interface UsePaymentMethodListReturn {
  /**
   * Filtered and formatted payment methods
   */
  paymentMethods: PaymentMethodItem[];

  /**
   * Whether payment methods are still loading
   */
  isLoading: boolean;

  /**
   * Error that occurred during loading
   */
  error: Error | null;

  /**
   * Currently selected payment method
   */
  selectedMethod: PaymentMethodItem | null;

  /**
   * Select a payment method
   */
  selectMethod: (method: PaymentMethodItem | null) => void;

  /**
   * Refresh payment methods from SDK
   */
  refreshMethods: () => Promise<void>;

  /**
   * Filter methods by category
   */
  filterByCategory: (category: string) => PaymentMethodItem[];

  /**
   * Filter methods by type
   */
  filterByType: (types: string[]) => PaymentMethodItem[];

  /**
   * Get a specific payment method by type
   */
  getMethodByType: (type: string) => PaymentMethodItem | undefined;
}
