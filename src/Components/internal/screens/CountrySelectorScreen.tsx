import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ListRenderItemInfo, TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { useRoute } from '../navigation/useRoute';
import { CheckoutRoute } from '../navigation/types';
import { useLocalization } from '../localization';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { PrimerTextInput } from '../../inputs/PrimerTextInput';
import type { PrimerTextInputRef } from '../../types/CardInputTypes';
import { useBillingAddressForm } from '../../hooks/useBillingAddressForm';
import { COUNTRIES, type Country } from '../countries';
import { flagEmoji } from '../flags';

const ROW_HEIGHT = 44;

export function CountrySelectorScreen() {
  const tokens = useTheme();
  const { t } = useLocalization();
  const { pop, canGoBack } = useNavigation();
  const { onCancel } = useCheckoutFlow();
  const { params } = useRoute<CheckoutRoute.countrySelector>();
  const billingForm = useBillingAddressForm();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const initialSelected = params?.selectedCountryCode ?? '';
  const [query, setQuery] = useState('');
  const listRef = useRef<FlatList<Country>>(null);
  const searchRef = useRef<PrimerTextInputRef>(null);

  // Delay matches NavigationContainer's 250ms push animation — focusing sooner
  // opens the keyboard mid-slide and jumps the layout.
  useEffect(() => {
    const handle = setTimeout(() => searchRef.current?.focus(), 300);
    return () => clearTimeout(handle);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [query]);

  const initialScrollIndex = useMemo(() => {
    if (!initialSelected) return 0;
    const idx = filtered.findIndex((c) => c.code === initialSelected);
    return idx > 0 ? idx : 0;
  }, [initialSelected, filtered]);

  const handleSelect = useCallback(
    (code: string) => {
      billingForm.updateCountryCode(code);
      pop();
    },
    [billingForm, pop]
  );

  const handleClearSearch = useCallback(() => setQuery(''), []);

  const keyExtractor = useCallback((item: Country) => item.code, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Country>) => {
      const isSelected = item.code === initialSelected;
      return (
        <TouchableOpacity
          onPress={() => handleSelect(item.code)}
          activeOpacity={0.7}
          style={[styles.row, isSelected && styles.rowSelected]}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility_country_selection_item', { countryName: item.name })}
          accessibilityState={{ selected: isSelected }}
          testID={`primer-country-selector-row-${item.code}`}
        >
          <Text style={styles.flag} accessibilityElementsHidden>
            {flagEmoji(item.code)}
          </Text>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {item.name}
          </Text>
          {isSelected && (
            <Text style={styles.check} accessibilityElementsHidden>
              ✓
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [handleSelect, initialSelected, styles, t]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Country> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    []
  );

  const emptyState = (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{t('primer_country_no_results')}</Text>
    </View>
  );

  const searchClearButton =
    query.length > 0 ? (
      <TouchableOpacity
        onPress={handleClearSearch}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={t('accessibility_country_selection_clear')}
        testID="primer-country-selector-clear"
      >
        <Text style={styles.clear} accessibilityElementsHidden>
          ✕
        </Text>
      </TouchableOpacity>
    ) : null;

  return (
    <View style={styles.root}>
      <NavigationHeader
        title={t('primer_country_title')}
        showBackButton={canGoBack}
        backLabel={t('primer_common_back')}
        onBackPress={pop}
        rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
      />
      <View style={styles.searchWrapper}>
        <PrimerTextInput
          ref={searchRef}
          value={query}
          onChangeText={setQuery}
          label=""
          showLabel={false}
          placeholder={t('primer_country_placeholder_search')}
          autoCapitalize="none"
          autoComplete="off"
          trailingContent={searchClearButton}
          testID="primer-country-selector-search"
        />
      </View>
      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScrollIndex}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={emptyState}
      />
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, spacing, typography } = tokens;
  return StyleSheet.create({
    check: {
      color: colors.iconPrimary,
      fontSize: typography.bodyLarge.fontSize,
      marginLeft: spacing.small,
    },
    clear: {
      color: colors.textSecondary,
      fontSize: typography.bodyLarge.fontSize,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: spacing.xlarge,
    },
    emptyText: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamily,
      fontSize: typography.bodyLarge.fontSize,
    },
    flag: {
      fontSize: typography.bodyLarge.fontSize + 4,
      marginRight: spacing.small,
      minWidth: 28,
    },
    listContent: {
      paddingBottom: spacing.large,
      paddingHorizontal: spacing.large,
    },
    root: {
      flex: 1,
      paddingTop: spacing.large,
    },
    row: {
      alignItems: 'center',
      borderRadius: radii.small,
      flexDirection: 'row',
      height: ROW_HEIGHT,
      paddingHorizontal: spacing.medium,
    },
    rowLabel: {
      color: colors.textPrimary,
      flex: 1,
      fontFamily: typography.fontFamily,
      fontSize: typography.bodyLarge.fontSize,
      letterSpacing: typography.bodyLarge.letterSpacing,
      lineHeight: typography.bodyLarge.lineHeight,
    },
    rowSelected: {
      backgroundColor: colors.surface,
    },
    searchWrapper: {
      paddingBottom: spacing.medium,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.medium,
    },
  } satisfies Record<string, TextStyle | object>);
}
