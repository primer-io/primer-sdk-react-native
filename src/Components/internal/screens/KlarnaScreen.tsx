import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import type { TextStyle } from 'react-native';

import { PrimerKlarnaPaymentView } from '../../../HeadlessUniversalCheckout/Components/PrimerKlarnaPaymentView';
import { usePrimerPaymentMethod } from '../../hooks/usePrimerPaymentMethod';
import { PrimerLoadingScreen } from '../../status';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { usePrimerLocalization } from '../localization';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { CheckoutRoute } from '../navigation/types';
import { useNavigation } from '../navigation/useNavigation';
import { useRoute } from '../navigation/useRoute';
import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { useSheetHeight } from '../checkout-sheet';
import { useBottomSafeArea } from './useBottomSafeArea';

// CheckoutSheet drag-handle chrome above our content: paddingTop(12) + handle(4) + paddingBottom(4).
const DRAG_HANDLE_AREA = 20;
// Matches CheckoutSheet's DEFAULT_HEIGHT_RATIO — the sheet never exceeds 92% of the screen.
const MAX_SHEET_HEIGHT_RATIO = 0.92;
// Compact initial height (matches LoadingScreen) so the sheet doesn't open at 92% then snap down.
const LOADING_CONTENT_HEIGHT = 246;
// NavigationHeader: 24+16+32; Android onLayout can report 0 for the wrapper, so fall back to this.
const HEADER_FALLBACK_HEIGHT = 72;

// Prebuilt Klarna screen: session → categories → embedded Klarna view → authorize (auto-finalized).
export function KlarnaScreen() {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const { params } = useRoute<CheckoutRoute.klarna>();
  const { pop, replace, canGoBack } = useNavigation();
  const { onCancel } = useCheckoutFlow();
  const bottomInset = useBottomSafeArea();
  const { height: screenHeight } = useWindowDimensions();
  const { requestHeight } = useSheetHeight();

  const method = usePrimerPaymentMethod(params.paymentMethodType);
  const klarna = method.kind === 'klarna' ? method : null;
  // This screen is only routed to for Klarna; the fallback keeps hooks unconditional if not.
  const { paymentCategories, selectedCategoryId, isViewLoaded, isLoading, start, selectCategory, authorize } =
    klarna ?? {
      paymentCategories: [],
      selectedCategoryId: null,
      isViewLoaded: false,
      isLoading: false,
      start: async () => {},
      selectCategory: (_id: string) => {},
      authorize: async () => {},
    };

  // Measured so the sheet shrinks to fit content (92% is just the cap), mirroring CardFormScreen.
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const bottomInsetClamped = Math.max(bottomInset, tokens.spacing.large);
  const loadingSheetHeight = LOADING_CONTENT_HEIGHT + bottomInsetClamped;
  // Gate on categories, not isLoading (still false on the first render → 1-frame empty flash).
  const isInitialLoading = paymentCategories.length === 0;

  // Start the Klarna session on mount (fetches the payment categories).
  useEffect(() => {
    void start();
  }, [start]);

  // Size to content once the scroll body measures; until then hold the compact loading height.
  useEffect(() => {
    if (scrollContentHeight === 0) {
      return requestHeight(loadingSheetHeight);
    }
    const headerPx = headerHeight > 0 ? headerHeight : HEADER_FALLBACK_HEIGHT;
    const desired = DRAG_HANDLE_AREA + headerPx + scrollContentHeight + footerHeight;
    const cap = screenHeight * MAX_SHEET_HEIGHT_RATIO;
    const target = Math.min(desired, cap);
    return requestHeight(target);
  }, [headerHeight, scrollContentHeight, footerHeight, screenHeight, loadingSheetHeight, requestHeight]);

  const handleAuthorize = () => {
    if (!isViewLoaded || isLoading) return;
    // Jump to processing; PaymentOutcomeTransitioner navigates away once the outcome arrives.
    replace(CheckoutRoute.processing);
    void authorize().catch(() => {});
  };

  // Disabled until the embedded view is ready; spins while it builds or an authorize is in flight.
  const showButtonSpinner = (selectedCategoryId != null && !isViewLoaded) || isLoading;

  return (
    <View style={styles.root}>
      {isInitialLoading ? (
        <View style={[styles.loadingContainer, { height: loadingSheetHeight, paddingBottom: bottomInsetClamped }]}>
          <PrimerLoadingScreen
            title={t('primer_checkout_loading_indicator')}
            subtitle={t('primer_checkout_loading_subtitle')}
          />
        </View>
      ) : (
        <>
          {/* collapsable={false}: a style-less wrapper gets view-flattened on Android, so its onLayout
              reports 0 — which collapsed the sheet height. Keep it in the native tree to measure. */}
          <View collapsable={false} onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
            <NavigationHeader
              title={t('primer_checkout_title')}
              showBackButton={canGoBack}
              backLabel={t('primer_common_back')}
              onBackPress={pop}
              rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
            />
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={(_, h) => setScrollContentHeight(h)}
          >
            <Text style={styles.description}>{t('primer_klarna_select_category_description')}</Text>
            {paymentCategories.map((category) => {
              const selected = category.identifier === selectedCategoryId;
              return (
                <TouchableOpacity
                  key={category.identifier}
                  onPress={() => {
                    selectCategory(category.identifier);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={t(
                    selected ? 'accessibility_klarna_category_selected' : 'accessibility_klarna_category',
                    { categoryName: category.name }
                  )}
                  style={[styles.categoryRow, selected && styles.categoryRowSelected]}
                >
                  <View style={[styles.radioCircle, selected && styles.radioCircleSelected]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              );
            })}
            {isViewLoaded && <PrimerKlarnaPaymentView style={styles.klarnaView} />}
          </ScrollView>
          {paymentCategories.length > 0 && (
            <View
              onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
              style={[styles.footer, { paddingBottom: bottomInsetClamped }]}
            >
              <TouchableOpacity
                onPress={handleAuthorize}
                disabled={!isViewLoaded || isLoading}
                activeOpacity={0.7}
                style={[styles.payButton, (!isViewLoaded || isLoading) && styles.payButtonDisabled]}
                accessibilityRole="button"
                accessibilityLabel={t('accessibility_payment_selection_pay_with_klarna')}
                accessibilityHint={t('accessibility_klarna_authorize_hint')}
                accessibilityState={{ disabled: !isViewLoaded || isLoading, busy: showButtonSpinner }}
              >
                {showButtonSpinner ? (
                  <ActivityIndicator color={tokens.colors.background} />
                ) : (
                  <Text style={styles.payButtonText}>{t('primer_klarna_button_authorize')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, spacing, typography } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    categoryName: {
      color: colors.textPrimary,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
    },
    categoryRow: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: radii.medium,
      borderWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: spacing.medium,
      minHeight: 56,
      padding: spacing.medium,
    },
    categoryRowSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    description: {
      color: colors.textSecondary,
      fontFamily: typography.bodyMedium.fontFamily,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight as TextStyle['fontWeight'],
      lineHeight: typography.bodyMedium.lineHeight,
    },
    footer: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.small,
    },
    klarnaView: {
      minHeight: 250,
      width: '100%',
    },
    loadingContainer: {
      justifyContent: 'center',
    },
    payButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radii.medium,
      justifyContent: 'center',
      minHeight: 44,
      padding: spacing.medium,
      width: '100%',
    },
    payButtonDisabled: {
      opacity: 0.5,
    },
    payButtonText: {
      color: colors.background,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
      textAlign: 'center',
    },
    radioCircle: {
      borderColor: colors.primary,
      borderRadius: 10,
      borderWidth: 2,
      height: 20,
      width: 20,
    },
    radioCircleSelected: {
      backgroundColor: colors.primary,
    },
    root: {
      flex: 1,
    },
    scrollContent: {
      gap: spacing.small,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.large,
    },
    scrollView: {
      flex: 1,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
