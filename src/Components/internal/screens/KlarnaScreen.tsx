import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import type { NativeSyntheticEvent, TextStyle } from 'react-native';

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
import { PrimerButton } from '../ui/PrimerButton';
import { useSheetHeight } from '../checkout-sheet';
import { CONTENT_HEIGHT as LOADING_CONTENT_HEIGHT } from './LoadingScreen';
import { useBottomSafeArea } from './useBottomSafeArea';

// CheckoutSheet drag-handle chrome above our content: paddingTop(12) + handle(4) + paddingBottom(4).
const DRAG_HANDLE_AREA = 20;
// Matches CheckoutSheet's DEFAULT_HEIGHT_RATIO — the sheet never exceeds 92% of the screen.
const MAX_SHEET_HEIGHT_RATIO = 0.92;
// NavigationHeader with a centred title is only its 24 back row; Android onLayout can report 0 for the wrapper.
const HEADER_FALLBACK_HEIGHT = 24;

const checkIcon = require('./assets/check.png');
const klarnaBadge = require('./assets/klarna-badge.png');

const KLARNA_HEIGHT_TIMEOUT_MS = 1500;
const KLARNA_FALLBACK_HEIGHT = 250;
const KLARNA_RETRY_AFTER_MS = 3000;

function useKlarnaWidgetHeight(loadedViewKey: string | null) {
  const [state, setState] = useState({ viewKey: loadedViewKey, height: 0 });
  if (state.viewKey !== loadedViewKey) {
    setState({ viewKey: loadedViewKey, height: 0 });
  }

  useEffect(() => {
    if (loadedViewKey == null) return;
    const timer = setTimeout(
      () =>
        setState((s) => (s.viewKey === loadedViewKey && s.height === 0 ? { ...s, height: KLARNA_FALLBACK_HEIGHT } : s)),
      KLARNA_HEIGHT_TIMEOUT_MS
    );
    return () => clearTimeout(timer);
  }, [loadedViewKey]);

  const onContentHeightChange = useCallback(
    (e: NativeSyntheticEvent<{ height: number }>) => {
      const height = Math.ceil(e.nativeEvent.height);
      if (height <= 0) return;
      setState((s) => (s.viewKey === loadedViewKey && s.height !== height ? { ...s, height } : s));
    },
    [loadedViewKey]
  );

  return { height: state.viewKey === loadedViewKey ? state.height : 0, onContentHeightChange };
}

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
  const start = klarna?.start;

  const loadedViewKey = klarna?.isViewLoaded ? klarna.selectedCategoryId : null;
  const widget = useKlarnaWidgetHeight(loadedViewKey);
  const isOptionReady = widget.height > 0;

  const lastSelection = useRef<{ categoryId: string; at: number } | null>(null);

  // Measured so the sheet shrinks to fit content (92% is just the cap), mirroring CardFormScreen.
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const bottomInsetClamped = Math.max(bottomInset, tokens.spacing.large);
  const loadingSheetHeight = LOADING_CONTENT_HEIGHT + bottomInsetClamped;

  // Start the Klarna session on mount (fetches the payment categories).
  useEffect(() => {
    void start?.();
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

  // Defensive: this screen is only routed to for Klarna.
  if (!klarna) {
    return null;
  }

  const { paymentCategories, selectedCategoryId, isViewLoaded, isLoading, selectCategory, authorize } = klarna;
  // Gate on categories, not isLoading (still false on the first render → 1-frame empty flash).
  const isInitialLoading = paymentCategories.length === 0;

  const handleSelect = (categoryId: string) => {
    if (categoryId === selectedCategoryId) {
      if (isViewLoaded) return;
      const last = lastSelection.current;
      if (last?.categoryId === categoryId && Date.now() - last.at < KLARNA_RETRY_AFTER_MS) return;
    }
    lastSelection.current = { categoryId, at: Date.now() };
    selectCategory(categoryId);
  };

  const handleAuthorize = () => {
    if (!isOptionReady || isLoading) return;
    // Jump to processing; PaymentOutcomeTransitioner navigates away once the outcome arrives.
    replace(CheckoutRoute.processing);
    void authorize().catch(() => {});
  };

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
              title={t('primer_vault_default_klarna')}
              titleAlignment="center"
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
            {paymentCategories.map((category) => {
              const selected = category.identifier === selectedCategoryId;
              return (
                <View key={category.identifier} style={[styles.categoryCard, selected && styles.categoryCardSelected]}>
                  <TouchableOpacity
                    onPress={() => handleSelect(category.identifier)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={t(
                      selected ? 'accessibility_klarna_category_selected' : 'accessibility_klarna_category',
                      { categoryName: category.name }
                    )}
                    style={styles.categoryHeader}
                  >
                    <Image
                      source={klarnaBadge}
                      style={styles.badge}
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                    {selected && (
                      <View
                        style={styles.trailing}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                      >
                        {isOptionReady ? (
                          <Image source={checkIcon} style={styles.checkIcon} resizeMode="contain" />
                        ) : (
                          <ActivityIndicator size="small" color={tokens.colors.loader} />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                  {/* Outside the touchable: on Android a tap on it goes to its parent and re-selects. */}
                  {selected && isViewLoaded && (
                    <PrimerKlarnaPaymentView
                      style={[styles.klarnaView, { height: widget.height }, isOptionReady && styles.klarnaViewExpanded]}
                      onContentHeightChange={widget.onContentHeightChange}
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>
          {paymentCategories.length > 0 && (
            <View
              onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
              style={[styles.footer, { paddingBottom: bottomInsetClamped }]}
            >
              <PrimerButton
                title={t('primer_klarna_button_authorize')}
                onPress={handleAuthorize}
                variant="primary"
                loading={isLoading}
                disabled={!isOptionReady}
                accessibilityLabel={t('accessibility_payment_selection_pay_with_klarna')}
                accessibilityHint={t('accessibility_klarna_authorize_hint')}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, sizes, spacing, typography, widths } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    badge: {
      height: sizes.large,
      width: sizes.xxxlarge,
    },
    categoryCard: {
      borderColor: colors.borderOutlinedDefault,
      borderRadius: radii.medium,
      borderWidth: widths.default,
      padding: spacing.medium - widths.default,
    },
    categoryCardSelected: {
      borderColor: colors.borderOutlinedSelected,
      borderWidth: widths.selected,
      padding: spacing.medium - widths.selected,
    },
    categoryHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.medium,
      minHeight: sizes.xxlarge,
    },
    categoryName: {
      color: colors.textPrimary,
      flex: 1,
      fontFamily: typography.bodyLarge.fontFamily,
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: typography.bodyLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyLarge.letterSpacing,
      lineHeight: typography.bodyLarge.lineHeight,
    },
    checkIcon: {
      height: sizes.medium,
      tintColor: colors.brand,
      width: sizes.medium,
    },
    footer: {
      backgroundColor: colors.backgroundPrimary,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.small,
    },
    klarnaView: {
      width: '100%',
    },
    klarnaViewExpanded: {
      marginTop: spacing.medium,
    },
    loadingContainer: {
      justifyContent: 'center',
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
    trailing: {
      alignItems: 'center',
      height: sizes.medium,
      justifyContent: 'center',
      width: sizes.medium,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
